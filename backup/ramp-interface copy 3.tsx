"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ChevronDown, Wallet, Building2, RefreshCw, AlertCircle, ArrowDownUp } from "lucide-react"
import { OnrampSettings } from "@/components/onramp-settings"
import { logoNGN } from "@/asssets/image"
import { createOnramp } from "@/lib/api/payments/onramp"
import { useAuth } from "@/context/AuthContext"
import { Button } from "@/components/ui/button"
import { CheckoutModal } from "@/components/modals/checkout-modal"
import { TokenListModal, type Token } from "@/components/modals/token-list-modal"
import { getPersonalizedDefaultToken, trackTokenSelection, trackTokenPurchase } from "@/lib/userBehavior/tokenTracker"
import { ConfirmOnRampModal } from "@/components/modals/confirm-onramp-modal"
import { PaymentMethodSelector } from "@/components/payment-method-selector"
import { useExchangeRateWithFallback } from "@/lib/hooks/useExchangeRate"
import { formatNairaInput, parseNairaAmount } from "@/lib/utils/naira-formatter"

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
  const [internalRampMode, setInternalRampMode] = useState<"onramp" | "offramp">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("rampMode")
      return (saved as "onramp" | "offramp") || "onramp"
    }
    return "onramp"
  })
  const rampMode = externalRampMode ?? internalRampMode

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("rampMode", rampMode)
    }
  }, [rampMode])

  const handleRampModeChange = (mode: "onramp" | "offramp") => {
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

  useEffect(() => {
    if (fromAmount) {
      setFormattedAmount(formatNairaInput(fromAmount))
    } else {
      setFormattedAmount("")
    }
  }, [fromAmount])

  const handleAmountChange = (value: string) => {
    const formatted = formatNairaInput(value)
    setFormattedAmount(formatted)

    const numericValue = parseNairaAmount(formatted)
    onFromAmountChange(numericValue.toString())
  }

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.currentTarget.blur()
  }

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
    if (rampMode === "onramp" && !selectedPaymentMethod) {
      alert("Please select a payment method")
      return
    }
    setShowConfirm(true)
  }

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

  const handleWalletSelect = () => {
    onWalletSelect?.()
  }

  return (
    <div className="flex-1 mx-auto max-w-md">
      <div className="flex flex-col gap-4">
        <Card className="bg-card border-border/40 shadow-lg" data-tour="onramp-card">
          <CardHeader className="pb-3 pt-4 px-4">
            <div className="inline-flex items-center gap-1 rounded-lg bg-muted/50 p-1 w-fit">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-4 text-sm font-medium rounded-md transition-all ${
                  rampMode === "onramp"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                }`}
                onClick={() => handleRampModeChange("onramp")}
                aria-label="Switch to on-ramp mode"
              >
                On Ramp
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-4 text-sm font-medium rounded-md transition-all ${
                  rampMode === "offramp"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                }`}
                onClick={() => handleRampModeChange("offramp")}
                aria-label="Switch to off-ramp mode"
              >
                Off Ramp
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <div className="space-y-1">
              {rampMode === "onramp" ? (
                <>
                  <div className="bg-muted/40 rounded-xl p-3 border border-border/30">
                    <div className="text-xs text-muted-foreground mb-2 font-medium">You pay</div>
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={formattedAmount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        onWheel={handleWheel}
                        className="text-2xl font-semibold bg-transparent border-none outline-none w-full text-foreground placeholder:text-muted-foreground/40"
                        placeholder="0.00"
                        aria-label="Amount to pay in NGN"
                      />
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 h-9 px-3 rounded-full bg-background hover:bg-muted/60 border border-border/40 shrink-0"
                        aria-label="Fiat currency"
                      >
                        <img src={logoNGN || "/placeholder.svg"} alt="NGN" className="w-5 h-5 rounded-full" />
                        <span className="font-semibold text-sm">NGN</span>
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center -my-1 relative z-10">
                    <div className="bg-background border border-border/40 rounded-full p-1.5">
                      <ArrowDownUp className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="bg-muted/40 rounded-xl p-3 border border-border/30">
                    <div className="text-xs text-muted-foreground mb-2 font-medium">You receive</div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-2xl font-semibold text-foreground">
                        {receiving > 0
                          ? receiving.toLocaleString("en-US", {
                              maximumFractionDigits: 5,
                            })
                          : "0.00"}
                      </div>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 h-9 px-3 rounded-full bg-background hover:bg-muted/60 border border-border/40 shrink-0"
                        onClick={() => setTokenModalOpen(true)}
                        aria-label="Select cryptocurrency"
                      >
                        <img
                          src={CRYPTO_TOKENS.find((t) => t.symbol === tokenSymbol)?.icon || "/placeholder.svg"}
                          alt={tokenSymbol}
                          className="w-5 h-5 rounded-full"
                        />
                        <span className="font-semibold text-sm">{tokenSymbol}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-muted/40 rounded-xl p-3 border border-border/30">
                    <div className="text-xs text-muted-foreground mb-2 font-medium">You pay</div>
                    <div className="flex items-center justify-between gap-3">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={formattedAmount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        onWheel={handleWheel}
                        className="text-2xl font-semibold bg-transparent border-none outline-none w-full text-foreground placeholder:text-muted-foreground/40"
                        placeholder="0.00"
                        aria-label="Amount to pay in crypto"
                      />
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 h-9 px-3 rounded-full bg-background hover:bg-muted/60 border border-border/40 shrink-0"
                        onClick={() => setTokenModalOpen(true)}
                        aria-label="Select cryptocurrency"
                      >
                        <img
                          src={CRYPTO_TOKENS.find((t) => t.symbol === tokenSymbol)?.icon || "/placeholder.svg"}
                          alt={tokenSymbol}
                          className="w-5 h-5 rounded-full"
                        />
                        <span className="font-semibold text-sm">{tokenSymbol}</span>
                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-center -my-1 relative z-10">
                    <div className="bg-background border border-border/40 rounded-full p-1.5">
                      <ArrowDownUp className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="bg-muted/40 rounded-xl p-3 border border-border/30">
                    <div className="text-xs text-muted-foreground mb-2 font-medium">You receive</div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-2xl font-semibold text-foreground">
                        {receiving > 0
                          ? receiving.toLocaleString("en-US", {
                              maximumFractionDigits: 2,
                            })
                          : "0.00"}
                      </div>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-2 h-9 px-3 rounded-full bg-background hover:bg-muted/60 border border-border/40 shrink-0"
                        aria-label="Fiat currency"
                      >
                        <img src={logoNGN || "/placeholder.svg"} alt="NGN" className="w-5 h-5 rounded-full" />
                        <span className="font-semibold text-sm">NGN</span>
                      </Button>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between px-3 py-2">
                {rateLoading && !exchangeRate ? (
                  <div className="text-xs text-muted-foreground">Loading rate...</div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      1 {tokenSymbol} ≈ ₦{effectiveRate.toLocaleString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 hover:bg-muted/60 rounded-full"
                      onClick={refreshRate}
                      aria-label="Refresh exchange rate"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {rateError && (
                  <div className="flex items-center gap-1 text-xs text-destructive">
                    <AlertCircle className="h-3 w-3" />
                    <span>Rate error</span>
                  </div>
                )}
              </div>

              {fromAmount && Number(fromAmount) > 0 && (
                <div className="bg-muted/30 rounded-xl p-3 border border-border/30 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {selectedWallet ? (
                        <>
                          <div className="w-7 h-7 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                            {selectedWallet.type === "wallet" ? (
                              <Wallet className="h-3.5 w-3.5 text-primary" />
                            ) : (
                              <Building2 className="h-3.5 w-3.5 text-primary" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="text-xs font-medium text-foreground truncate">{selectedWallet.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{selectedWallet.details}</div>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-7 h-7 bg-orange-100 dark:bg-orange-950 rounded-full flex items-center justify-center shrink-0">
                            {rampMode === "onramp" ? (
                              <Wallet className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                            ) : (
                              <Building2 className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                            )}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                              {rampMode === "onramp" ? "Select wallet" : "Select account"}
                            </span>
                            <AlertCircle className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                          </div>
                        </>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-3 text-xs font-medium hover:bg-muted/60 rounded-lg"
                      onClick={handleWalletSelect}
                      aria-label={selectedWallet ? "Change wallet" : "Select wallet"}
                    >
                      {selectedWallet ? "Change" : "Select"}
                    </Button>
                  </div>
                </div>
              )}

              {rampMode === "onramp" && fromAmount && Number(fromAmount) > 0 && selectedWallet && (
                <div className="bg-muted/30 rounded-xl p-3 border border-border/30 mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-xs text-muted-foreground font-medium">Payment method</div>
                    {!selectedPaymentMethod && (
                      <AlertCircle className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
                    )}
                  </div>
                  <PaymentMethodSelector
                    selectedMethod={selectedPaymentMethod || null}
                    onMethodSelect={onPaymentMethodSelect || (() => {})}
                    disabled={loading}
                  />
                </div>
              )}

              <Button
                className="w-full h-12 rounded-xl text-base font-semibold mt-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
                size="lg"
                disabled={
                  !fromAmount || !selectedWallet || (rampMode === "onramp" && !selectedPaymentMethod) || loading
                }
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
                      : rampMode === "onramp" && !selectedPaymentMethod
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

      {checkoutUrl && <CheckoutModal url={checkoutUrl} onClose={() => setCheckoutUrl(null)} />}
    </div>
  )
}
