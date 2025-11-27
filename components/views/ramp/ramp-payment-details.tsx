"use client"

import { useState, useEffect } from "react"
import { Copy, CheckCircle2, AlertCircle, X, Clock, Wallet, Network, Hash } from "lucide-react"

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

// Simple QR Code generator using canvas
const QRCodeCanvas = ({ value, size = 200 }: { value: string; size?: number }) => {
  const canvasRef = useState<HTMLCanvasElement | null>(null)[0]
  
  useEffect(() => {
    if (!canvasRef) return
    
    const ctx = canvasRef.getContext('2d')
    if (!ctx) return
    
    // Simple QR-like pattern (for demo - use real QR library in production)
    const moduleSize = size / 25
    ctx.fillStyle = '#000000'
    
    // Create a pseudo-random pattern based on the value
    const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    
    for (let i = 0; i < 25; i++) {
      for (let j = 0; j < 25; j++) {
        const seed = (i * 25 + j + hash) % 100
        if (seed % 3 === 0) {
          ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize)
        }
      }
    }
  }, [value, size, canvasRef])
  
  return <canvas ref={(ref) => canvasRef = ref} width={size} height={size} />
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
  const [timeLeft, setTimeLeft] = useState("")
  const [copiedItem, setCopiedItem] = useState<string | null>(null)
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    setCopiedItem(label)
    setTimeout(() => setCopiedItem(null), 2000)
  }

  const CopyButton = ({ text, label }: { text: string; label: string }) => (
    <button
      onClick={() => copyToClipboard(text, label)}
      className="ml-2 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors group"
      title="Copy"
    >
      {copiedItem === label ? (
        <CheckCircle2 className="h-4 w-4 text-green-500" />
      ) : (
        <Copy className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
      )}
    </button>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] overflow-hidden flex flex-col">
        
        {/* Header with Timer */}
        <div className="relative bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="text-sm font-medium opacity-90 mb-1">Complete Payment</div>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-4xl font-bold">{amountCrypto}</span>
            <span className="text-xl font-semibold opacity-90">{asset}</span>
          </div>
          
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            isExpired ? 'bg-red-500/90' : 'bg-white/20'
          }`}>
            <Clock className="h-4 w-4" />
            <span className="font-mono font-semibold">{timeLeft}</span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* QR Code Section */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
            <div className="flex flex-col items-center">
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Scan to Pay
              </div>
              <div className="bg-white p-4 rounded-xl shadow-md">
                <QRCodeCanvas value={walletAddress} size={180} />
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                Scan this QR code with your wallet app
              </div>
            </div>
          </div>

          {/* Critical Warning */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-xl p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold text-amber-900 dark:text-amber-200 text-sm mb-1">
                  Critical: Network & Asset Must Match
                </div>
                <div className="text-xs text-amber-800 dark:text-amber-300">
                  Only send <strong>{asset}</strong> on <strong>{network}</strong> network. Wrong network = permanent loss of funds.
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Address */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Wallet className="h-4 w-4" />
                Wallet Address
              </div>
              <CopyButton text={walletAddress} label="address" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 font-mono text-sm break-all border-2 border-gray-200 dark:border-gray-700">
              {walletAddress}
            </div>
          </div>

          {/* Amount (copyable) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                Exact Amount
              </div>
              <CopyButton text={amountCrypto.toString()} label="amount" />
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg p-4 border-2 border-indigo-200 dark:border-indigo-800">
              <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono">
                {amountCrypto} {asset}
              </div>
            </div>
          </div>

          {/* Network & Request ID */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                <Network className="h-3.5 w-3.5" />
                Network
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-sm font-semibold text-gray-900 dark:text-white">
                {network}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                  <Hash className="h-3.5 w-3.5" />
                  Request ID
                </div>
                <CopyButton text={requestId} label="requestId" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3 text-sm font-mono text-gray-900 dark:text-white truncate">
                {requestId.slice(0, 8)}...
              </div>
            </div>
          </div>

          {/* Expiration Info */}
          <div className="text-xs text-center text-gray-500 dark:text-gray-400">
            Expires: {new Date(expiresAt).toLocaleString()}
          </div>
        </div>

        {/* Footer - Confirm Button */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button
            onClick={onConfirm}
            disabled={isExpired}
            className={`w-full py-4 px-6 rounded-xl font-bold text-lg transition-all ${
              isExpired
                ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 active:scale-[0.98] shadow-lg shadow-indigo-500/50'
            }`}
          >
            {isExpired ? "⏰ Payment Expired" : "✅ I've Sent the Payment"}
          </button>
          <div className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
            Click only after sending the exact amount
          </div>
        </div>
      </div>
    </div>
  )
      }
