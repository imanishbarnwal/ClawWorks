"use client";

import { createContext, useContext, ReactNode } from "react";
import { ethers } from "ethers";
import { useAccount } from 'wagmi';
import { useEthersSigner } from "@/lib/ethers-adapter";

interface WalletContextType {
    isConnected: boolean;
    address: string | null;
    signer: ethers.JsonRpcSigner | null;
    connectWallet: () => Promise<void>;
    error: string | null;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
    const { address, isConnected } = useAccount();
    const signer = useEthersSigner();

    // Legacy support for manual connection triggering (now handled by RainbowKit UI)
    const connectWallet = async () => {
        console.warn("Wallet connection is now handled by RainbowKit ConnectButton");
    };

    return (
        <WalletContext.Provider
            value={{
                isConnected,
                address: address || null,
                signer: signer || null,
                connectWallet,
                error: null
            }}
        >
            {children}
        </WalletContext.Provider>
    );
}

export function useWallet() {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error("useWallet must be used within a WalletProvider");
    }
    return context;
}
