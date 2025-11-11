"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X } from "lucide-react"
import { useMultipleExchangeRates } from "@/lib/hooks/useExchangeRate"

export interface Token {
    symbol: string
    name: string
    icon: string
    balance?: string
    price?: string
    change24h?: number
    isPopular?: boolean
    isFavorite?: boolean
    address?: string
}

interface TokenListModalProps {
    tokens: Token[]
    selected?: string
    onSelect: (token: Token) => void
    onClose: () => void
    isOpen: boolean
}

export function TokenListModal({ tokens, selected, onSelect, onClose, isOpen }: TokenListModalProps) {
    const [searchQuery, setSearchQuery] = useState("")

    // Fetch live NGN rates for all visible tokens
    const tokenSymbols = useMemo(() => tokens.map(t => t.symbol.toUpperCase()), [tokens])
    const { exchangeRates, loading: ratesLoading } = useMultipleExchangeRates(tokenSymbols)
    const getRate = useCallback((symbol: string) => exchangeRates.get(symbol.toUpperCase())?.rate ?? null, [exchangeRates])

    const filteredTokens = useMemo(() => {
        if (searchQuery) {
            return tokens.filter(
                (token) =>
                    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    token.address?.toLowerCase().includes(searchQuery.toLowerCase()),
            )
        }
        return tokens
    }, [tokens, searchQuery])

    const popularTokens = useMemo(() => tokens.filter((token) => token.isPopular).slice(0, 6), [tokens])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-2">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-sm mx-auto bg-card border border-border rounded-xl shadow-xl animate-in fade-in-0 zoom-in-95 duration-200 sm:max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-border">
                    <h2 className="text-lg font-medium text-card-foreground">Select Token</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0">
                        <X className="h-3 w-3" />
                    </Button>
                </div>

                {/* Search */}
                <div className="p-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                        <Input
                            placeholder="Search tokens..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-8 h-9 text-sm bg-muted/50 border-border focus:bg-background"
                        />
                    </div>
                </div>

                {/* Popular Tokens Section (only show when no search) */}
                {!searchQuery && popularTokens.length > 0 && (
                    <div className="px-4 pb-2">
                        <h3 className="text-xs font-medium text-muted-foreground mb-2 px-1">Popular</h3>
                        <ScrollArea className="w-full whitespace-nowrap">
                            <div className="flex gap-2 px-1 pb-2">
                                {popularTokens.map((token) => (
                                    <Button
                                        key={token.symbol}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            onSelect(token)
                                            onClose()
                                        }}
                                        className="h-8 px-3 inline-flex items-center min-w-0 flex-1 sm:flex-none"
                                    >
                                        <img src={token.icon || "/placeholder.svg"} alt={token.symbol} className="w-3 h-3 mr-1.5 flex-shrink-0" />
                                        <span className="text-xs font-medium truncate">{token.symbol}</span>
                                    </Button>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                )}

                {/* Token List */}
                <ScrollArea className="h-72">
                    <div className="p-2 space-y-1">
                        {filteredTokens.map((token) => (
                            <Button
                                key={token.symbol}
                                variant="ghost"
                                onClick={() => {
                                    onSelect(token)
                                    onClose()
                                }}
                                className={`w-full h-auto p-3 justify-start hover:bg-muted/50 ${selected === token.symbol ? "bg-muted/30 border border-primary/20 rounded-md" : ""
                                    }`}
                            >
                                <div className="flex items-center gap-3 w-full">
                                    {/* Token Icon */}
                                    <img src={token.icon || "/placeholder.svg"} alt={token.symbol} className="w-8 h-8 rounded-full flex-shrink-0" />

                                    {/* Token Info */}
                                    <div className="flex-1 min-w-0 text-left">
                                        <div className="flex items-center justify-between">
                                            <div className="min-w-0">
                                                <p className="font-medium text-sm text-card-foreground truncate">{token.symbol}</p>
                                                <p className="text-xs text-muted-foreground truncate">{token.name}</p>
                                            </div>
                                            {getRate(token.symbol) !== null && !ratesLoading && (
                                                <span className="text-xs text-muted-foreground hidden sm:inline">
                                                    ₦{getRate(token.symbol)!.toLocaleString("en-NG", { maximumFractionDigits: 0 })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </Button>
                        ))}

                        {filteredTokens.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-sm text-muted-foreground">No tokens found</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}