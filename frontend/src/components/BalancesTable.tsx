"use client";

import { useEffect, useState } from "react";
import { ethers } from "ethers";
import { AGENT_REGISTRY, AGENT_IDS, AgentRoleKey } from "@/lib/registry";
import { ERC20_ABI, ROUTER_ABI, PROTOCOL_ROUTER_ADDRESS } from "@/lib/contracts";

// Helper to format balance to 2 decimal places
const formatBal = (val: string) => {
    const num = parseFloat(val);
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export function BalancesTable() {
    const [balances, setBalances] = useState<Record<string, string>>({});
    const [protocolBalance, setProtocolBalance] = useState<string>("0.0");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBalances = async () => {
            // 1. Check for Ethereum provider
            if (!window.ethereum) {
                // Silent return if no wallet, or show "Connect Wallet" state
                return;
            }

            // 2. Setup Provider
            const provider = new ethers.BrowserProvider(window.ethereum);

            // 3. Verify Router Address
            if (PROTOCOL_ROUTER_ADDRESS === "0x0000000000000000000000000000000000000000") {
                setError("Router Address not set in code.");
                return;
            }

            setIsLoading(true);
            try {
                const router = new ethers.Contract(PROTOCOL_ROUTER_ADDRESS, ROUTER_ABI, provider);

                // 4. Fetch Core Addresses from Router
                const ausdAddress = await router.paymentToken();
                const protocolTreasuryAddress = await router.protocolTreasury();

                // 5. Setup Token Contract
                const ausd = new ethers.Contract(ausdAddress, ERC20_ABI, provider);

                // 6. Fetch Protocol Treasury Balance
                const pBal = await ausd.balanceOf(protocolTreasuryAddress);
                setProtocolBalance(ethers.formatEther(pBal));

                // 7. Fetch Agent Balances
                const newBalances: Record<string, string> = {};

                // Use Promise.all for parallel fetching
                await Promise.all(AGENT_IDS.map(async (agentKey) => {
                    const agent = AGENT_REGISTRY[agentKey];
                    if (!agent.treasury_address) {
                        newBalances[agentKey] = "0.0";
                        return;
                    }
                    try {
                        const bal = await ausd.balanceOf(agent.treasury_address);
                        newBalances[agentKey] = ethers.formatEther(bal);
                    } catch (e) {
                        console.error(`Failed to fetch balance for ${agentKey}`, e);
                        newBalances[agentKey] = "Err";
                    }
                }));

                setBalances(newBalances);
                setError(null);

            } catch (err) {
                console.error("Error fetching blockchain data:", err);
                setError("Failed to load chain data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchBalances();
        // Poll every 5 seconds
        const interval = setInterval(fetchBalances, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-sm border border-gray-800 rounded-lg p-6 bg-gray-900/50 backdrop-blur-sm h-fit shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-blue-200">Live Treasuries</h3>
                {isLoading && <span className="text-xs text-blue-400 animate-pulse">Syncing...</span>}
            </div>

            {error && (
                <div className="mb-4 p-2 bg-red-900/20 border border-red-800 rounded text-xs text-red-300">
                    {error}
                </div>
            )}

            <div className="space-y-3 text-sm">
                {AGENT_IDS.map((key) => {
                    const agent = AGENT_REGISTRY[key];
                    const rawBal = balances[key] || "0.0";
                    return (
                        <div key={key} className="flex justify-between items-center border-b border-gray-800 pb-2 last:border-0 hover:bg-white/5 px-2 rounded transition-colors">
                            <div>
                                <div className="text-gray-300">{agent.token_name}</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">{agent.role}</div>
                            </div>
                            <div className="font-mono text-emerald-400 font-medium">
                                {formatBal(rawBal)} <span className="text-xs text-gray-600">AUSD</span>
                            </div>
                        </div>
                    );
                })}

                {/* Separator for Protocol Revenue */}
                <div className="border-t border-gray-700 my-2 pt-2">
                    <div className="flex justify-between items-center px-2">
                        <div className="text-yellow-500 font-semibold">Protocol Revenue</div>
                        <div className="font-mono text-yellow-400 font-bold">
                            {formatBal(protocolBalance)} <span className="text-xs text-yellow-700">AUSD</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
