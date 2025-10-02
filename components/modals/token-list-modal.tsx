"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X, Star, TrendingUp } from "lucide-react"
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
    const [activeTab, setActiveTab] = useState<"all" | "popular" | "favorites">("all")

    // Fetch live NGN rates for all visible tokens
    const tokenSymbols = useMemo(() => tokens.map(t => t.symbol.toUpperCase()), [tokens])
    const { exchangeRates, loading: ratesLoading } = useMultipleExchangeRates(tokenSymbols)
    const getRate = useCallback((symbol: string) => exchangeRates.get(symbol.toUpperCase())?.rate ?? null, [exchangeRates])

    const filteredTokens = useMemo(() => {
        let filtered = tokens

        // Filter by tab
        if (activeTab === "popular") {
            filtered = filtered.filter((token) => token.isPopular)
        } else if (activeTab === "favorites") {
            filtered = filtered.filter((token) => token.isFavorite)
        }

        // Filter by search query
        if (searchQuery) {
            filtered = filtered.filter(
                (token) =>
                    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    token.address?.toLowerCase().includes(searchQuery.toLowerCase()),
            )
        }

        return filtered
    }, [tokens, searchQuery, activeTab])

    const popularTokens = tokens.filter((token) => token.isPopular).slice(0, 6)

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-md mx-4 bg-card border border-border rounded-2xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <h2 className="text-xl font-semibold text-card-foreground">Select Token</h2>
                    <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-muted">
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Search */}
                <div className="p-6 pb-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, symbol, or address"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 bg-muted/50 border-border focus:bg-background"
                        />
                    </div>
                </div>

                {/* Popular Tokens (only show when no search) */}
                {!searchQuery && (
                    <div className="px-6 pb-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Popular Tokens</h3>
                        <div className="flex flex-wrap gap-2">
                            {popularTokens.map((token) => (
                                <Button
                                    key={token.symbol}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        onSelect(token)
                                        onClose()
                                    }}
                                    className="h-8 px-3 bg-muted/30 hover:bg-muted border-border"
                                >
                                    <img src={token.icon || "/placeholder.svg"} alt={token.symbol} className="w-4 h-4 mr-2" />
                                    <span className="text-xs font-medium">{token.symbol}</span>
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {/* All Token */}
                <div className="px-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-muted-foreground">All</h3>
                        {ratesLoading && (
                            <span className="text-[10px] text-muted-foreground">Fetching prices…</span>
                        )}
                    </div>
                </div>
                {/* Token List */}
                <ScrollArea className="h-80 px-6">
                    <div className="space-y-1 pb-6">
                        {filteredTokens.map((token) => (
                            <Button
                                key={token.symbol}
                                variant="ghost"
                                onClick={() => {
                                    onSelect(token)
                                    onClose()
                                }}
                                className={`w-full h-auto p-4 justify-start hover:bg-muted/50 ${selected === token.symbol ? "bg-muted/30 border border-primary/20 rounded-lg" : ""
                                    }`}
                            >
                                <div className="flex items-center w-full">
                                    {/* Token Icon */}
                                    <div className="relative">
                                        <img src={token.icon || "/placeholder.svg"} alt={token.symbol} className="w-10 h-10 rounded-full" />
                                        {/* {token.isFavorite && (
                                            <Star className="absolute -top-1 -right-1 h-3 w-3 text-yellow-500 fill-current" />
                                        )} */}
                                    </div>

                                    {/* Token Info */}
                                    <div className="flex-1 ml-3 text-left">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-card-foreground">{token.symbol}</span>
                                                    {/* {token.isPopular && (
                                                        <Badge
                                                            variant="secondary"
                                                            className="h-5 px-1.5 text-xs bg-primary/10 text-primary border-primary/20"
                                                        >
                                                            <TrendingUp className="h-3 w-3 mr-1" />
                                                            Popular
                                                        </Badge>
                                                    )} */}
                                                </div>
                                                <p className="text-sm text-muted-foreground truncate">{token.name}</p>
                                            </div>

                                            {/* Price & Balance */}
                                            <div className="text-right">
                                                <div className="flex items-center gap-1">
                                                    {getRate(token.symbol) !== null && (
                                                        <span className="text-xs text-muted-foreground">₦{getRate(token.symbol)!.toLocaleString("en-NG", { maximumFractionDigits: 2 })}</span>
                                                    )}
                                                    {/* {token.change24h !== undefined && (
                                                        <span className={`text-xs ${token.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                                                            {token.change24h >= 0 ? "+" : ""}
                                                            {token.change24h.toFixed(2)}%
                                                        </span>
                                                    )} */}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Button>
                        ))}

                        {filteredTokens.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-muted-foreground">No tokens found</p>
                                <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}
