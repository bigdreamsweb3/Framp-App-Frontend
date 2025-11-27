"use client"

import { useState, useEffect } from "react"
import { Copy, CheckCircle2, AlertCircle, Zap, Shield, X } from "lucide-react"

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

  // Generate QR code as SVG
  const generateQR = (text: string) => {
    // Simple QR placeholder - in production use a proper QR library
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
        <rect width="100" height="100" fill="white"/>
        <text x="50" y="50" font-size="8" text-anchor="middle" fill="black">QR Code</text>
      </svg>
    `)}`
  }

  return (
    <div className="fixed inset-0 min-h-screen grid items-center justify-center z-50 overflow-y-auto p-4">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl z-10 w-full max-w-md mx-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Zap className="h-4 w-4 text-green-600" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Payment Details</h2>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* QR Code */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-3">Scan QR Code</div>
            <div className="flex justify-center">
              <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="w-40 h-40 bg-gray-100 flex items-center justify-center">
                  <div className="text-xs text-gray-500 text-center">
                    QR Code<br/>Placeholder
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Amount to Send */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">Amount to Send</div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {amountCrypto}
              </div>
              <div className="inline-block px-3 py-1 bg-green-100 dark:bg-green-900/50 rounded-full text-sm font-medium text-green-700 dark:text-green-300">
                {asset}
              </div>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Wallet Address</div>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 rounded p-3 break-all">
              <code className="text-xs font-mono text-gray-900 dark:text-gray-100">
                {walletAddress}
              </code>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-red-900 dark:text-red-200 font-medium">
                <strong>Important:</strong> Send only {asset} on {network} network. Sending other assets or using wrong network will result in permanent loss of funds.
              </div>
            </div>
          </div>

          {/* Network & Request ID */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Network</div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">{network}</div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Request ID</div>
              <div className="text-sm font-mono font-semibold text-gray-900 dark:text-white truncate">
                {requestId.slice(0, 10)}...
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className={`rounded-lg p-4 border ${
            isExpired 
              ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
          }`}>
            <div className="text-center">
              <div className="text-xs text-gray-700 dark:text-gray-300 mb-2 font-medium">Time Remaining</div>
              <div className={`text-2xl font-bold font-mono ${
                isExpired ? 'text-red-600' : 'text-blue-600'
              }`}>
                {timeLeft}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Expires: {new Date(expiresAt).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <button
            onClick={onConfirm}
            disabled={isExpired}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all ${
              isExpired
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700 active:scale-[0.98] shadow-lg shadow-green-600/30'
            }`}
          >
            {isExpired ? "Payment Expired" : "I've Sent the Money ✅"}
          </button>

          {/* Security Badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400 pt-2">
            <Shield className="h-3 w-3 text-green-600" />
            <span>Secure blockchain transaction</span>
          </div>
        </div>
      </div>
    </div>
  )
    }
