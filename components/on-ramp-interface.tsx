// File: components/on-ramp-interface.tsx

"use client"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowDown, Settings, ChevronDown } from "lucide-react"
import { OnrampSettings } from "@/components/onramp-settings"
import { logoNGN } from "@/asssets/image"
import { createOnramp } from "@/lib/api/payments/onramp"
import { useAuth } from "@/context/AuthContext"

const TOKENS = [
  { symbol: "USDT", label: "Tether USDT", icon: "/images/usdt.svg" },
  { symbol: "USDC", label: "USD Coin", icon: "/images/usdc.svg" },
  { symbol: "SOL", label: "Solana", icon: "/images/sol.svg" },
]

interface OnRampInterfaceProps {
  fromAmount: string
  toAmount: string
  onFromAmountChange: (value: string) => void
  currency: string
  onCurrencyChange: (currency: string) => void
  receiving: number
  ngnToSolRate: number
  balance?: number
}

export function OnRampInterface({
  fromAmount,
  toAmount,
  onFromAmountChange,
  currency,
  onCurrencyChange,
  receiving,
  ngnToSolRate,
  balance = 0,
}: OnRampInterfaceProps) {
  const [showSettings, setShowSettings] = useState(false)
  const [tokenListOpen, setTokenListOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()

  // Handler for onramp payment
  async function handleOnramp() {
    if (!user) {
      alert("Please login first")
      return
    }
    if (!fromAmount || Number(fromAmount) <= 0) {
      alert("Enter a valid amount")
      return
    }

    setLoading(true)
    try {
      const res = await createOnramp({
        amount: Number(fromAmount),
        tokenSymbol: currency,
        tokenMint: "So11111111111111111111111111111111111111112", // TODO: replace with correct mint
        walletAddress: user.wallet_address || "YOUR_WALLET_ADDRESS", // you should store user wallet in profile/settings
      })

      console.log("Onramp response:", res)

      if (res?.data?.checkout_url) {
        // Redirect user to Monnify checkout
        window.open(res.data.checkout_url, "_blank")
      } else {
        alert("Failed to initialize payment")
      }
    } catch (err: any) {
      console.error("Onramp error:", err.message)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 mb-16">
        <Card
          className="bg-transparent backdrop-blur-sm w-full py-0 border-0"
          data-tour="onramp-card"
        >
          <CardContent className="p-0 flex-1">
            <div className="flex items-center justify-between p-4 ">
              <h2 className="text-lg font-semibold">On Ramp</h2>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 rounded-full"
                onClick={() => setShowSettings(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>

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
                    <div className="flex items-center gap-0">
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
                  <div className="text-sm text-gray-500 mb-2">You Receive</div>
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold">
                      {receiving > 0 ? receiving.toLocaleString("en-US", { maximumFractionDigits: 5 }) : "0.00"}
                    </div>
                    <div className="flex items-center gap-2 relative">
                      <button
                        type="button"
                        className="flex items-center gap-2 px-2 py-1 rounded-lg bg-muted/40 hover:bg-muted/70 border border-muted-foreground/10"
                        onClick={() => setTokenListOpen((open) => !open)}
                      >
                        <img
                          src={TOKENS.find((t) => t.symbol === currency)?.icon}
                          alt={currency}
                          className="w-5 h-5"
                        />
                        <span className="font-medium text-sm">{currency}</span>
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </button>
                      {tokenListOpen && (
                        <div className="absolute right-0 top-10 z-20 min-w-[8rem] bg-white dark:bg-gray-900 border rounded-xl shadow-lg py-2">
                          {TOKENS.map((token) => (
                            <button
                              key={token.symbol}
                              className={`flex items-center w-full px-4 py-2 gap-2 hover:bg-muted/30 ${currency === token.symbol ? "bg-muted/20" : ""}`}
                              onClick={() => {
                                onCurrencyChange(token.symbol)
                                setTokenListOpen(false)
                              }}
                            >
                              <img src={token.icon} alt={token.symbol} className="w-5 h-5" />
                              <span className="font-medium text-sm">{token.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="px-2">
                <Button
                  className="w-full h-12 rounded-2xl text-base font-semibold"
                  size="lg"
                  disabled={!fromAmount || loading}
                  onClick={handleOnramp}
                >
                  {loading ? "Processing..." : !fromAmount ? "Enter amount" : `Buy ${currency}`}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Exchange Rate Footer */}
        <div className="px-6 pb-4 flex items-center justify-between text-sm text-muted-foreground h-[48px] mt-2">
          <span>1 SOL = {ngnToSolRate.toLocaleString()} NGN</span>
          <span>$0.00</span>
        </div>
      </div>

      {showSettings && <OnrampSettings onClose={() => setShowSettings(false)} />}
    </>
  )
}
