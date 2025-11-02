"use client"

import type React from "react"
import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowUpCircle, ArrowDownCircle, ChevronDown, Wallet, Building2, RefreshCw, AlertCircle } from "lucide-react"
import { OnrampSettings } from "@/components/onramp-settings"
import { logoNGN, solana_logo } from "@/asssets/image"
import { createOnramp } from "@/lib/api/payments/onramp"
import { useAuth } from "@/context/AuthContext"
import { Button } from "../ui/button"
import { CheckoutModal } from "@/components/modals/checkout-modal"
import { TokenListModal, type Token } from "@/components/modals/token-list-modal"
import { getPersonalizedDefaultToken, trackTokenSelection, trackTokenPurchase } from "@/lib/userBehavior/tokenTracker"
import { ConfirmRampModal } from "../modals/confirm-ramp-modal"
import { PaymentMethodSelector } from "../payment-method-selector"
import { useExchangeRateWithFallback } from "@/lib/hooks/useExchangeRate"
import { ExchangeRateSkeleton } from "../ui/exchange-rate-skeleton"
import { formatCurrency, parseNairaAmount } from "@/lib/utils/formatter"
import { useFees } from "@/lib/hooks/useFees"
import { useRouter } from 'next/navigation';

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
  onCurrencyChange: (currency: string, type?: "fiat" | "crypto") => void
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
  onAccountSelect?: () => void
  selectedPaymentMethod?: string | null
  onPaymentMethodSelect?: (method: string) => void
  selectedTransferMethod?: "connect_wallet" | "manual_transfer" | null
  onTransferMethodSelect?: (method: "connect_wallet" | "manual_transfer") => void
  onConnectWallet?: () => void
  isWalletConnected?: boolean
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
  onAccountSelect,
  selectedPaymentMethod,
  onPaymentMethodSelect,
  selectedTransferMethod,
  onTransferMethodSelect,
  onConnectWallet,
  isWalletConnected,
  rampMode: externalRampMode,
  onRampModeChange: externalOnRampModeChange,
}: RampInterfaceProps) {

  const router = useRouter()

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
  const [internalSelectedTransferMethod, setInternalSelectedTransferMethod] = useState<
    "connect_wallet" | "manual_transfer" | null
  >(null)

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

  const fees = useFees(Number(fromAmount), rampMode, computedReceiving);

  useEffect(() => {
    const isValid = CRYPTO_TOKENS.some((t) => t.symbol === tokenSymbol)
    if (!isValid || tokenSymbol === "NGN") {
      const personalized = getPersonalizedDefaultToken(user?.id, CRYPTO_TOKENS)
      onCurrencyChange(personalized)
    }
  }, [tokenSymbol, onCurrencyChange, user])

  useEffect(() => {
    if (fromAmount) {
      setFormattedAmount(formatCurrency(fromAmount))
    } else {
      setFormattedAmount("")
    }
  }, [fromAmount])

  const handleAmountChange = (value: string) => {
    const formatted = formatCurrency(value)
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
    // ensure payment method for onramp
    if (rampMode === "onramp" && !selectedPaymentMethod) {
      alert("Please select a payment method")
      return
    }

    // for off-ramp require transfer method selection
    if (rampMode === "offramp") {
      if (!effectiveTransferMethod) {
        alert("Please select a transfer method")
        return
      }
      if (effectiveTransferMethod === "connect_wallet" && !selectedWallet) {
        alert("Please connect a wallet before continuing")
        return
      }
    }
    setShowConfirm(true)
  }

  async function handleConfirm() {
    setLoading(true)
    try {
      const walletAddress = selectedWallet?.walletAddress || user?.wallet_address || "YOUR_WALLET_ADDRESS"

      // Prepare common payload
      const payload = {
        fiatAmount: 0,
        fiatCurrency,
        tokenSymbol,
        tokenAmount: 0,
        exchangeRate: exchangeRate?.rate,
        tokenMint: CRYPTO_TOKENS.find((t) => t.symbol === tokenSymbol)?.tokenAddress || "",
        walletAddress,
        walletInfo: selectedWallet,
        paymentMethods: selectedPaymentMethod ? [selectedPaymentMethod] : ["CARD"],
      } as any

      if (rampMode === "onramp") {
        // user is buying crypto with fiat
        payload.fiatAmount = Number(fromAmount)
        payload.tokenAmount = Number(computedReceiving)

        const res = await createOnramp(payload)
        if (res?.data?.checkout_url) {
          trackTokenPurchase(user?.id, tokenSymbol)
          setCheckoutUrl(res.data.checkout_url)
        } else {
          alert("Failed to initialize onramp payment")
        }

      } else {
        const { createOfframp } = await import("@/lib/api/payments/offramp")

        const res = await createOfframp({
          userWallet: walletAddress,
          // expectedWalletAddress: process.env.NEXT_PUBLIC_FRAMP_POOL_WALLET as string,
          tokenSymbol,
          tokenMintAddress: CRYPTO_TOKENS.find((t) => t.symbol === tokenSymbol)?.tokenAddress || "",
          amount: Number(fromAmount),
          exchangeRate: Number(exchangeRate?.rate),
          fiatAmount: Number(computedReceiving),
          bankName: selectedWallet?.name || null,
          bankAccountNumber: selectedWallet?.accountNumber ?? "",
          bankAccountName: selectedWallet?.accountName ?? "",
          bankCode: selectedWallet?.bankCode ?? "",
          currency: fiatCurrency,
          signedTransaction: null,
        })


        const offrampId = res.offrampId

        if (selectedPaymentMethod === "CONNECTED_WALLET") {
          // user will sign + broadcast SOL transaction
          router.push(`/ramp/offramp/send/${offrampId}`)
        } else {
          // show wallet to send USDC to frampPoolWallet manually
          router.push(`/ramp/offramp/${offrampId}`)
        }
      }


    } catch (err: any) {
      console.error("Ramp error:", err)
      alert(err.message || "An error occurred during ramp processing.")
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }


  const handleWalletSelect = () => {
    if (rampMode === "offramp") {
      // Select bank account for off-ramp
      if (onAccountSelect) onAccountSelect()
      else onWalletSelect?.()
    } else {
      // Select crypto wallet for on-ramp
      onWalletSelect?.()
    }
  }


  // derive selected transfer method from props or internal state
  const effectiveTransferMethod = selectedTransferMethod ?? internalSelectedTransferMethod

  const effectiveIsWalletConnected = isWalletConnected ?? false

  const setTransferMethod = (m: "connect_wallet" | "manual_transfer") => {
    setInternalSelectedTransferMethod(m)
    onTransferMethodSelect?.(m)
  }

  return (
    <>
      <div className="flex flex-col justify-center items-center gap-3 w-full">
        <Card className="w-full mx-auto max-w-md bg-card gap-3" data-tour="onramp-card">
          <CardHeader className="flex items-center justify-between">
            {/* Mode Switcher */}
            <div className="relative w-full">
              <div className="flex justify-start">
                <div className="flex bg-muted/50 rounded-xl overflow-hidden backdrop-blur-sm relative w-[200px]">
                  {/* Animated highlight background */}
                  <div
                    className={`absolute top-0 left-0 h-full w-1/2 rounded-xl bg-gradient-to-r from-primary/15 to-primary/10 transition-transform duration-300 ease-in-out ${rampMode === "offramp" ? "translate-x-full" : "translate-x-0"
                      }`}
                  />

                  {(["onramp", "offramp"] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => handleRampModeChange(mode)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-sm md:text-[15px] font-medium transition-all duration-300 relative z-10
            ${rampMode === mode
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                        }`}
                    >
                      <span>{mode === "onramp" ? "Onramp" : "Offramp"}</span>
                      <span
                        className={`text-xs font-normal ${rampMode === mode ? "text-primary/90" : "text-muted-foreground/70"
                          }`}
                      >
                        {mode === "onramp" ? "Buy" : "Sell"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>




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
          <CardContent className="">
            <div className="space-y-3">
              {rampMode === "onramp" ? (
                <>
                  <div className="bg-muted/50 rounded-xl p-2">
                    <div className="text-xs md:text-sm font-medium text-muted-foreground mb-1">You pay</div>
                    <div className="flex items-center justify-between gap-1.5">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={formattedAmount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        onWheel={handleWheel}
                        className="text-2xl font-semibold bg-transparent border-none outline-none w-full text-foreground placeholder:text-muted-foreground/40"
                        placeholder="0"
                        aria-label="Amount to pay in NGN"
                      />
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1.5 h-7 px-2 rounded-lg bg-card hover:bg-muted/60 border border-border shrink-0"
                        aria-label="Fiat currency"
                      >
                        <img src={logoNGN || "/placeholder.svg"} alt="NGN" className="w-5 h-5" />
                        <span className="font-medium text-xs">NGN</span>
                      </Button>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-xl p-2">
                    <div className="text-xs md:text-sm font-medium text-muted-foreground mb-1">You receive</div>
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="text-2xl font-semibold text-foreground">
                        {computedReceiving > 0
                          ? computedReceiving.toLocaleString("en-US", {
                            maximumFractionDigits: 5,
                          })
                          : "0.00"}
                      </div>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1.5 h-7 px-2 rounded-lg bg-card hover:bg-muted/60 border border-border shrink-0"
                        onClick={() => setTokenModalOpen(true)}
                        aria-label="Select cryptocurrency"
                      >
                        <img
                          src={CRYPTO_TOKENS.find((t) => t.symbol === tokenSymbol)?.icon || "/placeholder.svg"}
                          alt={tokenSymbol}
                          className="w-5 h-5"
                        />
                        <span className="font-medium text-xs">{tokenSymbol}</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-muted/50 rounded-xl p-2">
                    <div className="text-xs md:text-sm font-medium text-muted-foreground mb-1">You pay</div>
                    <div className="flex items-center justify-between gap-1.5">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={formattedAmount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        onWheel={handleWheel}
                        className="text-2xl font-semibold bg-transparent border-none outline-none w-full text-foreground placeholder:text-muted-foreground/40"
                        placeholder="0"
                        aria-label="Amount to pay in crypto"
                      />
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1.5 h-7 px-2 rounded-lg bg-card hover:bg-muted/60 border border-border shrink-0"
                        onClick={() => setTokenModalOpen(true)}
                        aria-label="Select cryptocurrency"
                      >
                        <img
                          src={CRYPTO_TOKENS.find((t) => t.symbol === tokenSymbol)?.icon || "/placeholder.svg"}
                          alt={tokenSymbol}
                          className="w-5 h-5"
                        />
                        <span className="font-medium text-xs">{tokenSymbol}</span>
                        <ChevronDown className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-xl p-2">
                    <div className="text-xs md:text-sm font-medium text-muted-foreground mb-1">You receive</div>
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="text-2xl font-semibold text-foreground">
                        {computedReceiving > 0
                          ? computedReceiving.toLocaleString("en-US", {
                            maximumFractionDigits: 2,
                          })
                          : "0.00"}
                      </div>
                      <Button
                        variant="ghost"
                        className="flex items-center gap-1.5 h-7 px-2 rounded-lg bg-card hover:bg-muted/60 border border-border shrink-0"
                        aria-label="Fiat currency"
                      >
                        <img src={logoNGN || "/placeholder.svg"} alt="NGN" className="w-5 h-5" />
                        <span className="font-medium text-xs">NGN</span>
                      </Button>
                    </div>
                  </div>
                </>
              )}

              {/* Exchange & Fee */}
              <div className="flex items-center justify-between px-3 py-2">
                {rateLoading && !exchangeRate ? (
                  <div className="text-sm text-muted-foreground">Loading rate...</div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      1 {tokenSymbol} ≈ ₦{effectiveRate.toLocaleString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-3 w-3 p-0 hover:bg-muted/60 rounded-full"
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

                {fromAmount && Number(fromAmount) > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground bg-primary/5 rounded-lg px-2 py-1">
                    <span>Fee:</span>
                    <span className="font-medium">{fees.percentage}</span>
                  </div>
                )}
              </div>

              {fromAmount && Number(fromAmount) > 0 && (
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground">{rampMode === "onramp" ? "To:" : "To:"}</div>

                      {(() => {
                        const hasCorrectWalletType = selectedWallet &&
                          ((rampMode === "onramp" && selectedWallet.type === "wallet") ||
                            (rampMode === "offramp" && selectedWallet.type === "bank"));

                        return hasCorrectWalletType ? (
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                              {rampMode === "onramp" ? (
                                <Wallet className="h-3 w-3 text-primary" />
                              ) : (
                                <Building2 className="h-3 w-3 text-primary" />
                              )}
                            </div>
                            <div>
                              <div className="text-xs font-medium text-foreground">{selectedWallet.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {rampMode === "onramp"
                                  ? selectedWallet.details
                                  : `${selectedWallet.accountName} • ${selectedWallet.accountNumber}`
                                }
                              </div>
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
                              <span>{rampMode === "onramp" ? "Select wallet" : "Select bank account"}</span>
                              <AlertCircle className="h-4 w-4 text-orange-600" />
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {(() => {
                      const hasCorrectWalletType = selectedWallet &&
                        ((rampMode === "onramp" && selectedWallet.type === "wallet") ||
                          (rampMode === "offramp" && selectedWallet.type === "bank"));

                      return (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-3 text-xs font-medium text-foreground bg-card hover:bg-primary/10 rounded-xl"
                          onClick={handleWalletSelect}
                          aria-label={hasCorrectWalletType ? "Change wallet" : "Select wallet"}
                        >
                          {hasCorrectWalletType ? "Change" : "Select"}
                        </Button>
                      );
                    })()}
                  </div>
                </div>
              )}

              {rampMode === "onramp" && fromAmount && Number(fromAmount) > 0 && selectedWallet && (
                <div className="bg-muted/50 rounded-xl p-4 no-scrollbar">
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

              {rampMode === "offramp" && fromAmount && Number(fromAmount) > 0 && selectedWallet && (
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-xs text-muted-foreground">Transfer Method</div>
                    {!effectiveTransferMethod && <AlertCircle className="h-4 w-4 text-orange-600" />}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant={effectiveTransferMethod === "connect_wallet" ? "default" : "outline"}
                      size="sm"
                      className="h-9 px-3 rounded-xl"
                      onClick={() => setTransferMethod("connect_wallet")}
                      aria-label="Connect wallet transfer method"
                      disabled
                    >
                      Connect wallet
                    </Button>

                    <Button
                      variant={effectiveTransferMethod === "manual_transfer" ? "soft_gradient" : "outline"}
                      size="sm"
                      className={`h-9 px-3 rounded-xl ${effectiveTransferMethod === "manual_transfer" ? "border border-primary" : ""}`}
                      onClick={() => setTransferMethod("manual_transfer")}
                      aria-label="Manual transfer method"
                    >
                      Manual transfer
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground mt-3">
                    Choose how you want to transfer tokens. Connect wallet to send directly, or select Manual transfer to get instructions.
                  </div>
                </div>
              )}


              {/* Main action button */}
              {rampMode === "offramp" && effectiveTransferMethod === "connect_wallet" && fromAmount && Number(fromAmount) > 0 && !effectiveIsWalletConnected ? (
                <Button
                  className="w-full rounded-xl text-base font-semibold mt-0 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
                  size="lg"
                  onClick={() => {
                    if (onConnectWallet) onConnectWallet()
                    else onWalletSelect?.()
                  }}
                  aria-label="Connect wallet"
                >
                  Connect wallet
                </Button>
              ) : (() => {
                const hasCorrectWalletType = selectedWallet &&
                  ((rampMode === "onramp" && selectedWallet.type === "wallet") ||
                    (rampMode === "offramp" && selectedWallet.type === "bank"));

                return (
                  <Button
                    className="w-full rounded-xl text-base font-semibold mt-0 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
                    size="lg"
                    disabled={
                      !fromAmount ||
                      (!effectiveIsWalletConnected && effectiveTransferMethod === "connect_wallet") ||
                      (rampMode === "onramp" && (!hasCorrectWalletType || !selectedPaymentMethod)) ||
                      (rampMode === "offramp" && (!hasCorrectWalletType || !effectiveTransferMethod)) ||
                      loading
                    }
                    onClick={openConfirm}
                    aria-label={`${rampMode === "onramp" ? "Buy" : "Sell"} ${tokenSymbol}`}
                  >
                    {loading
                      ? "Processing..."
                      : !fromAmount
                        ? "Enter amount"
                        : !hasCorrectWalletType
                          ? rampMode === "onramp"
                            ? "Select wallet"
                            : "Select account"
                          : rampMode === "onramp" && !selectedPaymentMethod
                            ? "Select payment method"
                            : rampMode === "offramp" && !effectiveTransferMethod
                              ? "Select transfer method"
                              : `${rampMode === "onramp" ? "Buy" : "Sell"} ${tokenSymbol}`}
                  </Button>
                );
              })()}
            </div>
          </CardContent>
        </Card >
        {/* Powered by Solana Badge */}
<div className="relative w-full mx-auto max-w-md flex justify-end mt-[-13px] z-10">
  <div className="flex items-center gap-2  bg-gradient-to-r from-primary/15 to-primary/10 border border-border text-foreground/90 dark:text-foreground text-[11px] font-medium px-3 py-1.5 rounded-full rounded-t-none shadow-[0_2px_6px_rgba(0,0,0,0.15)] border border-white/20 backdrop-blur-sm">
    <img src={solana_logo} alt="Solana" className="w-3.5 h-3.5" />
    <span className="tracking-wide">Powered by Solana</span>
  </div>
</div>

      </div>
      {showSettings && <OnrampSettings onClose={() => setShowSettings(false)} />
      }

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

      <ConfirmRampModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        rampMode={rampMode}
        fiatAmount={fromAmount}
        fiatCurrency={fiatCurrency}
        tokenAmount={fromAmount}
        tokenSymbol={tokenSymbol}
        receiveAmount={computedReceiving}
        exchangeRate={effectiveRate}
        selectedWallet={selectedWallet}
        selectedPaymentMethod={selectedPaymentMethod}
        selectedTransferMethod={effectiveTransferMethod}
        isWalletConnected={effectiveIsWalletConnected}
        user={user}
        onConfirm={handleConfirm}
        loading={loading}
      />


      {checkoutUrl && <CheckoutModal url={checkoutUrl} onClose={() => setCheckoutUrl(null)} />}
    </>
  )
}
