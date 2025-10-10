"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  History,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import {
  fetchAllUserActivities,
  type ActivityTransaction,
} from "@/lib/api/auth/user/activities";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ITEMS_PER_PAGE = 10;

export function ActivityView() {
  const { user, loading: authLoading } = useAuth()
  const [activities, setActivities] = useState<ActivityTransaction[]>([])
  const [selectedActivity, setSelectedActivity] = useState<ActivityTransaction | null>(null)
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const loadActivities = useCallback(async () => {
    if (!user) {
      setActivities([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await fetchAllUserActivities();
      setActivities(response);
    } catch (err) {
      setError("Failed to load activities");
      console.error("Error loading activities:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.currency.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      activity.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesType = typeFilter === "all" || activity.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedActivities = filteredActivities.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter]);

  const onrampActivities = filteredActivities.filter(
    (activity) => activity.type === "onramp"
  );
  const offrampActivities = filteredActivities.filter(
    (activity) => activity.type === "offramp"
  );

  const handleRefresh = async () => {
    await loadActivities();
  };

  // Show loading state
  if (authLoading || loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Activities</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="rounded-xl h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
              aria-label="Refresh activities"
            >
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="p-4 bg-muted/30 rounded-xl border border-border/50"
              >
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                  <div className="space-y-1">
                    <Skeleton className="h-5 w-[100px]" />
                    <Skeleton className="h-4 w-[60px]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show login prompt
  if (!user) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Activities</h2>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 text-center">
            <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              Please log in to view your activities
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              You need to be logged in to see your transaction history and
              activities.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full max-w-4xl mx-auto bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Activities</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="rounded-xl h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
              aria-label="Refresh activities"
            >
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">
              Error Loading Activities
            </h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
              {error}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="rounded-xl bg-transparent sm:h-9 sm:px-3"
              aria-label="Try again to load activities"
            >
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Try Again</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Activities</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="rounded-xl h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
              aria-label="Refresh activities"
            >
              <RefreshCw className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-4 space-y-4">
            <div className="flex flex-col gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 rounded-xl text-sm"
                  aria-label="Search transactions"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
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
                {/* <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-xl">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="onramp">Onramp</SelectItem>
                  <SelectItem value="offramp">Offramp</SelectItem>
                </SelectContent>
              </Select> */}
              </div>
            </div>

            {filteredActivities.length === 0 ? (
              <div className="p-4 text-center bg-muted/30 rounded-xl border border-border/50">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  No transactions found
                </h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  {activities.length === 0
                    ? "You haven't made any transactions yet."
                    : "No transactions match your current filters."}
                </p>
              </div>
            ) : (
              <>
                <div className="w-full">
                  <div className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm border-border/50 rounded-xl h-auto">
                    <div
                      className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs py-2"
                      aria-label="Show all transactions"
                    >
                      <span className="sm:inline">All </span>(
                      {filteredActivities.length})
                    </div>
                  </div>

                  <div className="space-y-4 mt-4">
                    {paginatedActivities.map((activity) => (
                      <TransactionCard
                        key={activity.id}
                        activity={activity}
                        onClick={setSelectedActivity}
                      />
                    ))}
                  </div>
                </div>

                {totalPages > 1 && (
                  <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <p className="text-xs text-muted-foreground">
                        Showing {startIndex + 1} to{" "}
                        {Math.min(endIndex, filteredActivities.length)} of{" "}
                        {filteredActivities.length} transactions
                      </p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="rounded-xl h-8 w-8 p-0"
                          aria-label="Previous page"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (currentPage <= 3) {
                                pageNum = i + 1;
                              } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = currentPage - 2 + i;
                              }
                              return (
                                <Button
                                  key={pageNum}
                                  variant={
                                    currentPage === pageNum
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() => setCurrentPage(pageNum)}
                                  className="rounded-xl h-8 w-8 p-0 text-xs"
                                  aria-label={`Go to page ${pageNum}`}
                                >
                                  {pageNum}
                                </Button>
                              );
                            }
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="rounded-xl h-8 w-8 p-0"
                          aria-label="Next page"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

          </div>
        </CardContent>
        {selectedActivity && (
          <TransactionDetails
            activity={selectedActivity}
            onClose={() => setSelectedActivity(null)}
          />
        )}
      </Card>

      {/* Security Notice */}
      {/* <div className="mt-4 p-4 bg-muted/20 rounded-xl border border-border/30">
        <h5 className="font-medium text-sm mb-2">Security Notice</h5>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Your transaction history is securely stored and encrypted. We
          prioritize your privacy and data protection.
        </p>
      </div> */}

    </>
  );
}

function TransactionCard({
  activity,
  onClick,
}: {
  activity: ActivityTransaction
  onClick: (activity: ActivityTransaction) => void
}) {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
      case "cancelled":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "pending":
      case "processing":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-50 text-green-700 border-green-200";
      case "failed":
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      case "pending":
      case "processing":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAmount = (amount: string, currency: string) => {
    const numAmount = Number.parseFloat(amount);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  return (
    <div
      className="p-4 bg-muted/30 rounded-xl border border-border/50 hover:bg-muted/50 transition-all cursor-pointer"
      onClick={() => onClick(activity)}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${activity.type === "onramp"
                ? "bg-green-50 hover:bg-green-100"
                : "bg-blue-50 hover:bg-blue-100"
                }`}
            >
              {activity.type === "onramp" ? (
                <ArrowUpCircle className="h-5 w-5 text-green-600" />
              ) : (
                <ArrowDownCircle className="h-5 w-5 text-blue-600" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-foreground truncate">
                {activity.type === "onramp" ? "Onramp" : "Offramp"}
                {activity.tokenSymbol && (
                  <span className="text-muted-foreground font-normal">
                    {" "}
                    ({activity.tokenSymbol})
                  </span>
                )}
              </h3>
              {getStatusIcon(activity.status)}
            </div>
            <p className="text-xs text-muted-foreground mb-1">
              {formatDate(activity.createdAt)}

            </p>
          </div>
        </div>
        <div className="flex flex-col items-end space-y-1 flex-shrink-0">
          <p className="text-sm font-bold text-foreground">
            {formatAmount(activity.amount, activity.currency)}
          </p>
          <Badge
            variant="outline"
            className={`text-xs font-medium ${getStatusColor(activity.status)}`}
          >
            {activity.status}
          </Badge>
        </div>
      </div>
    </div>
  );
}



import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"


function TransactionDetails({
  activity,
  onClose,
}: {
  activity: ActivityTransaction
  onClose: () => void
}) {
  if (!activity) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Example: compute hours difference (createdAt -> confirmedAt)
  const getProcessingTime = () => {
    if (!activity.completedAt) return "Pending"
    const created = new Date(activity.createdAt).getTime()
    const confirmed = new Date(activity.completedAt).getTime()
    const diffHours = (confirmed - created) / (1000 * 60 * 60)
    return `${diffHours.toFixed(2)} hours`
  }

  return (
    <Dialog open={!!activity} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg rounded-xl">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Transaction Details
          </DialogTitle>
          <DialogDescription>
            Full breakdown of this transaction
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2">
            <span className="font-medium">Receipt ID</span>
            <span className="text-gray-500 text-xs">
              #{activity.id?.slice(0, 8) || "XXXXXX"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="font-medium">Type:</span>
            <span>{activity.type === "onramp" ? "Onramp" : "Offramp"}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Amount:</span>
            <span>
              {activity.amount} {activity.currency}
            </span>
          </div>
          {activity.tokenSymbol && (
            <div className="flex justify-between">
              <span className="font-medium">Token:</span>
              <span>{activity.tokenAmount} {activity.tokenSymbol}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="font-medium">Wallet Address:</span>
            <span className="truncate max-w-[200px]">
              {activity.walletAddress || "N/A"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Created At:</span>
            <span>{formatDate(activity.createdAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Confirmed At:</span>
            <span>
              {activity.completedAt ? formatDate(activity.completedAt) : "Pending"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Processing Time:</span>
            <span>{getProcessingTime()}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Status:</span>
            <span className="capitalize">{activity.status}</span>
          </div>


        </div>

        <DialogFooter>
          <Button onClick={onClose} className="rounded-xl">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

