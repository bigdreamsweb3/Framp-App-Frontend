"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Plus, Trash2, Copy, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { WalletAPI } from "@/lib/api/wallets";

import type { WalletMethod } from "@/types/wallet";

interface WalletViewProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onWalletSelect?: (wallet: WalletMethod) => void;
  selectedWallet?: WalletMethod | null;
  onClose?: () => void;
}

export function WalletView({
  isLoggedIn,
  onLogin,
  onWalletSelect,
  selectedWallet,
  onClose,
}: WalletViewProps) {
  const { user } = useAuth();
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [wallets, setWallets] = useState<WalletMethod[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newWallet, setNewWallet] = useState({ walletAddress: "", walletName: "" });
  const [error, setError] = useState<string | null>(null);

  // Fetch wallets from backend API when user is ready
  useEffect(() => {
    if (!user || !isLoggedIn) {
      setIsLoading(false);
      setWallets([]);
      return;
    }

    const fetchWallets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await WalletAPI.getWallets();
        setWallets(data);
      } catch (err) {
        console.error("Failed to fetch wallets:", err);
        setError("Failed to load wallets. Please try again.");
        setWallets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWallets();
  }, [user, isLoggedIn]);

  // Add new wallet function - FIXED
  const handleAddWallet = async () => {
    if (!newWallet.walletAddress || !newWallet.walletName) {
      setError("Wallet address and name are required");
      return;
    }

    try {
      setError(null);
      const addedWallet = await WalletAPI.addWallet({
        name: newWallet.walletName,
        walletAddress: newWallet.walletAddress,
        network: "solana", // or get from user input
      });

      setWallets(prev => [...prev, addedWallet]);
      setNewWallet({ walletAddress: "", walletName: "" });
      setShowAddWallet(false);
    } catch (err) {
      console.error("Failed to add wallet:", err);
      setError("Failed to add wallet. Please try again.");
    }
  };

  // FIXED: Use WalletAPI for delete operation
  const handleRemoveWallet = async (id: string) => {
    try {
      await WalletAPI.deleteWallet(id);
      setWallets(prev => {
        const updated = prev.filter(w => w.id !== id);
        // Handle default wallet logic if needed
        if (updated.length > 0 && !updated.some(w => w.isDefault)) {
          updated[0].isDefault = true;
        }
        return updated;
      });
      setError(null);
    } catch (err) {
      console.error("Failed to remove wallet:", err);
      setError("Failed to remove wallet. Please try again.");
    }
  };

  // FIXED: Use WalletAPI for set default operation
  const handleSetDefault = async (id: string) => {
    try {
      await WalletAPI.setDefaultWallet(id);
      setWallets(prev => prev.map(w => ({ ...w, isDefault: w.id === id })));
      setError(null);
    } catch (err) {
      console.error("Failed to set default wallet:", err);
      setError("Failed to set default wallet. Please try again.");
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError("Failed to copy address.");
    }
  };

  const handleSelect = (wallet: WalletMethod) => {
    onWalletSelect?.(wallet);
    onClose?.();
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Wallets</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddWallet(true)}
              className="h-8 w-8 p-0 rounded-xl bg-primary/10 hover:bg-primary/20"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 w-32 bg-muted/30 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-muted/30 rounded-xl" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Wallets</h2>
          </div>
          {isLoggedIn && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddWallet(true)}
              className="h-8 w-8 p-0 rounded-xl bg-primary/10 hover:bg-primary/20"
            >
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 relative">
        {error && (
          <div className="mb-4 p-3 bg-destructive/10 text-destructive text-sm rounded-xl">
            {error}
          </div>
        )}

        {!isLoggedIn ? (
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              Please log in to manage wallets
            </h3>
            {/* <p className="text-sm text-muted-foreground mb-4">
             
            </p> */}
            <Button onClick={onLogin} className="rounded-xl bg-primary">
              Log In or Sign Up
            </Button>
          </div>
        ) : showAddWallet ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Add Wallet</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddWallet(false)}
                className="h-8 w-8 p-0 rounded-xl bg-primary/10 hover:bg-primary/20"
              >
                ×
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Wallet Address</Label>
                <Input
                  placeholder="Enter Solana wallet address"
                  value={newWallet.walletAddress}
                  onChange={(e) =>
                    setNewWallet({ ...newWallet, walletAddress: e.target.value })
                  }
                  className="rounded-xl text-sm font-mono"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-medium">Wallet Name</Label>
                <Input
                  placeholder="e.g., Main Wallet"
                  value={newWallet.walletName}
                  onChange={(e) =>
                    setNewWallet({ ...newWallet, walletName: e.target.value })
                  }
                  className="rounded-xl text-sm"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <Button
                  onClick={handleAddWallet} // FIXED: removed the function call
                  className="flex-1 rounded-xl bg-primary text-sm"
                >
                  Add Wallet
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddWallet(false)}
                  className="flex-1 rounded-xl text-sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : wallets.length === 0 ? (
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">No wallets added</p>
            <Button
              onClick={() => setShowAddWallet(true)}
              variant="outline"
              className="rounded-xl bg-primary/10 hover:bg-primary/20 text-sm"
            >
              Add Wallet
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className={`p-4 bg-muted/30 rounded-xl border border-border/50 cursor-pointer hover:bg-muted/50 transition-all ${selectedWallet?.id === wallet.id ? "ring-2 ring-primary bg-primary/5" : ""
                    }`}
                  onClick={() => handleSelect(wallet)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{wallet.name}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground relative">
                        <span>{wallet.details}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopy(wallet.walletAddress, wallet.id);
                          }}
                        >
                          {copiedId === wallet.id ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                        <AnimatePresence>
                          {copiedId === wallet.id && (
                            <motion.span
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-primary/90 text-white text-xs px-2 py-1 rounded-xl"
                            >
                              Copied!
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* {!wallet.isDefault && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs px-2 py-1 h-auto rounded-xl bg-primary/10 hover:bg-primary/20"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefault(wallet.id);
                          }}
                        >
                          Set Default
                        </Button>
                      )} */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveWallet(wallet.id);
                        }}
                        className="h-6 w-6 p-0 text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button
              onClick={() => setShowAddWallet(true)}
              variant="outline"
              className="w-full mt-4 rounded-xl bg-primary/10 hover:bg-primary/20 text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Wallet
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}