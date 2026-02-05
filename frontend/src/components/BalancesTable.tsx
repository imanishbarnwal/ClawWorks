"use client";

import { useReadContracts } from 'wagmi';
import { formatUnits } from 'viem';
import { AGENT_REGISTRY, AGENT_IDS } from "@/lib/registry";
import { useEffect } from 'react';
import { ERC20_ABI, ROUTER_ABI, PROTOCOL_ROUTER_ADDRESS } from "@/lib/contracts";

// Helper to format balance to 2 decimal places
const formatBal = (val: string | undefined) => {
    if (!val) return "0.00";
    const num = parseFloat(val);
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export function BalancesTable() {
    // 1. Fetch Configuration from Router (Payment Token & Protocol Treasury Address)
    const routerConfig = useReadContracts({
        contracts: [
            {
                address: PROTOCOL_ROUTER_ADDRESS as `0x${string}`,
                abi: ROUTER_ABI as any, // Cast to any to avoid strict ABI typing issues with human-readable array
                functionName: 'paymentToken',
            },
            {
                address: PROTOCOL_ROUTER_ADDRESS as `0x${string}`,
                abi: ROUTER_ABI as any,
                functionName: 'protocolTreasury',
            }
        ]
    });

    const paymentToken = routerConfig.data?.[0].result as `0x${string}` | undefined;
    const protocolTreasury = routerConfig.data?.[1].result as `0x${string}` | undefined;

    // 1b. Fetch Token Metadata (Decimals & Symbol)
    const tokenConfig = useReadContracts({
        contracts: [
            {
                address: paymentToken,
                abi: ERC20_ABI as any,
                functionName: 'decimals',
            },
            {
                address: paymentToken,
                abi: ERC20_ABI as any,
                functionName: 'symbol',
            }
        ],
        query: {
            enabled: !!paymentToken
        }
    });

    const decimals = tokenConfig.data?.[0].result as number | undefined ?? 18;
    const symbol = tokenConfig.data?.[1].result as string | undefined ?? "AUSD";

    // 2. Prepare Balance Calls
    // We need balances for: All Agents + Protocol Treasury
    const agentAddresses = AGENT_IDS.map(id => AGENT_REGISTRY[id].treasury_address);
    // Add Protocol Treasury to the list of queries if available
    const targets = protocolTreasury ? [...agentAddresses, protocolTreasury] : agentAddresses;

    const { data: balanceData, isLoading: isBalLoading, isError: isBalError } = useReadContracts({
        contracts: targets.map(target => ({
            address: paymentToken,
            abi: ERC20_ABI as any,
            functionName: 'balanceOf',
            args: [target],
        })),
        query: {
            enabled: !!paymentToken && targets.length > 0,
            refetchInterval: 3000, // Auto-refresh every 3s
        }
    });

    const isLoading = routerConfig.isLoading || isBalLoading;
    const isError = routerConfig.isError || isBalError;

    // Debug logging
    useEffect(() => {
        if (routerConfig.data) {
            console.log("Read: Router Config", {
                paymentToken: routerConfig.data[0].result,
                protocolTreasury: routerConfig.data[1].result
            });
        }
        if (routerConfig.error) {
            console.error("Read Error: Router Config", routerConfig.error);
        }
    }, [routerConfig.data, routerConfig.error]);

    useEffect(() => {
        if (balanceData) {
            console.log("Read: Balances", balanceData);
        }
        if (isBalError) {
            console.error("Read Error: Balances", isBalError);
        }
    }, [balanceData, isBalError]);

    // Map results back to IDs
    const agentBalances: Record<string, string> = {};

    if (balanceData) {
        AGENT_IDS.forEach((id, index) => {
            const result = balanceData[index];
            if (result.status === 'success' && result.result) {
                // Use dynamic decimals
                agentBalances[id] = formatUnits(result.result as bigint, decimals);
            } else {
                agentBalances[id] = "0.0";
            }
        });
    }

    // Protocol Balance is the last item if we added it
    let protocolBalance = "0.0";
    if (protocolTreasury && balanceData && balanceData.length > AGENT_IDS.length) {
        const result = balanceData[AGENT_IDS.length];
        if (result.status === 'success' && result.result) {
            protocolBalance = formatUnits(result.result as bigint, decimals);
        }
    }

    return (
        <div className="w-full max-w-sm border border-gray-800 rounded-lg p-6 bg-gray-900/50 backdrop-blur-sm h-fit shadow-xl">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-blue-200">Live Treasuries</h3>
                {isLoading && <span className="text-xs text-blue-400 animate-pulse">Syncing...</span>}
            </div>

            {isError && (
                <div className="mb-4 p-2 bg-red-900/20 border border-red-800 rounded text-xs text-red-300">
                    Failed to load blockchain data. Switched to offline mode.
                </div>
            )}

            <div className={`space-y-3 text-sm ${isLoading && !balanceData ? 'opacity-50 blur-sm' : ''}`}>
                {AGENT_IDS.map((key) => {
                    const agent = AGENT_REGISTRY[key];
                    const rawBal = agentBalances[key];
                    return (
                        <div key={key} className="flex justify-between items-center border-b border-gray-800 pb-2 last:border-0 hover:bg-white/5 px-2 rounded transition-colors">
                            <div>
                                <div className="text-gray-300">{agent.token_name}</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-wider">{agent.role}</div>
                            </div>
                            <div className="font-mono text-emerald-400 font-medium">
                                {formatBal(rawBal)} <span className="text-xs text-gray-600">{symbol}</span>
                            </div>
                        </div>
                    );
                })}

                {/* Separator for Protocol Revenue */}
                <div className="border-t border-gray-700 my-2 pt-2">
                    <div className="flex justify-between items-center px-2">
                        <div className="text-yellow-500 font-semibold">Protocol Revenue</div>
                        <div className="font-mono text-yellow-400 font-bold">
                            {formatBal(protocolBalance)} <span className="text-xs text-yellow-700">{symbol}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
