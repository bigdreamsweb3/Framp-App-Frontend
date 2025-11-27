                    "use client"

import { useState, useEffect } from "react"
import QRCode from "react-qr-code"
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

  const CopyButton = ({ text, label, className = "" }: { text: string; label: string; className?: string }) => (
    <button
      onClick={() => copyToClipboard(text, label)}
      className={`p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors ${className}`}
      title="Copy"
    >
      {copiedItem === label ? (
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4 text-gray-500" />
      )}
    </button>
  )

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-sm">
      <div className="min-h-screen px-4 py-6 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-md relative">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors z-10"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>

          {/* Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Payment Details</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Complete your transaction</p>
          </div>

          {/* Content */}
          <div className="p-6 space-y-5">
            
            {/* Timer */}
            <div className={`text-center p-4 rounded-lg border-2 ${
              isExpired 
                ? 'bg-red-50 dark:bg-red-900/10 border-red-300 dark:border-red-800' 
                : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-center justify-center gap-2 mb-1">
                <Clock className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Time Remaining</span>
              </div>
              <div className={`text-3xl font-bold font-mono ${
                isExpired ? 'text-red-600' : 'text-gray-900 dark:text-white'
              }`}>
                {timeLeft}
              </div>
            </div>

            {/* Amount */}
            <div className="text-center p-5 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Amount to Send</span>
                <CopyButton text={amountCrypto.toString()} label="amount" />
              </div>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {amountCrypto}
                </span>
                <span className="text-xl font-semibold text-gray-600 dark:text-gray-400">{asset}</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-5 border border-gray-200 dark:border-gray-700">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 text-center">
                Scan QR Code
              </div>
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-lg">
                  <QRCode
                    value={walletAddress}
                    size={200}
                    level="H"
                  />
                </div>
              </div>
            </div>

            {/* Wallet Address */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Wallet Address</span>
                </div>
                <CopyButton text={walletAddress} label="address" />
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <code className="text-xs font-mono text-gray-900 dark:text-white break-all">
                  {walletAddress}
                </code>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-red-900 dark:text-red-200 text-sm mb-1">
                    Important Warning
                  </div>
                  <div className="text-xs text-red-800 dark:text-red-300">
                    Only send <strong>{asset}</strong> on <strong>{network}</strong> network. Sending other assets or using wrong network will result in permanent loss.
                  </div>
                </div>
              </div>
            </div>

            {/* Network & Request ID */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <Network className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Network</span>
                </div>
                <div className="text-sm font-semibold text-gray-900 dark:text-white">{network}</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Hash className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Request</span>
                  </div>
                  <CopyButton text={requestId} label="requestId" className="p-1" />
                </div>
                <div className="text-xs font-mono text-gray-900 dark:text-white truncate">
                  {requestId.slice(0, 10)}...
                </div>
              </div>
            </div>

            {/* Expiration */}
            <div className="text-xs text-center text-gray-500 dark:text-gray-400">
              Expires: {new Date(expiresAt).toLocaleString()}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 dark:border-gray-800">
            <button
              onClick={onConfirm}
              disabled={isExpired}
              className={`w-full py-3.5 px-6 rounded-lg font-semibold text-base transition-all ${
                isExpired
                  ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 active:scale-[0.98]'
              }`}
            >
              {isExpired ? "⏰ Payment Expired" : "✅ I've Sent the Payment"}
            </button>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
              Click only after sending the exact amount
            </p>
          </div>
        </div>
      </div>
    </div>
  )
      }
