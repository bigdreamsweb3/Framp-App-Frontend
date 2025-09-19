"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { useEffect, useState, useCallback } from "react"
import { fetchAllUserActivities, type ActivityTransaction } from "@/lib/api/auth/user/activities"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const ITEMS_PER_PAGE = 10

export function ActivityView() {
  const [activities, setActivities] = useState<ActivityTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetchAllUserActivities()
      setActivities(response)
    } catch (err) {
      setError("Failed to load activities")
      console.error("Error loading activities:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadActivities()
  }, [loadActivities])

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.currency.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || activity.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesType = typeFilter === "all" || activity.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex)

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, typeFilter])

  const onrampActivities = filteredActivities.filter((activity) => activity.type === "onramp")
  const offrampActivities = filteredActivities.filter((activity) => activity.type === "offramp")

  const handleRefresh = async () => {
    await loadActivities()
  }

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6 lg:pt-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Transaction History</h1>
          </div>
        </div>


        <div className="space-y-3 sm:space-y-4 lg:space-y-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="border-border bg-card">
              <CardContent className="p-3 sm:p-4 lg:p-6">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <Skeleton className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-xl sm:rounded-2xl" />
                  <div className="space-y-2 sm:space-y-3 flex-1">
                    <Skeleton className="h-4 sm:h-5 w-[200px] sm:w-[250px]" />
                    <Skeleton className="h-3 sm:h-4 w-[150px] sm:w-[180px]" />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <Skeleton className="h-5 sm:h-6 w-[100px] sm:w-[120px]" />
                    <Skeleton className="h-4 sm:h-5 w-[60px] sm:w-[80px]" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 lg:p-6 lg:pt-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Transaction History</h1>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>


        <Card className="border-destructive/20 bg-destructive/5">
          <CardContent className="p-6 sm:p-8 lg:p-12 text-center">
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-destructive/10 w-fit mx-auto mb-4 sm:mb-6">
              <XCircle className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-destructive" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-foreground">Error Loading Activities</h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto">{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm" className="sm:size-default bg-transparent">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 p-3 sm:p-4 lg:p-6 lg:pt-0">
      <div className="flex flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Activity className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Transaction History</h1>
        </div>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="py-3">
          <div className="flex flex-col gap-3 sm:gap-4 w-full justify-end">
            {/* <div className="relative">
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 sm:pl-12 text-sm sm:text-base"
              />
            </div> */}
            <div className="flex flex-row gap-3 sm:gap-4 w-full justify-end">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px] lg:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px] lg:w-[200px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="onramp">Onramp</SelectItem>
                  <SelectItem value="offramp">Offramp</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
      </div>

      {filteredActivities.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="p-8 sm:p-10 lg:p-12 text-center">
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-muted/50 w-fit mx-auto mb-4 sm:mb-6">
              <Activity className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-muted-foreground" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-foreground">No transactions found</h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
              {activities.length === 0
                ? "You haven't made any transactions yet."
                : "No transactions match your current filters."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-muted border border-border h-auto">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm py-2 sm:py-2.5"
              >
                <span className="hidden sm:inline">All </span>({filteredActivities.length})
              </TabsTrigger>
              <TabsTrigger
                value="onramp"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm py-2 sm:py-2.5"
              >
                <span className="hidden sm:inline">Onramp </span>({onrampActivities.length})
              </TabsTrigger>
              <TabsTrigger
                value="offramp"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm py-2 sm:py-2.5"
              >
                <span className="hidden sm:inline">Offramp </span>({offrampActivities.length})
              </TabsTrigger>
            </TabsList>

            {/* All */}
            <TabsContent value="all" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6 grid w-full xl:grid-cols-2 gap-3 sm:gap-4">
              {paginatedActivities.map((activity) => (
                <TransactionCard key={activity.id} activity={activity} />
              ))}
            </TabsContent>

            {/* Onramp */}
            <TabsContent value="onramp" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6 grid w-full xl:grid-cols-2 gap-3 sm:gap-4">
              {onrampActivities.slice(startIndex, endIndex).map((activity) => (
                <TransactionCard key={activity.id} activity={activity} />
              ))}
            </TabsContent>

            {/* Offramp */}
            <TabsContent value="offramp" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6 grid w-full xl:grid-cols-2 gap-3 sm:gap-4">
              {offrampActivities.slice(startIndex, endIndex).map((activity) => (
                <TransactionCard key={activity.id} activity={activity} />
              ))}
            </TabsContent>
          </Tabs>

          {totalPages > 1 && (
            <Card className="border-border bg-card">
              <CardContent className="">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, filteredActivities.length)} of{" "}
                    {filteredActivities.length} transactions
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-1 sm:gap-2">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum
                        if (totalPages <= 5) {
                          pageNum = i + 1
                        } else if (currentPage <= 3) {
                          pageNum = i + 1
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i
                        } else {
                          pageNum = currentPage - 2 + i
                        }

                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setCurrentPage(pageNum)}
                            className="h-8 w-8 p-0 sm:h-9 sm:w-9 text-xs sm:text-sm"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="h-8 w-8 p-0 sm:h-9 sm:w-9"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  )
}

function TransactionCard({ activity }: { activity: ActivityTransaction }) {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
      case "failed":
      case "cancelled":
        return <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
      case "pending":
      case "processing":
        return <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-600" />
      default:
        return <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-50 text-green-700 border-green-200"
      case "failed":
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200"
      case "pending":
      case "processing":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatAmount = (amount: string, currency: string) => {
    const numAmount = Number.parseFloat(amount)
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(numAmount)
  }

  return (
    <Card className="border-border bg-card hover:bg-card/80 hover:shadow-sm transition-all duration-200 py-0">
      <CardContent className="p-3 sm:p-4 lg:p-6">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
            <div className="flex-shrink-0">
              <div
                className={`h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-xl sm:rounded-2xl flex items-center justify-center transition-colors ${activity.type === "onramp" ? "bg-green-50 hover:bg-green-100" : "bg-blue-50 hover:bg-blue-100"
                  }`}
              >
                {activity.type === "onramp" ? (
                  <ArrowDownLeft className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-green-600" />
                ) : (
                  <ArrowUpRight className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-blue-600" />
                )}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-foreground truncate">
                  {activity.type === "onramp" ? "Onramp" : "Offramp"}
                  {activity.tokenSymbol && (
                    <span className="text-muted-foreground font-normal"> ({activity.tokenSymbol})</span>
                  )}
                </h3>
                {getStatusIcon(activity.status)}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">
                {formatDate(activity.createdAt)}
                {activity.paymentMethod && <span className="text-primary"> • {activity.paymentMethod}</span>}
              </p>
              {activity.walletAddress && (
                <p className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded-md w-fit">
                  {activity.walletAddress.slice(0, 6)}...{activity.walletAddress.slice(-4)}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2 sm:space-y-3 flex-shrink-0">
            <p className="text-sm sm:text-base lg:text-xl font-bold text-foreground">
              {formatAmount(activity.amount, activity.currency)}
            </p>
            <Badge variant="outline" className={`text-xs font-medium ${getStatusColor(activity.status)}`}>
              {activity.status}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
