'use client';
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core';
import { SolanaWalletConnectors } from "@dynamic-labs/solana";


export default function DynamicAuthProvider({ children }: { children: React.ReactNode }) {

    const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID;


    if (!environmentId) {
        throw new Error('NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID is required');
    }


    return (
        <DynamicContextProvider
            settings={{
                environmentId,
                walletConnectors: [SolanaWalletConnectors],
            }}
        >
            {children}
        </DynamicContextProvider>
    );
}