"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Plus, Copy, Check, X, Loader2, Search, ChevronDown } from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 10;
  const [displayCount, setDisplayCount] = useState(10);

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

  // Reset on search change
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
    <Wallet className="h-4 w-4 text-blue-600" />
  );

  const getWalletBg = () => "bg-blue-50 dark:bg-blue-900/30";

  const getWalletLabel = (wallet: WalletMethod) => wallet.network || "Wallet";

  const truncateAddress = (address: string, start = 6, end = 4): string => {
    return `${address.slice(0, start)}...${address.slice(-end)}`;
  };

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
            <div className="space-y-2 p-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : filteredWallets.length === 0 ? (
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
            <div className="space-y-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Search wallets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 h-8 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none rounded-md"
                />
              </div>

              {/* Wallets List */}
              <div className="space-y-2 max-h-fit overflow-y-auto">
                {paginatedWallets.map((wallet) => (
                  <div key={wallet.id} className="space-y-1 border rounded-md overflow-hidden bg-card">
                    <div
                      className={`flex items-center justify-between p-2 cursor-pointer hover:bg-muted transition-colors ${
                        selectedWallet?.id === wallet.id ? "bg-primary/5" : ""
                      }`}
                      onClick={() => handleSelect(wallet)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded flex items-center justify-center ${getWalletBg()}`}>
                            {getWalletIcon()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-xs font-medium truncate">
                              {getWalletLabel(wallet)}
                              {wallet.network && ` (${wallet.network})`}
                            </span>
                            {wallet.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {wallet.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3">
                        <div className="flex flex-col items-end flex-shrink-0 text-xs space-y-1">
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
                          <AnimatePresence>
                            {copiedId === wallet.id && (
                              <motion.span
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-xs text-green-600"
                              >
                                Copied!
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>

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
                      <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 px-2 pb-2">
                        <p className="flex items-center justify-between">
                          <span>Full Address:</span>
                          <span className="font-mono truncate">{wallet.walletAddress}</span>
                        </p>
                        {!wallet.isDefault && (
                          <p className="flex items-center justify-between">
                            <span>Set as Default:</span>
                            <Button
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                // handleSetDefault(wallet.id); // If needed
                              }}
                            >
                              Set Default
                            </Button>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Load More */}
              {displayCount < filteredWallets.length && (
                <div className="flex flex-row items-center justify-between gap-2 pt-2">
                  <p className="text-xs text-muted-foreground">
                    Showing {displayCount} of {filteredWallets.length} wallets
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadMore}
                    className="rounded-md h-8"
                  >
                    Load More
                  </Button>
                </div>
              )}

              {/* Add Wallet Button */}
              <Button
                onClick={() => setShowAddWallet(true)}
                variant="outline"
                className="w-full rounded-md border-border/50 hover:bg-muted/50 py-3 mt-4"
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