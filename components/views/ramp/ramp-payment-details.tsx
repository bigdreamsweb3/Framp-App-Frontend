"use client"

import { useState, useEffect } from "react"
import QRCode from "react-qr-code"
import { Copy, CheckCircle2, AlertCircle, Zap, Shield, X, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

type Props = {
  requestId: string
  amountCrypto: number
  asset: string
  network: string
  walletAddress: string
  expiresAt: string
  onConfirm: () => void
  onClose?: () => void
}

export default function OnRampPaymentDetails({
  requestId,
  amountCrypto,
  asset,
  network,
  walletAddress,
  expiresAt,
  onConfirm,
  onClose,
}: Props) {
  const router = useRouter()
  const [timeLeft, setTimeLeft] = useState("")
  const [copied, setCopied] = useState(false)
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date(expiresAt).getTime() - Date.now()
      if (diff <= 0) {
        setTimeLeft("Expired")
        setIsExpired(true)
        clearInterval(timer)
      } else {
        const m = Math.floor(diff / 60000)
        const s = Math.floor((diff % 60000) / 1000)
        setTimeLeft(`${m}:${s.toString().padStart(2, "0")}`)
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [expiresAt])

  const copyToClipboard = () => {
    navigator.clipboard.writeText(walletAddress)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 min-h-screen md:min-h-fit grid items-center justify-center z-999 overflow-scroll">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-0" />
      <div className="bg-background z-10 ">
        {/* Header - Fixed on mobile, normal flow on desktop */}
        <div className="sticky top-0 bg-background z-10 lg:static lg:border-none">
          <div className="container max-w-7xl mx-auto px-4 py-4 lg:px-8 lg:py-8">
            <div className="flex items-center justify-between">
              {/* Title Section */}
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 lg:w-5 lg:h-5 text-primary" />
                  <span className="text-xs lg:text-sm font-medium text-primary">Payment Details</span>
                </div>
                <h2 className="text-xl lg:text-3xl font-semibold text-foreground">Complete Payment</h2>
              </div>

              <button
                onClick={() => onClose ? onClose() : router.back()}
                className="p-2 rounded-lg hover:bg-card text-foreground transition-colors z-10"
                title="Close"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 container max-w-7xl mx-auto px-4 py-6 lg:px-8 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 lg:mt-4">
            {/* Left Column */}
            <div className="space-y-4 lg:space-y-6">
              {/* QR Code */}
              <div className="rounded-xl p-4 lg:p-6 bg-card border border-border">
                <div className="text-xs lg:text-sm text-muted-foreground mb-3 lg:mb-4 font-medium text-center">
                  Scan QR Code
                </div>
                <div className="flex justify-center">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <QRCode
                      value={walletAddress}
                      size={140}
                      className="lg:w-52 lg:h-52"
                      level="H"
                    />
                  </div>
                </div>
              </div>

              {/* Wallet Address */}
              <div className="bg-muted rounded-xl p-4 lg:p-5 border border-border">
                <div className="text-xs lg:text-sm text-muted-foreground mb-3 font-medium">Wallet Address</div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-xs lg:text-sm text-foreground break-all">
                    {walletAddress}
                  </code>
                  <button
                    onClick={copyToClipboard}
                    className="flex-shrink-0 p-2 rounded-lg bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
                    title="Copy address"
                  >
                    {copied ? (
                      <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5" />
                    ) : (
                      <Copy className="w-4 h-4 lg:w-5 lg:h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-destructive/10 rounded-xl p-4 border border-destructive/30 flex gap-3">
                <AlertCircle className="w-4 h-4 lg:w-5 lg:h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-xs lg:text-sm text-destructive font-medium flex-1">
                  Send only {asset} on {network}. Other assets will be lost.
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 lg:space-y-6">
              {/* Amount Section */}
              <div className="bg-muted rounded-xl p-4 lg:p-6 border border-border">
                <div className="text-xs lg:text-sm text-muted-foreground mb-2 font-medium">Amount to Send</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl lg:text-4xl font-semibold text-foreground">
                    {amountCrypto}
                  </span>
                  <span className="text-lg lg:text-2xl font-medium text-primary">
                    {asset}
                  </span>
                </div>
              </div>

              {/* Network & Request ID */}
              <div className="grid grid-cols-2 gap-3 lg:gap-4">
                <div className="bg-muted rounded-xl p-4 border border-border">
                  <div className="text-xs lg:text-sm text-muted-foreground mb-2 font-medium">Network</div>
                  <div className="text-sm lg:text-base font-medium text-foreground">
                    {network}
                  </div>
                </div>
                <div className="bg-muted rounded-xl p-4 border border-border">
                  <div className="text-xs lg:text-sm text-muted-foreground mb-2 font-medium">Request ID</div>
                  <div className="text-xs lg:text-sm font-mono text-foreground truncate">
                    {requestId.slice(0, 8)}...
                  </div>
                </div>
              </div>

              {/* Timer */}
              <div className="bg-muted rounded-xl p-4 lg:p-6 border border-border text-center">
                <div className="text-xs lg:text-sm text-muted-foreground mb-2 lg:mb-3 font-medium">
                  Time Remaining
                </div>
                <div className={`text-2xl lg:text-4xl font-bold font-mono ${isExpired ? "text-destructive" : "text-primary"
                  }`}>
                  {timeLeft}
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={onConfirm}
                disabled={isExpired}
                className="w-full h-12 lg:h-14 rounded-xl text-base lg:text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 transition-all duration-200"
              >
                {isExpired ? "Payment Expired" : "I've Sent the Money ✅"}
              </button>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-8 lg:mt-12 flex items-center justify-center gap-2 text-xs lg:text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-primary" />
            <span>Secure blockchain transaction</span>
          </div>
        </div>

        {/* Close Button for Mobile Overlay */}
        <button
          onClick={() => onClose ? onClose() : router.back()}
          className="lg:hidden fixed top-4 right-4 p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border text-foreground transition-colors z-20"
          title="Close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}