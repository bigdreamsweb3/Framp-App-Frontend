"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isSolanaWallet } from "@dynamic-labs/solana";
import { useCallback, useMemo } from "react";

export function useConnectedWallet() {
  const { primaryWallet, setShowAuthFlow, setShowDynamicUserProfile } =
    useDynamicContext();

  const solanaAddress = useMemo(() => {
    if (primaryWallet && isSolanaWallet(primaryWallet)) {
      return primaryWallet.address;
    }
    return null;
  }, [primaryWallet]);

  const formatAddress = useCallback((address: string) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }, []);

  const connectWallet = useCallback(() => {
    console.log("Wallet Address:", solanaAddress);

    if (solanaAddress) {
      setShowDynamicUserProfile(true);
    } else {
      setShowAuthFlow(true);
    }
  }, [solanaAddress, setShowAuthFlow, setShowDynamicUserProfile]);

  return {
    solanaAddress,
    connectWallet,
    formatAddress,
  };
}
