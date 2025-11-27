  "use client";

import {
  useDynamicContext,
  useUserWallets,
} from "@dynamic-labs/sdk-react-core";
import { isSolanaWallet } from "@dynamic-labs/solana";
import { useCallback, useMemo } from "react";
import { getConnectedAddresses } from "@dynamic-labs-sdk/client";

export function useConnectedWallet() {
  const {
    primaryWallet,
    setShowDynamicUserProfile,
    setShowAuthFlow,
    removeWallet,
  } = useDynamicContext();

  const userWallets = useUserWallets();

  const walletProviderKey = primaryWallet?.connector.key;

  const isWalletConnected = !!primaryWallet;

  const getConnectedAddressesForWalletProvider = useCallback(async (): Promise
    string[] | null
  > => {
    if (!walletProviderKey) return null;

    try {
      const { addresses } = await getConnectedAddresses({ walletProviderKey });
      return addresses || [];
    } catch (err) {
      console.error("Error fetching connected addresses:", err);
      return null;
    }
  }, [walletProviderKey]);

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
    if (isWalletConnected) {
      setShowDynamicUserProfile(true);
    } else {
      setShowAuthFlow(true);
    }
  }, [isWalletConnected, setShowAuthFlow, setShowDynamicUserProfile]);

  const disconnectWallet = useCallback(
    async (walletId: string) => {
      try {
        await removeWallet(walletId);
        console.log("Wallet removed:", walletId);
      } catch (err) {
        console.error("Failed to remove wallet:", err);
      }
    },
    [removeWallet]
  );

  return {
    isWalletConnected,
    solanaAddress,
    connectWallet,
    formatAddress,
    getConnectedAddressesForWalletProvider,
    userWallets,
    disconnectWallet,
  };
}
