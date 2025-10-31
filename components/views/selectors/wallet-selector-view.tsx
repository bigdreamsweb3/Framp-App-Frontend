"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Plus, Copy, Check, X, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import { motion, AnimatePresence } from "framer-motion";
import { WalletAPI } from "@/lib/api/wallets";
import type { WalletMethod } from "@/types/wallet";

interface WalletViewProps {
  onWalletSelect?: (wallet: WalletMethod) => void;
  selectedWallet?: WalletMethod | null;
  onClose?: () => void;
}

export function WalletView({
  onWalletSelect,
  selectedWallet,
  onClose,
}: WalletViewProps) {
  const { user, loading: authLoading } = useAuth();
  const ui = useUI();
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [wallets, setWallets] = useState<WalletMethod[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newWallet, setNewWallet] = useState({ walletAddress: "", walletName: "" });
  const [error, setError] = useState<string | null>(null);
  const [addingWallet, setAddingWallet] = useState(false);

  useEffect(() => {
    if (authLoading) {
      setIsLoading(true);
      return;
    }

    if (!user) {
      setIsLoading(false);
      setWallets([]);
      setError(null);
      return;
    }

    const fetchWallets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await WalletAPI.getWallets();
        setWallets(data);
      } catch (err: any) {
        console.error("Failed to fetch wallets:", err);
        if (err?.status === 401 || err?.message?.toLowerCase?.().includes("unauthorized")) {
          setError("You must sign in to view wallets.");
        } else {
          setError("Failed to load wallets. Please try again.");
        }
        setWallets([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWallets();
  }, [user, authLoading]);

  const handleAddWallet = async () => {
    if (!newWallet.walletAddress || !newWallet.walletName) {
      setError("Wallet address and name are required");
      return;
    }

    try {
      setError(null);
      setAddingWallet(true);
      const addedWallet = await WalletAPI.addWallet({
        name: newWallet.walletName,
        walletAddress: newWallet.walletAddress,
        network: "solana",
      });

      setWallets(prev => [...prev, addedWallet]);
      setNewWallet({ walletAddress: "", walletName: "" });
      setShowAddWallet(false);
    } catch (err) {
      console.error("Failed to add wallet:", err);
      setError("Failed to add wallet. Please try again.");
    } finally {
      setAddingWallet(false);
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

  // Loading Skeleton Component
  const WalletSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {[...Array(6)].map((_, index) => (
        <div
          key={index}
          className="p-4 rounded-xl border border-border/50 bg-muted/20 animate-pulse"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
            <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
            <div className="w-6 h-6 rounded-lg bg-muted-foreground/20 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Main Panel - Full screen on mobile, 70% width on desktop */}
      <div className="relative bg-background w-full h-full md:h-auto md:max-h-[85vh] md:w-[70%] md:max-w-4xl md:rounded-2xl border-border/50 md:border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Select Wallet</h2>
              <p className="text-sm text-muted-foreground">Choose receiving wallet</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 h-[calc(100%-80px)] md:max-h-[calc(85vh-80px)] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              {error}
            </div>
          )}

          {!user ? (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <Wallet className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                Sign In Required
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Please sign in to manage your wallets
              </p>
            </div>
          ) : showAddWallet ? (
            <div className="space-y-6 max-w-md mx-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Add New Wallet</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddWallet(false)}
                  className="h-8 w-8 rounded-lg"
                  disabled={addingWallet}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Wallet Name</Label>
                  <Input
                    placeholder="e.g., Main Wallet"
                    value={newWallet.walletName}
                    onChange={(e) => setNewWallet({ ...newWallet, walletName: e.target.value })}
                    className="rounded-lg"
                    disabled={addingWallet}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Wallet Address</Label>
                  <Input
                    placeholder="Enter Solana wallet address"
                    value={newWallet.walletAddress}
                    onChange={(e) => setNewWallet({ ...newWallet, walletAddress: e.target.value })}
                    className="rounded-lg font-mono text-sm"
                    disabled={addingWallet}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleAddWallet}
                    disabled={addingWallet || !newWallet.walletAddress || !newWallet.walletName}
                    className="flex-1 rounded-lg bg-primary hover:bg-primary/90"
                  >
                    {addingWallet ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Wallet"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddWallet(false)}
                    disabled={addingWallet}
                    className="flex-1 rounded-lg"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="space-y-6">
              {/* Loading State */}
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="relative mb-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Loading Wallets</h3>
                  <p className="text-sm text-muted-foreground">Fetching your wallet information...</p>
                </div>
              </div>
              <WalletSkeleton />
            </div>
          ) : wallets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <Wallet className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                No Wallets Added
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Get started by adding your first wallet
              </p>
              <Button
                onClick={() => setShowAddWallet(true)}
                className="rounded-lg bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Wallets Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {wallets.map((wallet) => (
                  <div
                    key={wallet.id}
                    onClick={() => handleSelect(wallet)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedWallet?.id === wallet.id 
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                        : "border-border/50 hover:border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${
                            selectedWallet?.id === wallet.id ? "bg-primary" : "bg-muted-foreground/50"
                          }`} />
                          <span className="font-medium text-sm truncate">{wallet.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-mono truncate">
                            {wallet.walletAddress.slice(0, 8)}...{wallet.walletAddress.slice(-8)}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-lg hover:bg-muted"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(wallet.walletAddress, wallet.id);
                            }}
                          >
                            {copiedId === wallet.id ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {copiedId === wallet.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded-lg"
                        >
                          Copied!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Add Wallet Button */}
              <Button
                onClick={() => setShowAddWallet(true)}
                variant="outline"
                className="w-full rounded-lg border-border/50 hover:bg-muted/50 py-3"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Wallet
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}