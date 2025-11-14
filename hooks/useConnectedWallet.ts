"use client";

import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { isSolanaWallet } from "@dynamic-labs/solana";
import { useCallback, useMemo } from "react";

export function useConnectedWallet() {
  const { primaryWallet, setShowAuthFlow, setShowDynamicUserProfile } =
    useDynamicContext();

  // Compute wallet only when it changes
  const solanaAddress = useMemo(() => {
    if (primaryWallet && isSolanaWallet(primaryWallet)) {
      return primaryWallet.address;
    }
    return null;
  }, [primaryWallet]);

  // Format address safely
  const formatAddress = useCallback((address: string) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }, []);

  // Handle clicking the connect button
  const connectWallet = useCallback(() => {
    console.log("Wallet Address:", solanaAddress);

    if (solanaAddress) {
      // If already connected → open profile sheet
      setShowDynamicUserProfile(true);
    } else {
      // If not connected → open connect modal
      setShowAuthFlow(true);
    }
  }, [solanaAddress, setShowAuthFlow, setShowDynamicUserProfile]);

  return {
    solanaAddress,
    connectWallet,
    formatAddress,
  };
}
