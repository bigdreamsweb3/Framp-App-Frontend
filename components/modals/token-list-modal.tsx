"use client"

import { useState, useMemo, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X, ChevronDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "sonner"
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
    const [expandedId, setExpandedId] = useState<string | null>(null)

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

    const ITEMS_PER_PAGE = 10
    const [displayCount, setDisplayCount] = useState(10)

    const loadMore = () => {
        setDisplayCount(prev => prev + ITEMS_PER_PAGE)
    }

    const paginatedTokens = filteredTokens.slice(0, displayCount)

    const toggleExpanded = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation()
        setExpandedId(expandedId === id ? null : id)
    }

    const getTokenIcon = (token: Token) => (
        <img src={token.icon || "/placeholder.svg"} alt={token.symbol} className="w-4 h-4 rounded-full flex-shrink-0" />
    )

    const getTokenBg = () => "bg-blue-50 dark:bg-blue-900/30"

    const getTokenLabel = (token: Token) => token.isPopular ? "Popular" : "Token"

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-2">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-md mx-auto">
                <Card className="w-full max-w-md mx-auto sm:max-w-2xl border-0 shadow-xl animate-in fade-in-0 zoom-in-95 duration-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            Select Token
                        </CardTitle>
                        <Button variant="ghost" size="sm" onClick={onClose} className="h-6 w-6 p-0">
                            <X className="h-3 w-3" />
                        </Button>
                    </CardHeader>

                    {/* Search */}
                    <div className="px-2">
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                            <Input
                                placeholder="Search tokens..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-7 h-8 text-xs bg-muted/50 border-border focus:bg-background focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                            />
                        </div>
                    </div>

                    <CardContent className="p-0">
                        <div className="p-2 space-y-2">
                            {/* Popular Tokens Section (only show when no search) */}
                            {!searchQuery && popularTokens.length > 0 && (
                                <div className="space-y-1">
                                    <div className="flex items-center gap-1 px-1">
                                        <span className="text-xs font-medium text-muted-foreground">Popular</span>
                                    </div>
                                    <ScrollArea className="w-full whitespace-nowrap">
                                        <div className="flex gap-2 px-1 pb-2">
                                            {popularTokens.map((token) => (
                                                <Button
                                                    key={token.symbol}
                                                    variant="outline_soft_gradient"
                                                    size="sm"
                                                    onClick={() => {
                                                        onSelect(token)
                                                        onClose()
                                                    }}
                                                    className="h-8 max-w-fit px-3 inline-flex items-center flex-1 sm:flex-none rounded-md text-xs"
                                                >
                                                    {getTokenIcon(token)}
                                                    <span className="truncate">{token.symbol}</span>
                                                </Button>
                                            ))}
                                        </div>
                                    </ScrollArea>
                                </div>
                            )}

                            {/* Token List */}
                            <div className="space-y-2 max-h-72 overflow-y-auto">
                                {paginatedTokens.map((token) => (
                                    <div key={token.symbol} className="space-y-1 rounded-md overflow-hidden bg-card">
                                        <div
                                            className={`flex items-center justify-between p-2 cursor-pointer hover:bg-muted transition-colors ${selected === token.symbol ? "bg-primary/5" : ""}`}
                                            onClick={() => {
                                                onSelect(token)
                                                onClose()
                                            }}
                                        >
                                            <div className="flex items-center gap-3 flex-1">
                                                {/* Token Icon */}
                                                <img src={token.icon || "/placeholder.svg"} alt={token.symbol} className="w-8 h-8 rounded-full flex-shrink-0" />

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <span className="text-xs font-medium truncate">
                                                            {` ${token.symbol}`}
                                                        </span>
                                                        {token.isPopular && <Badge variant="secondary" className="text-xs">Popular</Badge>}
                                                        {token.isFavorite && <Badge variant="secondary" className="text-xs">Favorite</Badge>}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground truncate">
                                                        {token.name}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-end gap-3">
                                                <div className="flex flex-col items-end flex-shrink-0 text-xs space-y-1">
                                                    {getRate(token.symbol) !== null && !ratesLoading && (
                                                        <span className="font-medium">
                                                            ₦{getRate(token.symbol)!.toLocaleString("en-NG", { maximumFractionDigits: 0 })}
                                                        </span>
                                                    )}
                                                    {token.balance && (
                                                        <span className="text-muted-foreground">{token.balance} {token.symbol}</span>
                                                    )}
                                                </div>

                                                {/* <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => toggleExpanded(token.symbol, e)}
                                                    className="h-6 w-6 p-0 text-xs text-muted-foreground hover:text-foreground"
                                                >
                                                    <ChevronDown className={`h-3 w-3 transition-transform ${expandedId === token.symbol ? 'rotate-180' : ''}`} />
                                                </Button> */}
                                            </div>
                                        </div>
                                        {/* {expandedId === token.symbol && (
                                            <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 px-2 pb-2">
                                                {token.address && (
                                                    <p className="flex items-center justify-between">
                                                        <span>Address:</span>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <span
                                                                    className="font-mono truncate cursor-pointer"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        navigator.clipboard.writeText(token.address!)
                                                                        toast.success("Copied to clipboard")
                                                                    }}
                                                                >
                                                                    {token.address.slice(0, 6)}...{token.address.slice(-4)}
                                                                </span>
                                                            </TooltipTrigger>
                                                            <TooltipContent>Click to copy</TooltipContent>
                                                        </Tooltip>
                                                    </p>
                                                )}
                                                {token.price && (
                                                    <p className="flex items-center justify-between">
                                                        <span>Price:</span>
                                                        <span>${token.price}</span>
                                                    </p>
                                                )}
                                                {token.change24h && (
                                                    <p className="flex items-center justify-between">
                                                        <span>24h Change:</span>
                                                        <Badge variant={token.change24h >= 0 ? "default" : "destructive"} className="text-xs">
                                                            {token.change24h >= 0 ? "+" : ""}{token.change24h}%
                                                        </Badge>
                                                    </p>
                                                )}
                                                <div className="pt-2 border-t">
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            onSelect(token)
                                                            onClose()
                                                        }}
                                                    >
                                                        Select Token →
                                                    </Button>
                                                </div>
                                            </div>
                                        )} */}
                                    </div>
                                ))}

                                {filteredTokens.length === 0 && (
                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>No tokens found</p>
                                    </div>
                                )}
                            </div>

                            {displayCount < filteredTokens.length && (
                                <div className="px-2">
                                    <div className="flex flex-row items-center justify-between gap-2 pb-2">
                                        <p className="text-xs text-muted-foreground">
                                            Showing {displayCount} of {filteredTokens.length} tokens
                                        </p>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={loadMore}
                                            className="rounded-md h-8 text-xs"
                                        >
                                            Load More
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}