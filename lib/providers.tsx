'use client';
import { DynamicContextProvider, DynamicWidget } from '@dynamic-labs/sdk-react-core';
import { SolanaWalletConnectors } from "@dynamic-labs/solana";


export default function DProviders({ children }: { children: React.ReactNode }) {
    return (
        <DynamicContextProvider
            settings={{
                environmentId: "94779e7d-5bac-4634-bed1-fdec1ba6da64",
                walletConnectors: [SolanaWalletConnectors],
            }}
        >
            {children}
            {/* <DynamicWidget /> */}
        </DynamicContextProvider>
    );
}