"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowDown, Settings } from "lucide-react"
import { OnrampSettings } from "@/components/onramp-settings"

interface OnRampInterfaceProps {
  fromAmount: string
  toAmount: string
  onFromAmountChange: (value: string) => void
  ngnToSolRate: number
}

export function OnRampInterface({ fromAmount, toAmount, onFromAmountChange, ngnToSolRate }: OnRampInterfaceProps) {
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

            <div className="p-4 space-y-4">
              {/* You Pay */}
              <div className="space-y-2">
                <div className="bg-card rounded-2xl p-4 border border-border/50 flex flex-col gap-3.5 shadow-sm">
                  <div className="text-sm text-muted-foreground font-medium bg-muted/50 rounded-xl w-fit px-2 py-1">You Pay</div>
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={fromAmount}
                      onChange={(e) => onFromAmountChange(e.target.value)}
                      onWheel={e => (e.target as HTMLInputElement).blur()}
                      className="border-0 bg-transparent text-2xl md:text-2xl lg:text-2xl font-bold p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50 shadow-none"
                    />
                    <div className="bg-muted/50 rounded-xl px-3 py-1 h-auto">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🇳🇬</span>
                        <span className="font-semibold">NGN</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="rounded-full p-2 bg-muted/50 border border-border/50">
                  <ArrowDown className="w-4 h-4" />
                </div>
              </div>

              {/* You Receive */}
              <div className="space-y-2">

                <div className="bg-card rounded-2xl p-4 border border-border/50 flex flex-col gap-3.5 shadow-sm">
                  <div className="text-sm text-muted-foreground font-medium bg-muted/50 rounded-xl w-fit px-2 py-1">You Receive</div>
                  <div className="flex items-center justify-between gap-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={toAmount}
                      readOnly
                      className="border-0 bg-transparent text-2xl md:text-2xl lg:text-2xl font-bold p-0 h-auto focus-visible:ring-0 placeholder:text-muted-foreground/50 text-muted-foreground shadow-none"
                    />
                    <div className="bg-muted/50 rounded-xl px-3 py-1 h-auto">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">◎</span>
                        <span className="font-semibold">SOL</span>
                      </div>
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
        <div className="px-4 pb-4 flex items-center justify-between text-sm text-muted-foreground h-[48px] mt-4 sm:text-sm max-w-md">
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