"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowUpCircle, ArrowDownCircle, ChevronDown, Wallet, Building2, RefreshCw, AlertCircle } from "lucide-react"
import { OnrampSettings } from "@/components/onramp-settings"
import { logoNGN } from "@/asssets/image"
import { createOnramp } from "@/lib/api/payments/onramp"
import { useAuth } from "@/context/AuthContext"
import { Button } from "../components/ui/button"
import { CheckoutModal } from "@/components/modals/checkout-modal"
import { TokenListModal, type Token } from "@/components/modals/token-list-modal"
import { getPersonalizedDefaultToken, trackTokenSelection, trackTokenPurchase } from "@/lib/userBehavior/tokenTracker"
import { ConfirmRampModal } from "../components/modals/confirm-ramp-modal"
import { PaymentMethodSelector } from "../components/payment-method-selector"
import { useExchangeRateWithFallback } from "@/lib/hooks/useExchangeRate"
import { ExchangeRateSkeleton } from "../components/ui/exchange-rate-skeleton"
import { formatCurrency, parseNairaAmount } from "@/lib/utils/formatter"

type TokenStats = {
  selections: number
  purchases: number
  lastSelected: number
  lastPurchased: number
}

const CRYPTO_TOKENS = [
  {
    symbol: "SOL",
    name: "Solana",
    label: "Solana",
    icon: "/icons/sol.svg",
    tokenAddress: "So11111111111111111111111111111111111111112",
    // isFavorite: true,
    isPopular: false,
  },

  {
    symbol: "USDC",
    name: "USD Coin",
    label: "Circle USD",
    icon: "/icons/usdc.svg",
    tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    isPopular: true,
  },

  {
    symbol: "USDT",
    name: "Tether USD",
    label: "Tether USD",
    icon: "/icons/usdt.svg",
    tokenAddress: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    isPopular: true,
  },
]

interface RampInterfaceProps {
  fromAmount: string
  toAmount: string
  onFromAmountChange: (value: string) => void
  tokenSymbol: string
  fiatCurrency: string
  onCurrencyChange: (currency: string) => void
  receiving: number
  balance?: number
  selectedWallet?: {
    id: string
    type: "bank" | "wallet"
    name: string
    details: string
    accountName: string
    isDefault: boolean
    walletAddress?: string
    bankCode?: string
    accountNumber?: string
  } | null
  onWalletSelect?: () => void
  selectedPaymentMethod?: string | null
  onPaymentMethodSelect?: (method: string) => void
  rampMode?: "onramp" | "offramp"
  onRampModeChange?: (mode: "onramp" | "offramp") => void
}

export function RampInterface({
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
  rampMode: externalRampMode,
  onRampModeChange: externalOnRampModeChange,
}: RampInterfaceProps) {
  const [internalRampMode, setInternalRampMode] = useState<"onramp" | "offramp">("onramp")
  const rampMode = externalRampMode ?? internalRampMode

  const handleRampModeChange = (mode: "onramp" | "offramp") => {
    console.log("[v0] Ramp mode changed to:", mode)
    setInternalRampMode(mode)
    externalOnRampModeChange?.(mode)
  }

  const [showSettings, setShowSettings] = useState(false)
  const [isTokenModalOpen, setTokenModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null)
  const [selectedToken, setSelectedToken] = useState<Token | null>(null)
  const [formattedAmount, setFormattedAmount] = useState("")

  const { user } = useAuth()

  // Get exchange rate for the selected token
  const {
    exchangeRate,
    loading: rateLoading,
    error: rateError,
    refreshRate,
    effectiveRate,
    convertNGNToToken: convertNGNToTokenAmount,
  } = useExchangeRateWithFallback(tokenSymbol, 850)

  useEffect(() => {
    const isValid = CRYPTO_TOKENS.some((t) => t.symbol === tokenSymbol)
    if (!isValid || tokenSymbol === "NGN") {
      const personalized = getPersonalizedDefaultToken(user?.id, CRYPTO_TOKENS)
      onCurrencyChange(personalized)
    }
  }, [tokenSymbol, onCurrencyChange, user])

  // Sync formatted amount with fromAmount prop
  useEffect(() => {
    if (fromAmount) {
      setFormattedAmount(formatCurrency(fromAmount))
    } else {
      setFormattedAmount("")
    }
  }, [fromAmount])

  // Handle input change with formatting
  const handleAmountChange = (value: string) => {
    const formatted = formatCurrency(value)
    setFormattedAmount(formatted)

    // Parse the formatted value back to numeric for the parent component
    const numericValue = parseNairaAmount(formatted)
    onFromAmountChange(numericValue.toString())
  }

  // Handle wheel event to prevent scroll increment/decrement
  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur()
  }

  // Open confirmation modal
  function openConfirm() {
    if (!user) {
      alert("Please login first")
      return
    }
    if (!fromAmount || Number(fromAmount) <= 0) {
      alert("Enter a valid amount")
      return
    }
    if (!selectedWallet) {
      alert("Please select a wallet")
      return
    }
    if (!selectedPaymentMethod) {
      alert("Please select a payment method")
      return
    }
    setShowConfirm(true)
  }

  // Create onramp after confirmation
  async function handleConfirm() {
    setLoading(true)
    try {
      const walletAddress = selectedWallet?.walletAddress || user?.wallet_address || "YOUR_WALLET_ADDRESS"

      const res = await createOnramp({
        fiatAmount: Number(fromAmount),
        fiatCurrency: fiatCurrency,
        tokenSymbol: tokenSymbol,
        tokenAmount: toAmount,
        exchangeRate: exchangeRate?.rate,
        tokenMint: CRYPTO_TOKENS.find((t) => t.symbol === tokenSymbol)?.tokenAddress || "",
        walletAddress: walletAddress,
        walletInfo: selectedWallet,
        paymentMethods: selectedPaymentMethod ? [selectedPaymentMethod] : ["CARD"],
      })

      if (res?.data?.checkout_url) {
        trackTokenPurchase(user?.id, tokenSymbol)
        setCheckoutUrl(res.data.checkout_url)
      } else {
        alert("Failed to initialize payment")
      }
    } catch (err: any) {
      console.error("Onramp error:", err.message)
      alert(err.message)
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  return (
    <div className="flex-1 mx-auto max-w-md">
      <div className="flex flex-col gap-4">
        <Card className="bg-card/50 backdrop-blur-sm" data-tour="onramp-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {rampMode === "onramp" ? (
                  <ArrowUpCircle className="w-5 h-5 text-primary" />
                ) : (
                  <ArrowDownCircle className="w-5 h-5 text-primary" />
                )}
                <h2 className="text-lg font-semibold">{rampMode === "onramp" ? "On-Ramp (Buy)" : "Off-Ramp (Sell)"}</h2>
              </div>
            </CardTitle>

            <div className="flex items-center gap-2 mt-3">
              <div className="inline-flex items-center rounded-lg bg-muted p-1 w-full">
                <Button
                  variant={rampMode === "onramp" ? "default" : "ghost"}
                  size="sm"
                  className={`flex-1 h-8 text-xs font-medium transition-all ${
                    rampMode === "onramp"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => handleRampModeChange("onramp")}
                  aria-label="Switch to buy mode"
                >
                  <ArrowUpCircle className="w-3.5 h-3.5 mr-1.5" />
                  Buy
                </Button>
                <Button
                  variant={rampMode === "offramp" ? "default" : "ghost"}
                  size="sm"
                  className={`flex-1 h-8 text-xs font-medium transition-all ${
                    rampMode === "offramp"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => handleRampModeChange("offramp")}
                  aria-label="Switch to sell mode"
                >
                  <ArrowDownCircle className="w-3.5 h-3.5 mr-1.5" />
                  Sell
                </Button>
              </div>
            </div>

            <CardDescription className="text-xs text-muted-foreground mt-2">
              {rampMode === "onramp"
                ? selectedWallet
                  ? `Convert NGN to ${tokenSymbol} and deposit to: ${selectedWallet.name} (${selectedWallet.details})`
                  : "Convert NGN to crypto and deposit to your chosen wallet"
                : selectedWallet
                  ? `Convert ${tokenSymbol} to NGN and withdraw to: ${selectedWallet.name} (${selectedWallet.details})`
                  : "Convert crypto to NGN and withdraw to your chosen account"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="px-4 space-y-4">
              {rampMode === "onramp" ? (
                <>
                  {/* You Pay - NGN for onramp */}
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                    <div className="text-xs text-muted-foreground mb-2">You Pay</div>
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

                      <Button
                        variant="outline"
                        className="flex items-center gap-2 px-2 py-1 rounded-lg bg-muted/50 hover:bg-muted/70 border border-border/50 text-foreground"
                        aria-label="Fiat currency"
                      >
                        <img src={logoNGN || "/placeholder.svg"} alt="NGN" className="w-5 h-5" />
                        <span className="font-medium text-sm">NGN</span>
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

                  {/* You Receive - Crypto for onramp */}
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                    <div className="text-xs text-muted-foreground mb-2">You Receive</div>
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
                          src={CRYPTO_TOKENS.find((t) => t.symbol === tokenSymbol)?.icon || "/placeholder.svg"}
                          alt={tokenSymbol}
                          className="w-5 h-5"
                        />
                        <span className="font-medium text-sm">{tokenSymbol}</span>
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* You Pay - Crypto for offramp */}
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                    <div className="text-xs text-muted-foreground mb-2">You Pay</div>
                    <div className="flex items-center justify-between">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={formattedAmount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        onWheel={handleWheel}
                        className="text-2xl font-bold bg-transparent border-none outline-none w-full"
                        placeholder="0"
                        aria-label="Amount to pay in crypto"
                      />

                      <Button
                        variant="outline"
                        className="flex items-center gap-2 px-2 py-1 rounded-lg bg-muted/50 hover:bg-muted/70 border border-border/50 text-foreground"
                        onClick={() => setTokenModalOpen(true)}
                        aria-label="Select cryptocurrency"
                      >
                        <img
                          src={CRYPTO_TOKENS.find((t) => t.symbol === tokenSymbol)?.icon || "/placeholder.svg"}
                          alt={tokenSymbol}
                          className="w-5 h-5"
                        />
                        <span className="font-medium text-sm">{tokenSymbol}</span>
                        <ChevronDown className="w-4 h-4 ml-1" />
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

                  {/* You Receive - NGN for offramp */}
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                    <div className="text-xs text-muted-foreground mb-2">You Receive</div>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold">
                        {receiving > 0
                          ? receiving.toLocaleString("en-US", {
                              maximumFractionDigits: 2,
                            })
                          : "0.00"}
                      </div>
                      <Button
                        variant="outline"
                        className="flex items-center gap-2 px-2 py-1 rounded-lg bg-muted/50 hover:bg-muted/70 border border-border/50 text-foreground"
                        aria-label="Fiat currency"
                      >
                        <img src={logoNGN || "/placeholder.svg"} alt="NGN" className="w-5 h-5" />
                        <span className="font-medium text-sm">NGN</span>
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* Wallet Selection */}
              {fromAmount && Number(fromAmount) > 0 && (
                <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground">{rampMode === "onramp" ? "To:" : "To:"}</div>
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
                            <div className="text-xs font-medium text-foreground">{selectedWallet.name}</div>
                            <div className="text-xs text-muted-foreground">{selectedWallet.details}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center">
                            {rampMode === "onramp" ? (
                              <Wallet className="h-3 w-3 text-orange-500" />
                            ) : (
                              <Building2 className="h-3 w-3 text-orange-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-orange-600 font-medium">
                            <span>{rampMode === "onramp" ? "Select wallet" : "Select account"}</span>
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
                      aria-label={selectedWallet ? "Change wallet" : "Select wallet"}
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
                    <div className="text-xs text-muted-foreground">Payment Method</div>
                    {!selectedPaymentMethod && <AlertCircle className="h-4 w-4 text-orange-600" />}
                  </div>
                  <PaymentMethodSelector
                    selectedMethod={selectedPaymentMethod || null}
                    onMethodSelect={onPaymentMethodSelect || (() => {})}
                    disabled={loading}
                  />
                </div>
              )}

              {/* Action Button */}
              <Button
                className="w-full h-12 rounded-xl text-base font-semibold bg-primary hover:bg-primary/90"
                size="lg"
                disabled={!fromAmount || !selectedWallet || !selectedPaymentMethod || loading}
                onClick={openConfirm}
                aria-label={`${rampMode === "onramp" ? "Buy" : "Sell"} ${tokenSymbol}`}
              >
                {loading
                  ? "Processing..."
                  : !fromAmount
                    ? "Enter amount"
                    : !selectedWallet
                      ? rampMode === "onramp"
                        ? "Select wallet"
                        : "Select account"
                      : !selectedPaymentMethod
                        ? "Select payment method"
                        : `${rampMode === "onramp" ? "Buy" : "Sell"} ${tokenSymbol}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {showSettings && <OnrampSettings onClose={() => setShowSettings(false)} />}

      <TokenListModal
        tokens={CRYPTO_TOKENS}
        selected={tokenSymbol}
        isOpen={isTokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
        onSelect={(token) => {
          setSelectedToken(token)
          onCurrencyChange(token.symbol)
          trackTokenSelection(user?.id, token.symbol)
          setTokenModalOpen(false)
        }}
      />

      {showConfirm && (
        <ConfirmRampModal
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

      {checkoutUrl && <CheckoutModal url={checkoutUrl} onClose={() => setCheckoutUrl(null)} />}
    </div>
  )
}
