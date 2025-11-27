"use client";

import {
  useDynamicContext,
  useUserWallets,
} from "@dynamic-labs/sdk-react-core";
import { isSolanaWallet } from "@dynamic-labs/solana";
import { useCallback, useMemo, useEffect, useState } from "react";
import { getConnectedAddresses } from "@dynamic-labs-sdk/client";

export function useConnectedWallet() {
  const {
    primaryWallet,
    setShowDynamicUserProfile,
    setShowAuthFlow,
    user,
    setAuthMode,
    removeWallet,
  } = useDynamicContext();

  const userWallets = useUserWallets();

  const walletProviderKey = primaryWallet?.connector.key;

  const [walletValid, setWalletValid] = useState(false);

  // ----------------------------
  // VALIDATE WALLET CONNECTION
  // ----------------------------
  {/* const validateWalletConnection = useCallback(async () => {
    if (!primaryWallet) {
      setWalletValid(false);
      return false;
    }

    try {
      const message = new TextEncoder().encode("ping");
      await primaryWallet.signMessage("message"); // ping wallet
      setWalletValid(true);
      return true;
    } catch (err) {
      console.warn("Wallet message failed, removing wallet...", err);

      if (primaryWallet.id) {
        await removeWallet(primaryWallet.id);
        console.log("Removed invalid wallet:", primaryWallet.id);
      }

      setWalletValid(false);
      return false;
    }
  }, [primaryWallet, removeWallet]);

  // ----------------------------
  // RUN ON APP INITIALIZE
  // ----------------------------
  useEffect(() => {
    if (primaryWallet) {
      validateWalletConnection();
    }
  }, [primaryWallet, validateWalletConnection]); */}

  // ----------------------------
  // IS WALLET CONNECTED
  // ----------------------------
 //  const isWalletConnected = useMemo(() => walletValid, [walletValid]);
const isWalletConnected = !!primaryWallet
  // ----------------------------
  // FETCH CONNECTED ADDRESSES
  // ----------------------------
  const getConnectedAddressesForWalletProvider = useCallback(async (): Promise<
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

  // ----------------------------
  // SOLANA ADDRESS
  // ----------------------------
  const solanaAddress = useMemo(() => {
    if (primaryWallet && isSolanaWallet(primaryWallet)) {
      return primaryWallet.address;
    }
    return null;
  }, [primaryWallet]);

  // ----------------------------
  // FORMAT ADDRESS
  // ----------------------------
  const formatAddress = useCallback((address: string) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }, []);

  // ----------------------------
  // CONNECT WALLET
  // ----------------------------
  const connectWallet = useCallback(() => {
      if (isWalletConnected) {
        // ❌ do not show Dynamic popup
        // you will show YOUR OWN modal instead
        // e.g. setYourModalOpen(true)
        setShowDynamicUserProfile(true);
        // return;
      } else {
        // if (user) {
        //   setAuthMode("connect-only");
        // }
        setShowAuthFlow(true);
      }
    }, [isWalletConnected, user, setShowAuthFlow]);
  // ----------------------------
  // MANUAL WALLET REMOVER
  // ----------------------------
  const disconnectWallet = useCallback(
    async (walletId: string) => {
      try {
        await removeWallet(walletId);
        console.log("Wallet removed:", walletId);
        setWalletValid(false);
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
