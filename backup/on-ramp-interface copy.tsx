// File: components/on-ramp-interface.tsx
"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowDown,
  Settings,
  ChevronDown,
  Wallet,
  Building2,
  RefreshCw,
  AlertCircle,
  SwatchBook,
  Send,
} from "lucide-react";
import { OnrampSettings } from "@/components/onramp-settings";
import { logoNGN } from "@/asssets/image";
import { createOnramp } from "@/lib/api/payments/onramp";
import { useAuth } from "@/context/AuthContext";
import { Button } from "../components/ui/button";
import { CheckoutModal } from "@/components/modals/checkout-modal";
import { TokenListModal, Token } from "@/components/modals/token-list-modal";
import {
  getPersonalizedDefaultToken,
  trackTokenSelection,
  trackTokenPurchase,
} from "@/lib/userBehavior/tokenTracker";
import { ConfirmOnRampModal } from "../components/modals/confirm-onramp-modal";
import { PaymentMethodSelector } from "../components/payment-method-selector";
import { useExchangeRateWithFallback } from "@/lib/hooks/useExchangeRate";
import { ExchangeRateStatus } from "../components/ui/exchange-rate-status";
import { ExchangeRateSkeleton } from "../components/ui/exchange-rate-skeleton";

type TokenStats = {
  selections: number;
  purchases: number;
  lastSelected: number;
  lastPurchased: number;
};

const CRYPTO_TOKENS = [
  {
    symbol: "USDT",
    name: "Tether USD",
    label: "Tether USD",
    icon: "/icons/usdt.svg",
    balance: "150.5",
    price: "1.00",
    change24h: 0.12,
    isPopular: true,
  },
  {
    symbol: "SOL",
    name: "Solana",
    label: "Solana",
    icon: "/icons/sol.svg",
    balance: "3.2",
    price: "19.80",
    change24h: -1.24,
    isFavorite: true,
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
  const [tokenListOpen, setTokenListOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // ✅ confirmation modal state
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [isTokenModalOpen, setTokenModalOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);

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

  // ✅ Step 1: open confirmation modal
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

  // ✅ Step 2: create onramp after confirm
  async function handleConfirm() {
    setLoading(true);
    try {
      // Use selected wallet address if available, otherwise fall back to user's wallet
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
        setCheckoutUrl(res.data.checkout_url); // show iframe modal
      } else {
        alert("Failed to initialize payment");
      }
    } catch (err: any) {
      console.error("Onramp error:", err.message);
      alert(err.message);
    } finally {
      setLoading(false);
      setShowConfirm(false); // close confirm modal
    }
  }

  return (
    <>
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
                  <h2 className="text-lg font-semibold">On Ramp</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </CardTitle>

              {selectedWallet && (
                <CardDescription>
                  To: {selectedWallet.name} ({selectedWallet.details})
                </CardDescription>
              )}
            </CardHeader>

            <CardContent className="p-0 flex-1">
              {/*  */}
              <div className="flex-1 space-y-3.5 px-4">
                {/* You Pay */}
                <div className="dark:bg-gray-800 bg-[#C2C0EB] rounded-3xl p-6 border shadow-sm">
                  <div className="mb-2 dark:bg-gray-900 bg-[#E3E2F5] rounded-lg px-4 py-2">
                    <div className="text-sm text-gray-500 mb-2">You Pay</div>
                    <div className="flex items-center justify-between">
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={fromAmount}
                        onChange={(e) => onFromAmountChange(e.target.value)}
                        className="text-2xl font-bold bg-transparent border-none outline-none w-full"
                        placeholder="0.00"
                      />
                      <div className="flex items-center gap-1">
                        <Image src={logoNGN} alt="NGN" width={14} height={14} />
                        <span className="text-sm font-medium">NGN</span>
                      </div>
                    </div>
                  </div>

                  {/* Arrow Down */}
                  <div className="flex justify-center my-2">
                    <div className="w-10 h-10 dark:bg-gray-700 bg-gray-100 border-[#C2C0EB] border-[4px] rounded-full flex items-center justify-center">
                      <ArrowDown className="w-5 h-5" />
                    </div>
                  </div>

                  {/* You Receive */}
                  <div className="dark:bg-gray-900 bg-[#E3E2F5] rounded-lg px-4 py-2">
                    <div className="text-sm text-gray-500 mb-2">
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
                      <div className="flex items-center gap-2 relative">
                        <Button
                          className="flex items-center gap-2 px-2 py-1 rounded-lg bg-muted/40 hover:bg-muted/70 border border-muted-foreground/10"
                          onClick={() => setTokenModalOpen(true)}
                        >
                          <img
                            src={
                              CRYPTO_TOKENS.find(
                                (t) => t.symbol === tokenSymbol
                              )?.icon
                            }
                            alt={tokenSymbol}
                            className="w-5 h-5"
                          />
                          <span className="font-medium text-sm text-accent-foreground">
                            {tokenSymbol}
                          </span>
                          <ChevronDown className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                    {/* Wallet Selection - Only show when amount is entered */}
                    {fromAmount && Number(fromAmount) > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="text-xs text-gray-500">To:</div>
                            {selectedWallet ? (
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                                  {selectedWallet.type === "wallet" ? (
                                    <Wallet className="h-2.5 w-2.5 text-primary" />
                                  ) : (
                                    <Building2 className="h-2.5 w-2.5 text-primary" />
                                  )}
                                </div>
                                <div>
                                  <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                    {selectedWallet.name}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {selectedWallet.details}
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-2">
                                <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center">
                                  <Wallet className="h-2.5 w-2.5 text-orange-500" />
                                </div>
                                <div className="text-xs text-orange-600 font-medium">
                                  Select wallet
                                </div>
                              </div>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs px-2 py-1 h-6 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                            onClick={onWalletSelect}
                          >
                            {selectedWallet ? "Change" : "Select"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>



                {/* Payment Method Selection - Only show when amount is entered AND wallet is selected */}
                {/* {fromAmount && Number(fromAmount) > 0 && !selectedWallet && (
                  <div className="mt-3">
                    <div className="text-xs text-muted-foreground text-center py-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg px-3">
                      💡 Please select a wallet first to choose your payment
                      method
                    </div>
                  </div>
                )} */}


                {/* Payment Method Selection */}
                {fromAmount && Number(fromAmount) > 0 && selectedWallet && (
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-xs text-muted-foreground">Payment Method</div>
                      {!selectedPaymentMethod && (
                        <AlertCircle className="h-4 w-4 text-orange-600 bg-card/50" />
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
                <div className="px-2">
                  <Button
                    className="w-full h-12 rounded-2xl text-base font-semibold"
                    size="lg"
                    disabled={
                      !fromAmount ||
                      !selectedWallet ||
                      !selectedPaymentMethod ||
                      loading
                    }
                    onClick={openConfirm}
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
              </div>
            </CardContent>
          </Card>



          {/* Exchange Rate */}
          < div className="flex items-center justify-between bg-primary/10 rounded-xl px-3 py-2">
            {rateLoading && !exchangeRate ? (
              <ExchangeRateSkeleton />
            ) : (
              <div className="flex items-center gap-2 text-sm text-primary">
                <span>1 {tokenSymbol} = {effectiveRate.toLocaleString()} NGN</span>
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

          {/* Security Notice */}
          <div className="p-4 bg-muted/20 rounded-xl border border-border/30">
            <h5 className="font-medium text-sm mb-2">Security Notice</h5>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your transactions are encrypted and secure. We prioritize your privacy and never store sensitive payment details.
            </p>
          </div>
        </div>
      </div >

      {showSettings && (
        <OnrampSettings onClose={() => setShowSettings(false)} />
      )
      }

      {/* Token List Modal */}
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

      {/* ✅ Confirmation Modal */}
      {
        showConfirm && (
          <ConfirmOnRampModal
            fiatAmount={fromAmount} // 💵 amount user pays
            fiatCurrency="NGN" // 💱 always NGN for the fiat side
            receiveAmount={receiving} // 🪙 amount of crypto they get
            receiveToken={tokenSymbol} // 🪙 token symbol (SOL, USDT etc.)
            paymentMethod={selectedPaymentMethod || "Card"} // 💳 selected payment method
            selectedWallet={selectedWallet} // 🏦 selected wallet information
            onConfirm={handleConfirm}
            onCancel={() => setShowConfirm(false)}
          />
        )
      }

      {/* ✅ Checkout Iframe Modal */}
      {
        checkoutUrl && (
          <CheckoutModal url={checkoutUrl} onClose={() => setCheckoutUrl(null)} />
        )
      }
    </>
  );
}
