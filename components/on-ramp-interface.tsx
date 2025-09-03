"use client"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowDown, Settings } from "lucide-react"
import { OnrampSettings } from "@/components/onramp-settings"
import { logoNGN } from "@/asssets/image"

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

  // Debug logging for component mount and updates
  useEffect(() => {
    console.log('[OnRampInterface Debug] Component mounted/updated')

    // Check if the onramp-card element exists
    const onrampCard = document.querySelector('[data-tour="onramp-card"]')
    console.log('[OnRampInterface Debug] onramp-card element:', {
      exists: !!onrampCard,
      element: onrampCard,
      rect: onrampCard?.getBoundingClientRect(),
      visible: onrampCard ? getComputedStyle(onrampCard).display !== 'none' : false,
      className: onrampCard?.className
    })

    // List all data-tour elements
    const allTourElements = document.querySelectorAll('[data-tour]')
    console.log('[OnRampInterface Debug] All data-tour elements:',
      Array.from(allTourElements).map(el => ({
        dataTour: el.getAttribute('data-tour'),
        tagName: el.tagName,
        visible: getComputedStyle(el).display !== 'none'
      }))
    )
  })

  // Additional debug on render
  useEffect(() => {
    const timer = setTimeout(() => {
      console.log('[OnRampInterface Debug] Delayed check (1000ms after render)')
      const onrampCard = document.querySelector('[data-tour="onramp-card"]')
      if (onrampCard) {
        const rect = onrampCard.getBoundingClientRect()
        console.log('[OnRampInterface Debug] Delayed onramp-card check:', {
          exists: true,
          rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height },
          computedStyle: {
            display: getComputedStyle(onrampCard).display,
            visibility: getComputedStyle(onrampCard).visibility,
            opacity: getComputedStyle(onrampCard).opacity,
          },
          offsetParent: (onrampCard as HTMLElement).offsetParent?.tagName || 'none'
        })
      } else {
        console.log('[OnRampInterface Debug] onramp-card still not found after 1000ms delay')
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Define cardClasses for custom styling (adjust as needed)
  const cardClasses = "";

  // Detect dark mode using window.matchMedia
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const match = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(match.matches);
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    match.addEventListener('change', handler);
    return () => match.removeEventListener('change', handler);
  }, []);

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
              <div className={`dark:bg-gray-800 bg-[#C2C0EB]  rounded-3xl p-6 border shadow-sm`}>
                {/* Off-Ramp Label
                <div className="mb-0">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[purple-100] dark:bg-purple-900/30 rounded-full">
                    <span className={`dark:text-white text-black text-sm font-medium`}>On-Ramp</span>
                  </div>
                </div> */}


                {/* You Pay Section */}
                <div className={`mb-[-15px] dark:bg-gray-900 bg-[#E3E2F5] rounded-lg px-4 py-2`}>
                  <div className={`text-sm dark:text-gray-400' : text-gray-500  mb-2`}>You Pay</div>
                  <div className="flex items-center justify-between">
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={balance || 0}
                      value={fromAmount}
                      onChange={(e) => onFromAmountChange(e.target.value)}
                      className="text-3xl font-bold bg-transparent border-none outline-none w-full"
                      placeholder="0.00"
                    />
                    <div className="flex items-center gap-0">
                      <div className="w-6 h-6  flex items-center justify-center">
                        <Image
                          src={logoNGN}
                          alt="Framp"
                          width={14}
                          height={14}
                          className="h-[10px] w-auto"
                        />
                      </div>
                      <span className="text-sm font-medium">NGN</span>
                    </div>
                  </div>
                </div>

                {/* Arrow Down */}
                <div className="flex justify-center mb-[-15px]">
                  <div className={`w-10 h-10 dark:bg-gray-700 bg-gray-100 border-[#C2C0EB] border-[4px] rounded-full flex items-center justify-center`}>
                    <ArrowDown className="w-5 h-5" />
                  </div>
                </div>

                {/* You Receive Section */}
                <div className={`mb-2 dark:bg-gray-900 bg-[#E3E2F5] rounded-lg px-4 py-2 `}>
                  <div className={`text-sm  dark:text-gray-400' : text-gray-500  mb-2`}>You Recieve</div>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">
                      {receiving > 0 ? receiving.toLocaleString('en-US', { maximumFractionDigits: 5 }) : '0.00'}
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={currency}
                        onChange={(e) => onCurrencyChange(e.target.value)}
                        className="bg-transparent border-none outline-none text-sm font-medium"
                      >
                        <option className="text-white" value="USD">USDT</option>
                        <option className="text-white" value="EUR">USDC</option>
                        <option className="text-white" value="GBP">USD*</option>
                      </select>
                    </div>
                  </div>
                </div>


              </div>

              {/* Action Button */}
              <Button className="w-full h-12 rounded-2xl text-base font-semibold" size="lg" disabled={!fromAmount}>
                {!fromAmount ? "Enter amount" : "Buy SOL"}
              </Button>
            </div>



          </CardContent>
        </Card>

        {/* Exchange Rate Footer */}
        <div className="px-6 pb-4 flex items-center justify-between text-sm text-muted-foreground h-[48px] mt-2 sm:text-sm max-w-md">
          <span>1 SOL = {ngnToSolRate.toLocaleString()} NGN</span>
          <span>$0.00</span>
        </div>

      </div>

      <div className="text-center text-xs text-muted-foreground mt-6 space-y-1" data-tour="auto-save">
        <p>Powered by Solana • Fast & Secure On-Ramp</p>
        {/* <p>Auto-save: 2% of purchases automatically saved</p> */}
      </div>

      {showSettings && <OnrampSettings onClose={() => setShowSettings(false)} />}
    </>
  )
}