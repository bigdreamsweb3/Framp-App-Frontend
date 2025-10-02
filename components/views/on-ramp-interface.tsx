"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  ArrowUpCircle,
  Settings,
  ChevronDown,
  Wallet,
  Building2,
  RefreshCw,
  AlertCircle,
  Send,
} from "lucide-react";
import { OnrampSettings } from "@/components/onramp-settings";
import { logoNGN } from "@/asssets/image";
import { createOnramp } from "@/lib/api/payments/onramp";
import { useAuth } from "@/context/AuthContext";
import { Button } from "../ui/button";
import { CheckoutModal } from "@/components/modals/checkout-modal";
import { TokenListModal, Token } from "@/components/modals/token-list-modal";
import {
  getPersonalizedDefaultToken,
  trackTokenSelection,
  trackTokenPurchase,
} from "@/lib/userBehavior/tokenTracker";
import { ConfirmOnRampModal } from "../modals/confirm-onramp-modal";
import { PaymentMethodSelector } from "../payment-method-selector";
import { useExchangeRateWithFallback } from "@/lib/hooks/useExchangeRate";
import { ExchangeRateStatus } from "../ui/exchange-rate-status";
import { ExchangeRateSkeleton } from "../ui/exchange-rate-skeleton";
import {
  formatNairaInput,
  parseNairaAmount,
} from "@/lib/utils/naira-formatter";

type TokenStats = {
  selections: number;
  purchases: number;
  lastSelected: number;
  lastPurchased: number;
};

const CRYPTO_TOKENS = [
  {
    symbol: "SOL",
    name: "Solana",
    label: "Solana",
    icon: "/icons/sol.svg",
    isFavorite: true,
  },

  {
    symbol: "USDC",
    name: "USD Coin",
    label: "Circle USD",
    icon: "/icons/usdc.svg",
    isPopular: true,
  },

  {
    symbol: "USDT",
    name: "Tether USD",
    label: "Tether USD",
    icon: "/icons/usdt.svg",
    isPopular: true,
  },

];

interface OnRampInterfaceProps {
  fromAmount: string;
  toAmount: string;
  onFromAmountChange: (value: string) => void;
  tokenSymbol: string;
  fiatCurrency: string;
  onCurrencyChange: (currency: string) => void;
  receiving: number;
  balance?: number;
  selectedWallet?: {
    id: string;
    type: "bank" | "wallet";
    name: string;
    details: string;
    accountName: string;
    isDefault: boolean;
    walletAddress?: string;
    bankCode?: string;
    accountNumber?: string;
  } | null;
  onWalletSelect?: () => void;
  selectedPaymentMethod?: string | null;
  onPaymentMethodSelect?: (method: string) => void;
}

export function OnRampInterface({
  fromAmount,
  toAmount,
  onFromAmountChange,
  tokenSymbol,
  fiatCurrency,
  onCurrencyChange,
  receiving,
  balance = 0,
  selectedWallet,
  onWalletSelect,
  selectedPaymentMethod,
  onPaymentMethodSelect,
}: OnRampInterfaceProps) {
  const [showSettings, setShowSettings] = useState(false);
  const [isTokenModalOpen, setTokenModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [formattedAmount, setFormattedAmount] = useState("");

  const { user } = useAuth();

  // Get exchange rate for the selected token
  const {
    exchangeRate,
    loading: rateLoading,
    error: rateError,
    refreshRate,
    effectiveRate,
    convertNGNToToken: convertNGNToTokenAmount,
  } = useExchangeRateWithFallback(tokenSymbol, 850);

  useEffect(() => {
    const isValid = CRYPTO_TOKENS.some((t) => t.symbol === tokenSymbol);
    if (!isValid || tokenSymbol === "NGN") {
      const personalized = getPersonalizedDefaultToken(user?.id, CRYPTO_TOKENS);
      onCurrencyChange(personalized);
    }
  }, [tokenSymbol, onCurrencyChange, user]);

  // Sync formatted amount with fromAmount prop
  useEffect(() => {
    if (fromAmount) {
      setFormattedAmount(formatNairaInput(fromAmount));
    } else {
      setFormattedAmount("");
    }
  }, [fromAmount]);

  // Handle input change with formatting
  const handleAmountChange = (value: string) => {
    const formatted = formatNairaInput(value);
    setFormattedAmount(formatted);

    // Parse the formatted value back to numeric for the parent component
    const numericValue = parseNairaAmount(formatted);
    onFromAmountChange(numericValue.toString());
  };

  // Handle wheel event to prevent scroll increment/decrement
  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur();
  };

  // Open confirmation modal
  function openConfirm() {
    if (!user) {
      alert("Please login first");
      return;
    }
    if (!fromAmount || Number(fromAmount) <= 0) {
      alert("Enter a valid amount");
      return;
    }
    if (!selectedWallet) {
      alert("Please select a wallet");
      return;
    }
    if (!selectedPaymentMethod) {
      alert("Please select a payment method");
      return;
    }
    setShowConfirm(true);
  }

  // Create onramp after confirmation
  async function handleConfirm() {
    setLoading(true);
    try {
      const walletAddress =
        selectedWallet?.walletAddress ||
        user?.wallet_address ||
        "YOUR_WALLET_ADDRESS";

      const res = await createOnramp({
        fiatAmount: Number(fromAmount),
        fiatCurrency: fiatCurrency,
        tokenSymbol: tokenSymbol,
        tokenAmount: toAmount,
        exchangeRate: exchangeRate?.rate,
        tokenMint: "So11111111111111111111111111111111111111112",
        walletAddress: walletAddress,
        walletInfo: selectedWallet,
        paymentMethods: selectedPaymentMethod
          ? [selectedPaymentMethod]
          : ["CARD"],
      });

      if (res?.data?.checkout_url) {
        trackTokenPurchase(user?.id, tokenSymbol);
        setCheckoutUrl(res.data.checkout_url);
      } else {
        alert("Failed to initialize payment");
      }
    } catch (err: any) {
      console.error("Onramp error:", err.message);
      alert(err.message);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  }

  return (
    <div className="flex-1 mx-auto max-w-md">
      <div className="flex flex-col gap-4">
        <Card
          className="bg-card/50 backdrop-blur-sm border-border/50"
          data-tour="onramp-card"
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Buy</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => setShowSettings(true)}
                aria-label="Open settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {selectedWallet
                ? `Convert NGN to ${tokenSymbol} and deposit to: ${selectedWallet.name} (${selectedWallet.details})`
                : "Convert NGN to crypto and deposit to your chosen wallet"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-4 space-y-4">
              {/* You Pay */}
              <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                <div className="text-xs text-muted-foreground mb-2">
                  You Pay
                </div>
                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={formattedAmount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    onWheel={handleWheel}
                    className="text-2xl font-bold bg-transparent border-none outline-none w-full"
                    placeholder="0"
                    aria-label="Amount to pay in NGN"
                  />
                  {/* <div className="flex items-center gap-1">
                    <Image src={logoNGN} alt="NGN" width={14} height={14} />
                    <span className="text-sm font-medium">NGN</span>
                  </div> */}

                  <Button
                    variant="outline"
                    className="flex items-center gap-2 px-2 py-1 rounded-lg bg-muted/50 hover:bg-muted/70 border border-border/50 text-foreground"
                    // onClick={() => setTokenModalOpen(true)}
                    aria-label="Select cryptocurrency"
                  >
                    <img src={logoNGN} alt="NGN" className="w-5 h-5" />
                    <span className="font-medium text-sm">NGN</span>
                    {/* <ChevronDown className="w-4 h-4 ml-1" /> */}
                  </Button>
                </div>
              </div>

              {/* Exchange Rate */}
              <div className="flex items-center justify-between bg-primary/10 rounded-xl px-3 py-2">
                {rateLoading && !exchangeRate ? (
                  <ExchangeRateSkeleton />
                ) : (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <span>
                      1 {tokenSymbol} = {effectiveRate.toLocaleString()} NGN
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={refreshRate}
                      aria-label="Refresh exchange rate"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                {rateError && (
                  <div className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>Error loading rate</span>
                  </div>
                )}
              </div>

              {/* You Receive */}
              <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                <div className="text-xs text-muted-foreground mb-2">
                  You Receive
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {receiving > 0
                      ? receiving.toLocaleString("en-US", {
                        maximumFractionDigits: 5,
                      })
                      : "0.00"}
                  </div>
                  <Button
                    variant="outline"
                    className="flex items-center gap-2 px-2 py-1 rounded-lg bg-muted/50 hover:bg-muted/70 border border-border/50 text-foreground"
                    onClick={() => setTokenModalOpen(true)}
                    aria-label="Select cryptocurrency"
                  >
                    <img
                      src={
                        CRYPTO_TOKENS.find((t) => t.symbol === tokenSymbol)
                          ?.icon
                      }
                      alt={tokenSymbol}
                      className="w-5 h-5"
                    />
                    <span className="font-medium text-sm text-">
                      {tokenSymbol}
                    </span>
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>

              {/* Wallet Selection */}
              {fromAmount && Number(fromAmount) > 0 && (
                <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground">To:</div>
                      {selectedWallet ? (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                            {selectedWallet.type === "wallet" ? (
                              <Wallet className="h-3 w-3 text-primary" />
                            ) : (
                              <Building2 className="h-3 w-3 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-medium text-foreground">
                              {selectedWallet.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {selectedWallet.details}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center">
                            <Wallet className="h-3 w-3 text-orange-500" />
                          </div>
                          <div className="flex items-center gap-2 text-xs text-orange-600 font-medium">
                            <span>Select wallet</span>
                            <AlertCircle className="h-4 w-4 text-orange-600" />
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-3 text-xs font-medium text-foreground bg-transparent hover:bg-primary/10 rounded-xl"
                      onClick={onWalletSelect}
                      aria-label={
                        selectedWallet ? "Change wallet" : "Select wallet"
                      }
                    >
                      {selectedWallet ? "Change" : "Select"}
                    </Button>
                  </div>
                </div>
              )}

              {/* Payment Method Selection */}
              {fromAmount && Number(fromAmount) > 0 && selectedWallet && (
                <div className="bg-muted/30 rounded-xl p-4 border border-border/50 no-scrollbar">
                  <style jsx>{`
                    .no-scrollbar::-webkit-scrollbar {
                      display: none;
                    }
                    .no-scrollbar {
                      -ms-overflow-style: none;
                      scrollbar-width: none;
                    }
                  `}</style>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-xs text-muted-foreground">
                      Payment Method
                    </div>
                    {!selectedPaymentMethod && (
                      <AlertCircle className="h-4 w-4 text-orange-600" />
                    )}
                  </div>
                  <PaymentMethodSelector
                    selectedMethod={selectedPaymentMethod || null}
                    onMethodSelect={onPaymentMethodSelect || (() => { })}
                    disabled={loading}
                  />
                </div>
              )}

              {/* Action Button */}
              <Button
                className="w-full h-12 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90"
                size="lg"
                disabled={
                  !fromAmount ||
                  !selectedWallet ||
                  !selectedPaymentMethod ||
                  loading
                }
                onClick={openConfirm}
                aria-label={`Buy ${tokenSymbol}`}
              >
                {loading
                  ? "Processing..."
                  : !fromAmount
                    ? "Enter amount"
                    : !selectedWallet
                      ? "Select wallet"
                      : !selectedPaymentMethod
                        ? "Select payment method"
                        : `Buy ${tokenSymbol}`}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="p-4 bg-muted/20 rounded-xl border border-border/30">
          <h5 className="font-medium text-sm mb-2">Security Notice</h5>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your transactions are encrypted and secure. We prioritize your
            privacy and never store sensitive payment details.
          </p>
        </div>
      </div>

      {showSettings && (
        <OnrampSettings onClose={() => setShowSettings(false)} />
      )}

      <TokenListModal
        tokens={CRYPTO_TOKENS}
        selected={tokenSymbol}
        isOpen={isTokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
        onSelect={(token) => {
          setSelectedToken(token);
          onCurrencyChange(token.symbol);
          trackTokenSelection(user?.id, token.symbol);
          setTokenModalOpen(false);
        }}
      />

      {showConfirm && (
        <ConfirmOnRampModal
          fiatAmount={fromAmount}
          fiatCurrency="NGN"
          receiveAmount={receiving}
          receiveToken={tokenSymbol}
          paymentMethod={selectedPaymentMethod || "Card"}
          selectedWallet={selectedWallet}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {checkoutUrl && (
        <CheckoutModal url={checkoutUrl} onClose={() => setCheckoutUrl(null)} />
      )}
    </div>
  );
}
