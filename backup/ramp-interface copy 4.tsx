"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowUpCircle, ArrowDownCircle, ChevronDown, Wallet, Building2, RefreshCw, AlertCircle } from "lucide-react"
import { OnrampSettings } from "@/components/onramp-settings"
import { logoNGN } from "@/asssets/image"
import { createOnramp } from "@/lib/api/payments/onramp"
import { useAuth } from "@/context/AuthContext"
import { Button } from "../ui/button"
import { CheckoutModal } from "@/components/modals/checkout-modal"
import { TokenListModal, type Token } from "@/components/modals/token-list-modal"
import { getPersonalizedDefaultToken, trackTokenSelection, trackTokenPurchase } from "@/lib/userBehavior/tokenTracker"
import { ConfirmOnRampModal } from "../modals/confirm-onramp-modal"
import { PaymentMethodSelector } from "../payment-method-selector"
import { useExchangeRateWithFallback } from "@/lib/hooks/useExchangeRate"
import { ExchangeRateSkeleton } from "../ui/exchange-rate-skeleton"
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
    console.log("[v0] RampInterface mounted/updated")
    console.log("[v0] externalRampMode:", externalRampMode)
    console.log("[v0] internalRampMode:", internalRampMode)
    console.log("[v0] effective rampMode:", rampMode)
  }, [externalRampMode, internalRampMode, rampMode])

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("rampMode", rampMode)
    }
  }, [rampMode])

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

  // determine mode for exchange rate requests
  const rateMode: 'buy' | 'sell' = rampMode === 'onramp' ? 'buy' : 'sell';

  const {
    exchangeRate,
    loading: rateLoading,
    error: rateError,
    refreshRate,
    effectiveRate,
    convertNGNToToken: convertNGNToTokenAmount,
  } = useExchangeRateWithFallback(tokenSymbol, 850, rateMode)

  // Derive the displayed "receiving" value locally so it updates immediately when mode changes.
  // - onramp (buy): fromAmount is NGN -> receiving = NGN / rate (tokens)
  // - offramp (sell): fromAmount is token amount -> receiving = tokens * rate (NGN)
  const computedReceiving = useMemo(() => {
    const amt = Number(fromAmount || 0);
    if (!amt || amt <= 0) return 0;
    if (rateMode === 'buy') {
      // buying tokens with NGN
      return amt / effectiveRate;
    } else {
      // selling tokens for NGN
      return amt * effectiveRate;
    }
  }, [fromAmount, effectiveRate, rateMode]);

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

      // Prepare payload based on ramp mode
      const payload = {
        fiatAmount: 0,
        fiatCurrency: fiatCurrency,
        tokenSymbol: tokenSymbol,
        tokenAmount: 0,
        exchangeRate: exchangeRate?.rate,
        tokenMint: CRYPTO_TOKENS.find((t) => t.symbol === tokenSymbol)?.tokenAddress || "",
        walletAddress: walletAddress,
        walletInfo: selectedWallet,
        paymentMethods: selectedPaymentMethod ? [selectedPaymentMethod] : ["CARD"],
      } as any

      if (rampMode === 'onramp') {
        // buying tokens with NGN: fromAmount is NGN, computedReceiving is tokens
        payload.fiatAmount = Number(fromAmount)
        payload.tokenAmount = Number(computedReceiving)
      } else {
        // selling tokens for NGN: fromAmount is token amount, computedReceiving is NGN
        payload.fiatAmount = Number(computedReceiving)
        payload.tokenAmount = Number(fromAmount)
      }

      const res = await createOnramp(payload)

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
    <>
      <Card className="w-full mx-auto max-w-md bg-card dark:bg-card/50 backdrop-blur-sm" data-tour="onramp-card">
        <CardHeader>


          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* {rampMode === "onramp" ? (
                      <ArrowUpCircle className="w-5 h-5 text-primary" />
                    ) : (
                      <ArrowDownCircle className="w-5 h-5 text-primary" />
                    )} */}
              {/* <h2 className="text-lg font-semibold flex items-center gap-1">
                      {rampMode === "onramp" ? (
                        <>
                          Buy <span className="text-xs text-muted-foreground">(On-Ramp)</span>
                        </>
                      ) : (
                        <>
                          Sell <span className="text-xs text-muted-foreground">(Off-Ramp)</span>
                        </>
                      )}
                    </h2> */}

              {/* Mode Switcher */}
              <div className="inline-flex items-center gap-1 rounded-lg bg-muted/50 p-1 w-fit">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-4 text-sm font-medium rounded-md transition-all ${rampMode === "onramp"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                    }`}
                  onClick={() => handleRampModeChange("onramp")}
                  aria-label="Switch to on-ramp mode"
                >
                  Buy
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-8 px-4 text-sm font-medium rounded-md transition-all ${rampMode === "offramp"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-transparent"
                    }`}
                  onClick={() => handleRampModeChange("offramp")}
                  aria-label="Switch to off-ramp mode"
                >
                  Sell
                </Button>
              </div>
            </div>
          </CardTitle>


          {/* <CardDescription className="text-xs text-muted-foreground mt-2">
                  {rampMode === "onramp"
                    ? selectedWallet
                      ? `Convert NGN to ${tokenSymbol} and deposit to: ${selectedWallet.name} (${selectedWallet.details})`
                      : "Convert NGN to crypto and deposit to your chosen wallet"
                    : selectedWallet
                      ? `Convert ${tokenSymbol} to NGN and withdraw to: ${selectedWallet.name} (${selectedWallet.details})`
                      : "Convert crypto to NGN and withdraw to your chosen account"}
                </CardDescription> */}
        </CardHeader>
        <CardContent className="p-0">
          <div className="px-4 space-y-4">
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
                      aria-label="Amount to pay in crypto"
                    />
                    <Button
                      variant="ghost"
                      className="flex items-center gap-2 h-9 px-3 rounded-xl bg-background hover:bg-muted/60 border border-border/40 shrink-0"
                      aria-label="Fiat currency"
                    >
                      <img src={logoNGN || "/placeholder.svg"} alt="NGN" className="w-5 h-5" />
                      <span className="font-medium text-sm">NGN</span>
                    </Button>
                  </div>
                </div>

                {/* <div className="flex items-center justify-between bg-primary/10 rounded-xl px-3 py-2">
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
                  </div> */}

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
                      className="flex items-center gap-2 h-9 px-3 rounded-xl bg-background hover:bg-muted/60 border border-border/40 shrink-0"
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
                      className="flex items-center gap-2 h-9 px-3 rounded-xl bg-background hover:bg-muted/60 border border-border/40 shrink-0"
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

                {/* <div className="flex items-center justify-between bg-primary/10 rounded-xl px-3 py-2">
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
                  </div> */}

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
                      className="flex items-center gap-2 h-9 px-3 rounded-xl bg-background hover:bg-muted/60 border border-border/40 shrink-0"
                      aria-label="Fiat currency"
                    >
                      <img src={logoNGN || "/placeholder.svg"} alt="NGN" className="w-5 h-5" />
                      <span className="font-medium text-sm">NGN</span>
                    </Button>
                  </div>
                </div>
              </>
            )}

            {/*  */}
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
                    className="h-5 w-5 p-0 hover:bg-muted/60 rounded-xl"
                    onClick={refreshRate}
                    aria-label="Refresh exchange rate"
                  >
                    <RefreshCw className="h-3 w-3" />
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

            {fromAmount && Number(fromAmount) > 0 && (
              <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground">{rampMode === "onramp" ? "To:" : "To:"}</div>
                    {selectedWallet ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 bg-primary/10 rounded-xl flex items-center justify-center">
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
                        <div className="w-5 h-5 bg-orange-100 rounded-xl flex items-center justify-center">
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
                    onClick={handleWalletSelect}
                    aria-label={selectedWallet ? "Change wallet" : "Select wallet"}
                  >
                    {selectedWallet ? "Change" : "Select"}
                  </Button>
                </div>
              </div>
            )}

            {rampMode === "onramp" && fromAmount && Number(fromAmount) > 0 && selectedWallet && (
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
                  onMethodSelect={onPaymentMethodSelect || (() => { })}
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
          fiatCurrency={rateMode === 'buy' ? 'NGN' : 'NGN'}
          receiveAmount={computedReceiving}
          receiveToken={tokenSymbol}
          paymentMethod={selectedPaymentMethod || "Card"}
          selectedWallet={selectedWallet}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}

      {checkoutUrl && <CheckoutModal url={checkoutUrl} onClose={() => setCheckoutUrl(null)} />}
    </>
  )
}
