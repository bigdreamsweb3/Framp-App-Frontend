"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wallet, Plus, Building2, Trash2, Copy, Check } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

interface PaymentMethod {
  id: string;
  type: "bank" | "wallet";
  name: string;
  details: string;
  accountName: string;
  isDefault: boolean;
  walletAddress?: string;
  bankCode?: string;
  accountNumber?: string;
}

interface WalletViewProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onWalletSelect?: (wallet: PaymentMethod) => void;
  selectedWallet?: PaymentMethod | null;
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
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
    walletAddress: "",
    walletName: "",
  });

  useEffect(() => {
    if (user) {
      try {
        const savedMethods = localStorage.getItem(`paymentMethods_${user.id}`);
        if (savedMethods) {
          setPaymentMethods(JSON.parse(savedMethods));
        }
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to load payment methods:", err);
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && paymentMethods.length > 0) {
      localStorage.setItem(
        `paymentMethods_${user.id}`,
        JSON.stringify(paymentMethods)
      );
    }
  }, [paymentMethods, user]);

  const handleAddPaymentMethod = () => {
    if (
      newPaymentMethod.type === "bank" &&
      newPaymentMethod.bankName &&
      newPaymentMethod.accountNumber &&
      newPaymentMethod.accountName
    ) {
      const newMethod: PaymentMethod = {
        id: `bank_${Date.now()}`,
        type: "bank",
        name: newPaymentMethod.bankName,
        details: `****${newPaymentMethod.accountNumber.slice(-4)}`,
        accountName: newPaymentMethod.accountName,
        isDefault: paymentMethods.length === 0,
        accountNumber: newPaymentMethod.accountNumber,
        bankCode: newPaymentMethod.bankName,
      };
      setPaymentMethods([...paymentMethods, newMethod]);
      resetForm();
    } else if (
      newPaymentMethod.type === "wallet" &&
      newPaymentMethod.walletAddress &&
      newPaymentMethod.walletName
    ) {
      const newMethod: PaymentMethod = {
        id: `wallet_${Date.now()}`,
        type: "wallet",
        name: newPaymentMethod.walletName,
        details: `${newPaymentMethod.walletAddress.slice(
          0,
          4
        )}...${newPaymentMethod.walletAddress.slice(-4)}`,
        accountName: newPaymentMethod.walletName,
        isDefault: paymentMethods.length === 0,
        walletAddress: newPaymentMethod.walletAddress,
      };
      setPaymentMethods([...paymentMethods, newMethod]);
      resetForm();
    }
  };

  const resetForm = () => {
    setNewPaymentMethod({
      type: "",
      bankName: "",
      accountNumber: "",
      accountName: "",
      walletAddress: "",
      walletName: "",
    });
    setShowAddPayment(false);
  };

  const handleRemovePaymentMethod = (id: string) => {
    const updatedMethods = paymentMethods.filter((method) => method.id !== id);
    if (updatedMethods.length > 0 && !updatedMethods.some((m) => m.isDefault)) {
      updatedMethods[0].isDefault = true;
    }
    setPaymentMethods(updatedMethods);
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  const handleCopyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleWalletSelect = (wallet: PaymentMethod) => {
    if (onWalletSelect) {
      onWalletSelect(wallet);
    }
    if (onClose) {
      onClose();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-4xl mx-auto bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 sm:p-6">
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
      </div>
    );
  }

  return (
    <Card className="w-full max-w-4xl mx-auto bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Wallets</h2>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddPayment(true)}
            className="h-8 w-8 p-0 rounded-xl bg-primary/10 hover:bg-primary/20"
            aria-label="Add payment method"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 relative">
        {!isLoggedIn ? (
          <section aria-label="Login prompt" className="text-center py-8">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">
              Please log in to manage wallets
            </p>
            <Button
              onClick={onLogin}
              className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              aria-label="Log in or sign up"
            >
              Log In or Sign Up
            </Button>
          </section>
        ) : showAddPayment ? (
          <section aria-label="Add wallet" className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold">Add Wallet</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddPayment(false)}
                className="h-8 w-8 p-0 rounded-xl bg-primary/10 hover:bg-primary/20"
                aria-label="Cancel adding wallet"
              >
                ×
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium">Wallet Type</Label>
                <Select
                  value={newPaymentMethod.type}
                  onValueChange={(value) =>
                    setNewPaymentMethod({ ...newPaymentMethod, type: value })
                  }
                >
                  <SelectTrigger className="rounded-xl text-sm">
                    <SelectValue placeholder="Select wallet type" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* <SelectItem value="bank">Bank Account</SelectItem> */}
                    <SelectItem value="wallet">Crypto Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newPaymentMethod.type === "bank" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Bank Name</Label>
                    <Input
                      placeholder="Enter bank name (e.g., GTBank)"
                      value={newPaymentMethod.bankName}
                      onChange={(e) =>
                        setNewPaymentMethod({
                          ...newPaymentMethod,
                          bankName: e.target.value,
                        })
                      }
                      className="rounded-xl text-sm"
                      aria-label="Bank name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">
                      Account Number
                    </Label>
                    <Input
                      placeholder="Enter account number"
                      value={newPaymentMethod.accountNumber}
                      onChange={(e) =>
                        setNewPaymentMethod({
                          ...newPaymentMethod,
                          accountNumber: e.target.value,
                        })
                      }
                      className="rounded-xl text-sm"
                      aria-label="Account number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Account Name</Label>
                    <Input
                      placeholder="Enter account name"
                      value={newPaymentMethod.accountName}
                      onChange={(e) =>
                        setNewPaymentMethod({
                          ...newPaymentMethod,
                          accountName: e.target.value,
                        })
                      }
                      className="rounded-xl text-sm"
                      aria-label="Account name"
                    />
                  </div>
                </>
              )}

              {newPaymentMethod.type === "wallet" && (
                <>
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">
                      Wallet Address
                    </Label>
                    <Input
                      placeholder="Enter Solana wallet address"
                      value={newPaymentMethod.walletAddress}
                      onChange={(e) =>
                        setNewPaymentMethod({
                          ...newPaymentMethod,
                          walletAddress: e.target.value,
                        })
                      }
                      className="rounded-xl text-sm font-mono"
                      aria-label="Wallet address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Wallet Name</Label>
                    <Input
                      placeholder="e.g., Main Wallet"
                      value={newPaymentMethod.walletName}
                      onChange={(e) =>
                        setNewPaymentMethod({
                          ...newPaymentMethod,
                          walletName: e.target.value,
                        })
                      }
                      className="rounded-xl text-sm"
                      aria-label="Wallet name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full rounded-xl bg-primary/10 hover:bg-primary/20 text-sm"
                      aria-label="Connect crypto wallet"
                    >
                      Connect Wallet
                    </Button>
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-3">
                <Button
                  onClick={handleAddPaymentMethod}
                  className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-sm"
                  aria-label="Add wallet"
                >
                  Add Wallet
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddPayment(false)}
                  className="flex-1 rounded-xl bg-primary/10 hover:bg-primary/20 text-sm"
                  aria-label="Cancel adding wallet"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </section>
        ) : (
          <section aria-label="Payment methods list">
            {paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">
                  No walletss added
                </p>
                <Button
                  onClick={() => setShowAddPayment(true)}
                  variant="outline"
                  className="rounded-xl bg-primary/10 hover:bg-primary/20 text-sm"
                  aria-label="Add wallet"
                >
                  Add Wallet
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`p-3 sm:p-4 bg-muted/30 rounded-xl border border-border/50 cursor-pointer transition-all hover:bg-muted/50 ${selectedWallet?.id === method.id
                        ? "ring-2 ring-primary bg-gradient-to-r from-primary/5 to-primary/10"
                        : ""
                        }`}
                      onClick={() => handleWalletSelect(method)}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                              {method.type === "bank" ? (
                                <Building2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                              ) : (
                                <Wallet className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  {method.name}
                                </span>
                                {method.isDefault && (
                                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-xl">
                                    Default
                                  </span>
                                )}
                                {selectedWallet?.id === method.id && (
                                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-xl">
                                    Selected
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="truncate max-w-[120px] sm:max-w-[150px]">
                                  {method.details}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-4 w-4 sm:h-5 sm:w-5 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const textToCopy =
                                      method.type === "wallet" &&
                                        method.walletAddress
                                        ? method.walletAddress
                                        : method.accountNumber ||
                                        method.details;
                                    handleCopyToClipboard(
                                      textToCopy,
                                      method.id
                                    );
                                  }}
                                  aria-label={`Copy ${method.type === "wallet"
                                    ? "wallet address"
                                    : "account details"
                                    }`}
                                >
                                  {copiedId === method.id ? (
                                    <Check className="h-3 w-3 text-green-600" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </Button>
                                <AnimatePresence>
                                  {copiedId === method.id && (
                                    <motion.span
                                      initial={{ opacity: 0, y: -10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      exit={{ opacity: 0, y: -10 }}
                                      className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-xl"
                                      aria-live="polite"
                                    >
                                      Copied!
                                    </motion.span>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2">
                            {!method.isDefault && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSetDefault(method.id);
                                }}
                                className="text-xs px-2 py-1 h-auto rounded-xl bg-primary/10 hover:bg-primary/20"
                                aria-label="Set as default wallet"
                              >
                                Set Default
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemovePaymentMethod(method.id);
                              }}
                              className="h-6 w-6 sm:h-8 sm:w-8 p-0 rounded-xl text-destructive hover:text-destructive"
                              aria-label="Remove wallet"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  onClick={() => setShowAddPayment(true)}
                  variant="outline"
                  className="w-full mt-4 rounded-xl bg-primary/10 hover:bg-primary/20 text-sm"
                  aria-label="Add another wallet"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Wallet
                </Button>
              </>
            )}
          </section>
        )}

        {/* <section
            aria-label="Security notice"
            className="mt-6 p-4 bg-muted/20 rounded-xl border border-border/30"
          >
            <h5 className="font-medium text-sm mb-2">Security Notice</h5>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your wallet information is encrypted and stored securely.{" "}
              {App_Name} never stores your full account details or private keys.
            </p>
          </section> */}
      </CardContent>
    </Card>
  );
}
