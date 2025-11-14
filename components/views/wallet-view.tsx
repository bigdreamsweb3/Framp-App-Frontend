"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Plus, Trash2, Copy, Check, Search, ChevronDown } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUI } from "@/context/UIContext";
import { motion, AnimatePresence } from "framer-motion";
import { WalletAPI } from "@/lib/api/wallets";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner"; // Assuming you have a toast library for copy feedback

import type { WalletMethod } from "@/types/wallet";

interface WalletViewProps {
  // isLoggedIn: boolean;
  // onLogin: () => void;
  onLogin?: () => void;
  onWalletSelect?: (wallet: WalletMethod) => void;
  selectedWallet?: WalletMethod | null;
  onClose?: () => void;
}

export function WalletView({
  onWalletSelect,
  selectedWallet,
  onClose,
  onLogin,
}: WalletViewProps) {
  const { user, loading: authLoading } = useAuth();
  const ui = useUI();
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [wallets, setWallets] = useState<WalletMethod[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newWallet, setNewWallet] = useState({ walletAddress: "", walletName: "" });
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 10;
  const [displayCount, setDisplayCount] = useState(10);

  // Fetch wallets from backend API when user is ready
  useEffect(() => {
    // Wait for auth check to complete before making requests. This avoids
    // calling protected endpoints while the auth state is still being determined
    // (which can cause 401s and noisy console errors during initial load).
    if (authLoading) {
      // keep the wallets loading indicator until auth resolved
      setIsLoading(true);
      return;
    }

    // If no authenticated user, skip calling protected API and show prompt
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
        // If the backend returned 401/unauthorized, show a friendly message.
        if (err?.status === 401) {
          setError("You must sign in to view wallets.");
        } else if (err?.message?.toLowerCase?.().includes("unauthorized")) {
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
  }, [user]);

  // Reset on search/filter change
  useEffect(() => {
    setExpandedId(null);
    setDisplayCount(10);
  }, [searchTerm]);

  const filteredWallets = wallets.filter((wallet) => {
    const matchesSearch =
      wallet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallet.walletAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      wallet.details?.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const paginatedWallets = filteredWallets.slice(0, displayCount);

  const loadMore = () => {
    setDisplayCount(prev => prev + ITEMS_PER_PAGE);
  };

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
      toast.success("Copied to clipboard");
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

  const toggleExpanded = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  const getWalletIcon = () => (
    <Wallet className="h-4 w-4 text-muted-foreground" />
  );

  const getWalletBg = () => "bg-muted";

  const getWalletLabel = (wallet: WalletMethod) => wallet.network || "Wallet";

  const truncateAddress = (address: string, start = 6, end = 4): string => {
    return `${address.slice(0, start)}...${address.slice(-end)}`;
  };

  if (authLoading || isLoading) {
    return (
      <div className="grid gap-5 w-full max-w-md mx-auto sm:max-w-2xl">
        <Card className="w-full max-w-md mx-auto sm:max-w-2xl">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Wallet className="w-3 h-3" />
              Wallets
            </CardTitle>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
              <Input
                placeholder="Search wallets..."
                className="pl-7 h-8 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-2 p-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-md" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="grid gap-5 w-full max-w-md mx-auto sm:max-w-2xl">
        <Card className="w-full max-w-md mx-auto sm:max-w-2xl">
          <CardContent className="p-6 text-center">
            <Wallet className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Log in to view wallets.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-5 w-full max-w-md mx-auto sm:max-w-2xl">
      <Card className="w-full max-w-md mx-auto sm:max-w-2xl">
        <div className="flex flex-row items-center justify-between px-2">
          <CardTitle className="text-base flex items-center gap-2 px-2">
            <Wallet className="w-3 h-3" />
            Wallets

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAddWallet(true)}
              className="h-6 w-6 p-0 rounded-xl bg-primary/10 hover:bg-primary/20"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </CardTitle>

          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search wallets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 h-8 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
            />
          </div>


        </div>

        <CardContent className="p-0">
          <div className="p-2 space-y-2">
            {error && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-md mb-2">
                {error}
              </div>
            )}

            {showAddWallet ? (
              <div className="space-y-3 bg-muted/50 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Add Wallet</h4>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Wallet Address</Label>
                    <Input
                      placeholder="Enter Solana wallet address"
                      value={newWallet.walletAddress}
                      onChange={(e) =>
                        setNewWallet({ ...newWallet, walletAddress: e.target.value })
                      }
                      className="rounded-xl text-sm font-mono h-8"
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
                      className="rounded-xl text-sm h-8"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleAddWallet}
                      className="flex-1 rounded-xl bg-primary text-xs h-8"
                    >
                      Add Wallet
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowAddWallet(false)}
                      className="flex-1 rounded-xl text-xs h-8"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            ) : filteredWallets.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                <Wallet className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No wallets found. Add your first wallet to get started!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-fit overflow-y-auto">
                {paginatedWallets.map((wallet) => (
                  <div key={wallet.id} className="rounded-md overflow-hidden bg-card">
                    <div
                      className={`flex items-center justify-between p-2 cursor-pointer hover:bg-muted transition-colors ${selectedWallet?.id === wallet.id ? "bg-primary/5" : ""
                        } ${expandedId === wallet.id ? 'bg-muted' : ''}`}
                      onClick={() => handleSelect(wallet)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded flex items-center justify-center ${getWalletBg()}`}>
                            {getWalletIcon()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1">
                            <span className="text-xs font-medium truncate">
                              {wallet.name}

                            </span>
                            {wallet.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className="font-mono truncate cursor-pointer text-xs text-muted-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(wallet.walletAddress, wallet.id);
                                  }}
                                >
                                  {truncateAddress(wallet.walletAddress)}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Click to copy</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => toggleExpanded(wallet.id, e)}
                          className="h-6 w-6 p-0 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <ChevronDown className={`h-3 w-3 transition-transform ${expandedId === wallet.id ? 'rotate-180' : ''}`} />
                        </Button>
                      </div>
                    </div>
                    {expandedId === wallet.id && (
                      <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 px-2 py-2">
                        <p className="flex items-center justify-between">
                          <span className="font-mono truncate">{wallet.walletAddress}</span>
                        </p>

                        <div className="pt-2 border-t flex gap-2 justify-end">
                          <p className="flex items-center justify-between">
                            <span>Actions:</span>
                          </p>

                          {!wallet.isDefault && (
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSetDefault(wallet.id);
                              }}
                            >
                              Set as Default
                            </Button>
                          )}
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-6 px-2 text-xs rounded-xl"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveWallet(wallet.id);
                            }}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>

        {displayCount < filteredWallets.length && (
          <div className="px-2">
            <div className="flex flex-row items-center justify-between gap-2 pb-2">
              <p className="text-xs text-muted-foreground">
                Showing {displayCount} of {filteredWallets.length} wallets
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={loadMore}
                className="rounded-xl h-8"
              >
                Load More
              </Button>
            </div>
          </div>
        )}

        {showAddWallet ? null : wallets.length > 0 && (
          <div className="px-2 pb-2">
            <Button
              onClick={() => setShowAddWallet(true)}
              variant="outline"
              className="w-full rounded-xl bg-primary/10 hover:bg-primary/20 text-sm h-8"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Wallet
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}