"use client"

import { useState, useEffect } from "react"
import QRCode from "react-qr-code"
import { Copy, CheckCircle2, AlertCircle, Zap, Shield, X, ArrowLeft,  ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

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
  const [expandedId, setExpandedId] = useState<string | null>(null)

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
    toast.success("Copied to clipboard")
    setTimeout(() => setCopied(false), 2000)
  }

  const toggleExpanded = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    setExpandedId(expandedId === id ? null : id)
  }

  const getPaymentIcon = () => (
    <Zap className="h-4 w-4 text-green-600" />
  )

  const getPaymentBg = () => "bg-green-50 dark:bg-green-900/30"

  const truncateAddress = (address: string, start = 6, end = 4): string => {
    return `${address.slice(0, start)}...${address.slice(-end)}`
  }

  return (
    <div className="fixed inset-0 min-h-screen md:min-h-fit grid items-center justify-center z-999 overflow-scroll">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-0" />
      <div className="bg-background z-10 w-full max-w-md mx-auto sm:max-w-2xl">
        {/* Header */}
        <Card className="border-0 shadow-none">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              {getPaymentIcon()}
              Payment Details
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onClose ? onClose() : router.back()}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </CardHeader>
        </Card>

        {/* Main Content */}
        <div className="space-y-4 p-2">
          {/* QR Code Card */}
          <Card className="border rounded-md overflow-hidden bg-card">
            <div
              className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => toggleExpanded('qr')}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded flex items-center justify-center ${getPaymentBg()}`}>
                    <QRCode
                      value={walletAddress}
                      size={32}
                      level="H"
                    />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs font-medium truncate">Scan QR Code</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    Generate QR for wallet address
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => toggleExpanded('qr', e)}
                className="h-6 w-6 p-0 text-xs text-muted-foreground hover:text-foreground"
              >
                <ChevronDown className={`h-3 w-3 transition-transform ${expandedId === 'qr' ? 'rotate-180' : ''}`} />
              </Button>
            </div>
            {expandedId === 'qr' && (
              <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 px-2 pb-2">
                <div className="flex justify-center p-2">
                  <div className="p-2 bg-white rounded shadow-sm">
                    <QRCode
                      value={walletAddress}
                      size={140}
                      level="H"
                    />
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Wallet Address Card */}
          <Card className="border rounded-md overflow-hidden bg-card">
            <div
              className="flex items-center justify-between p-2 cursor-pointer hover:bg-muted transition-colors"
              onClick={() => toggleExpanded('address')}
            >
              <div className="flex items-center gap-3 flex-1">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 rounded flex items-center justify-center ${getPaymentBg()}`}>
                    {getPaymentIcon()}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-xs font-medium truncate">Wallet Address</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {truncateAddress(walletAddress)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        copyToClipboard()
                      }}
                      className="h-6 w-6 p-0"
                    >
                      {copied ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy address</TooltipContent>
                </Tooltip>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => toggleExpanded('address', e)}
                  className="h-6 w-6 p-0 text-xs text-muted-foreground hover:text-foreground"
                >
                  <ChevronDown className={`h-3 w-3 transition-transform ${expandedId === 'address' ? 'rotate-180' : ''}`} />
                </Button>
              </div>
            </div>
            {expandedId === 'address' && (
              <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 px-2 pb-2">
                <p className="flex items-center justify-between">
                  <span>Full Address:</span>
                  <code className="font-mono break-all">{walletAddress}</code>
                </p>
              </div>
            )}
          </Card>

          {/* Warning Card */}
          <Card className="border rounded-md overflow-hidden bg-destructive/10 border-destructive/30">
            <div className="p-2">
              <div className="flex items-center gap-2 text-xs text-destructive font-medium">
                <AlertCircle className="h-3 w-3 flex-shrink-0" />
                <span>Send only {asset} on {network}. Other assets will be lost.</span>
              </div>
            </div>
          </Card>

          {/* Amount Card */}
          <Card className="border rounded-md overflow-hidden bg-card">
            <div className="p-2 text-center">
              <div className="text-xs text-muted-foreground mb-1 font-medium">Amount to Send</div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-lg font-semibold text-foreground">
                  {amountCrypto}
                </span>
                <Badge variant="secondary" className="text-xs">{asset}</Badge>
              </div>
            </div>
          </Card>

          {/* Network & Request ID Cards */}
          <div className="grid grid-cols-2 gap-2">
            <Card className="border rounded-md overflow-hidden bg-card col-span-2 sm:col-span-1">
              <div className="p-2">
                <div className="text-xs text-muted-foreground mb-1 font-medium">Network</div>
                <div className="text-xs font-medium text-foreground">
                  {network}
                </div>
              </div>
            </Card>
            <Card className="border rounded-md overflow-hidden bg-card col-span-2 sm:col-span-1">
              <div className="p-2">
                <div className="text-xs text-muted-foreground mb-1 font-medium">Request ID</div>
                <div className="text-xs font-mono text-foreground truncate">
                  {requestId.slice(0, 8)}...
                </div>
              </div>
            </Card>
          </div>

          {/* Timer Card */}
          <Card className="border rounded-md overflow-hidden bg-card">
            <div
              className={`p-2 text-center cursor-pointer hover:bg-muted transition-colors ${isExpired ? "bg-destructive/10 border-destructive/30" : ""}`}
              onClick={() => toggleExpanded('timer')}
            >
              <div className="text-xs text-muted-foreground mb-1 font-medium">Time Remaining</div>
              <div className={`text-lg font-bold font-mono ${isExpired ? "text-destructive" : "text-primary"}`}>
                {timeLeft}
              </div>
            </div>
            {expandedId === 'timer' && (
              <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 px-2 pb-2">
                <p className="flex items-center justify-between">
                  <span>Expires At:</span>
                  <span>{new Date(expiresAt).toLocaleString()}</span>
                </p>
              </div>
            )}
          </Card>

          {/* Confirm Button */}
          <Button
            onClick={onConfirm}
            disabled={isExpired}
            className="w-full rounded-md text-sm font-medium bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-primary/20 transition-all"
            size="lg"
          >
            {isExpired ? "Payment Expired" : "I've Sent the Money ✅"}
          </Button>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground pt-2">
            <Shield className="h-3 w-3 text-primary" />
            <span>Secure blockchain transaction</span>
          </div>
        </div>

        {/* Close Button for Mobile Overlay */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onClose ? onClose() : router.back()}
          className="lg:hidden fixed top-4 right-4 h-8 w-8 p-0 rounded-md bg-background/80 backdrop-blur-sm border"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}