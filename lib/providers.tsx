"use client";

import { useRouter } from "next/navigation"; // Correct import for App Router
import { DynamicContextProvider, DynamicUserProfile, FilterWallets } from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";

export default function DynamicWrapper({ children }: { children: React.ReactNode }) {
    const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID;

    if (!environmentId) {
        throw new Error("NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID is required");
    }

    return (
        <DynamicContextProvider
            settings={{
                environmentId,
                walletConnectors: [SolanaWalletConnectors],
                walletsFilter: FilterWallets(['phantom', 'solflare', 'okxsolana', 'backpacksol'])
            }}
        >
            {children}

             <DynamicUserProfile />
        </DynamicContextProvider>
    );
}
