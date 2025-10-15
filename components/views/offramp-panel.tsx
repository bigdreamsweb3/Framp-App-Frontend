"use client"

import React, { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { ChevronDown } from "lucide-react"

type TransferMethod = "wallet" | "manual"

interface AccountOption {
    id: string
    name: string
    details?: string
}

interface OfframpPanelProps {
    formattedAmount: string
    handleAmountChange: (value: string) => void
    handleWheel: (e: React.WheelEvent<HTMLInputElement>) => void
    onOpenTokenModal: () => void
    tokenSymbol: string
    tokenIcon?: string
    computedReceiving: number
    logoNGN?: string
    // Wallet integration callbacks
    onConnectWallet?: () => Promise<boolean>
    connected?: boolean
    accounts?: AccountOption[]
    selectedAccountId?: string | null
    onSelectAccount?: (id: string) => void
    onCreateOrder?: (payload: any) => Promise<any>
    onMethodSelect?: (method: TransferMethod) => void
}

export function OfframpPanel({
    formattedAmount,
    handleAmountChange,
    handleWheel,
    onOpenTokenModal,
    tokenSymbol,
    tokenIcon,
    computedReceiving,
    logoNGN,
    onConnectWallet,
    connected = false,
    accounts = [],
    selectedAccountId = null,
    onSelectAccount,
    onCreateOrder,
    onMethodSelect,
}: OfframpPanelProps) {
    const [method, setMethod] = useState<TransferMethod>("wallet")

    const selectedAccount = useMemo(() => accounts.find((a) => a.id === selectedAccountId) || null, [accounts, selectedAccountId])

    const hasAmount = useMemo(() => {
        const n = Number(formattedAmount)
        return !isNaN(n) && n > 0
    }, [formattedAmount])

    // Parent will handle create/sell actions when user selects account

    return (
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
                        placeholder="0"
                        aria-label="Amount to pay in crypto"
                    />
                    <Button
                        variant="ghost"
                        className="flex items-center gap-2 h-9 px-3 rounded-xl bg-background hover:bg-muted/60 border border-border/40 shrink-0"
                        onClick={onOpenTokenModal}
                        aria-label="Select cryptocurrency"
                    >
                        <img src={tokenIcon || "/placeholder.svg"} alt={tokenSymbol} className="w-5 h-5" />
                        <span className="font-medium text-sm">{tokenSymbol}</span>
                        <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                </div>
            </div>

            <div className="bg-muted/40 rounded-xl p-3 border border-border/30 mt-3">
                <div className="text-xs text-muted-foreground mb-2 font-medium">You receive</div>
                <div className="flex items-center justify-between gap-3">
                    <div className="text-2xl font-semibold text-foreground">
                        {computedReceiving > 0
                            ? computedReceiving.toLocaleString("en-US", {
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

            {/* Transfer method selector - only show when user entered amount */}
            {hasAmount && (
                <div className="mt-3 p-3 bg-muted/10 rounded-xl border border-border/20">
                    <div className="text-xs text-muted-foreground mb-2 font-medium">Transfer Method</div>
                    <div className="flex gap-2">
                        <button
                            className={`px-3 py-2 rounded-lg text-sm ${method === 'wallet' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                            onClick={() => {
                                setMethod('wallet')
                                onMethodSelect?.('wallet')
                            }}
                        >
                            🔗 Connect Wallet
                        </button>
                        <button
                            className={`px-3 py-2 rounded-lg text-sm ${method === 'manual' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`}
                            onClick={() => {
                                setMethod('manual')
                                onMethodSelect?.('manual')
                            }}
                        >
                            💼 Send Manually
                        </button>
                    </div>

                    {/* Account selector + actions */}
                    <div className="mt-3 space-y-2">
                        {/* Wallet method */}
                        {method === 'wallet' ? (
                            !connected ? (
                                // <div>
                                //     <div className="text-sm text-muted-foreground mb-1">Connect your wallet to proceed</div>
                                // </div>

                                ""
                            ) : (
                                <div>
                                    <div className="text-xs text-muted-foreground mb-2">Connected wallet</div>

                                </div>
                            )
                        ) : (

                            ""
                        )}

                        {/* No primary button in this panel — parent will act when user selects method/account */}
                    </div>
                </div>
            )}
        </>
    )
}
