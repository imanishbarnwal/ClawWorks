import { ethers } from "ethers";

export interface WalletConnection {
    signer: ethers.JsonRpcSigner;
    address: string;
    chainId: number;
}

const MONAD_TESTNET_CHAIN_ID = 10143;
const MONAD_TESTNET_HEX = "0x4EAF"; // 10143 in hex

/**
 * Connects to the browser wallet (e.g., MetaMask, Rabby) using window.ethereum.
 * Enforces connection to Monad Testnet.
 */
export async function connectWallet(): Promise<WalletConnection> {
    if (typeof window === "undefined" || !(window as any).ethereum) {
        console.error("No wallet detected.");
        throw new Error("No wallet found. Please install MetaMask or Rabby.");
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum);

    try {
        console.log("Requesting accounts...");
        // 1. Request access
        const accounts = await provider.send("eth_requestAccounts", []);
        if (!accounts || accounts.length === 0) {
            throw new Error("User rejected connection request.");
        }

        const address = accounts[0];
        console.log("Connected account:", address);

        // 2. Check Network
        let network = await provider.getNetwork();
        let chainId = Number(network.chainId);
        console.log("Current Chain ID:", chainId);

        if (chainId !== MONAD_TESTNET_CHAIN_ID) {
            console.log(`Wrong network detected (${chainId}). Attempting switch to Monad Testnet (${MONAD_TESTNET_CHAIN_ID})...`);

            try {
                await provider.send("wallet_switchEthereumChain", [{ chainId: MONAD_TESTNET_HEX }]);
            } catch (switchError: any) {
                // This error code indicates that the chain has not been added to MetaMask.
                if (switchError.code === 4902) {
                    console.log("Monad Testnet not found. Attempting to add network...");
                    try {
                        await provider.send("wallet_addEthereumChain", [{
                            chainId: MONAD_TESTNET_HEX,
                            chainName: "Monad Testnet",
                            rpcUrls: ["https://testnet-rpc.monad.xyz/"],
                            nativeCurrency: {
                                name: "Monad",
                                symbol: "DMON",
                                decimals: 18
                            },
                            blockExplorerUrls: ["https://testnet.monadexplorer.com"]
                        }]);
                    } catch (addError) {
                        console.error("Failed to add Monad Testnet:", addError);
                        throw new Error("Could not add Monad Testnet to wallet.");
                    }
                } else {
                    console.error("Failed to switch network:", switchError);
                    throw new Error("Please switch your wallet to Monad Testnet.");
                }
            }

            // Re-fetch network after switch to confirm
            // Small delay to ensure provider updates
            await new Promise(r => setTimeout(r, 1000));
            network = await provider.getNetwork();
            chainId = Number(network.chainId);

            if (chainId !== MONAD_TESTNET_CHAIN_ID) {
                throw new Error("Network switch failed. Please manually switch to Monad Testnet.");
            }
        }

        console.log("Network confirmed: Monad Testnet");
        const signer = await provider.getSigner();

        return {
            signer,
            address,
            chainId
        };

    } catch (err: any) {
        console.error("Wallet Connection Failed:", err);
        throw err; // Re-throw for UI handling
    }
}
