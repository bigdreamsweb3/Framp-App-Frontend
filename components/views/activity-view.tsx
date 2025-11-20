"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  ExternalLink,
  Copy,
  ChevronDown,
  Receipt,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import {
  fetchAllUserActivities,
  type ActivityTransaction,
} from "@/lib/api/auth/user/activities";
import { useAuth } from "@/context/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner"; // Assuming you have a toast library for copy feedback
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export function ActivityView() {
  const { user, loading: authLoading } = useAuth();
  const [activities, setActivities] = useState<ActivityTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 10;
  const [displayCount, setDisplayCount] = useState(10);

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
      console.error("Error loading activities:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  useEffect(() => {
    setExpandedId(null); // Close expanded on filter change
    setDisplayCount(10); // Reset display count on filter change
  }, [typeFilter, searchTerm]);

  const onrampActivities = activities.filter((a) => a.type === "onramp");
  const offrampActivities = activities.filter((a) => a.type === "offramp");
  const billActivities = activities.filter((a) => a.type === "bills");

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      activity.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.currency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.tokenSymbol?.toLowerCase().includes(searchTerm.toLowerCase());
    // ||
    // activity.fromAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    // activity.toAddress?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === "all" || activity.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredActivities.length / ITEMS_PER_PAGE);
  const paginatedActivities = filteredActivities.slice(0, displayCount);

  const loadMore = () => {
    setDisplayCount(prev => prev + ITEMS_PER_PAGE);
  };

  const getTitle = () => {
    switch (typeFilter) {
      case "onramp": return "Onramp Activities";
      case "offramp": return "Offramp Activities";
      case "bill": return "Bills Activities";
      default: return "All Activities";
    }
  };

  const getEmptyStateText = () => {
    switch (typeFilter) {
      case "onramp":
        return "No onramp activities yet. Start buying crypto to see your purchases here!";
      case "offramp":
        return "No offramp activities yet. Sell some crypto to see your sales here!";
      case "bills":
        return "No bills yet. Pay your first bill to see it here!";
      default:
        return "No activities found. Get started by making your first transaction!";
    }
  };

  const toggleExpanded = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "onramp":
        return <ArrowUpCircle className="h-4 w-4 text-green-600" />;
      case "offramp":
        return <ArrowDownCircle className="h-4 w-4 text-blue-600" />;
      case "bills":
        return <Receipt className="h-4 w-4 text-purple-600" />;
      default:
        return <Activity className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getActivityBg = (type: string) => {
    switch (type) {
      case "onramp":
        return "bg-green-50 dark:bg-green-900/30";
      case "offramp":
        return "bg-blue-50 dark:bg-blue-900/30";
      case "bills":
        return "bg-purple-50 dark:bg-purple-900/30";
      default:
        return "bg-muted dark:bg-muted/40";
    }
  };


  const getActivityLabel = (type: string) => {
    switch (type) {
      case "onramp": return "Onramp";
      case "offramp": return "Offramp";
      case "bills": return "Bill";
      default: return type;
    }
  };

  if (authLoading || loading) {
    return (
      <Card className="w-full max-w-md mx-auto sm:max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-3 h-3" />
            Activity
          </CardTitle>
          {/* <Button
            variant="ghost"
            size="sm"
            onClick={loadActivities}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button> */}
        </CardHeader>
        <CardContent className="space-y-2 p-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto sm:max-w-2xl">
        <CardContent className="p-6 text-center">
          <Activity className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Log in to view activity.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5 w-full max-w-md mx-auto sm:max-w-2xl">

      <Card className="w-full max-w-md mx-auto sm:max-w-2xl">

        <div className="flex flex-row items-center justify-between px-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="w-3 h-3" />
            Activities
          </CardTitle>

          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              placeholder="Search activity..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-7 h-8 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
            />
          </div>


          {/* <Button
            variant="ghost"
            size="sm"
            onClick={loadActivities}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className="h-3 w-3" />
          </Button> */}

        </div>

        <Tabs value={typeFilter} onValueChange={setTypeFilter}>
          <TabsContent value={typeFilter} className="mt-0">
            <TabsList className="grid w-full grid-cols-4 border-b border-primary/15">
              <TabsTrigger value="all" className="data-[state=active]:rounded-t-lg">
                All
                {/* <Badge variant="secondary" className="text-xs">{activities.length}</Badge> */}
              </TabsTrigger>
              <TabsTrigger value="onramp" className="data-[state=active]:rounded-t-lg">
                Onramp
                {/* <Badge variant="secondary" className="text-xs">{onrampActivities.length}</Badge> */}
              </TabsTrigger>
              <TabsTrigger value="offramp" className="data-[state=active]:rounded-t-lg">
                Offramp
                {/* <Badge variant="secondary" className="text-xs">{offrampActivities.length}</Badge> */}
              </TabsTrigger>
              <TabsTrigger value="bills" className="data-[state=active]:rounded-t-lg">
                Bills
                {/* <Badge variant="secondary" className="text-xs">{billActivities.length}</Badge> */}
              </TabsTrigger>
            </TabsList>
          </TabsContent>
        </Tabs>


        <CardContent className="p-0">
          <div className="p-2 space-y-2">

            <div className="space-y-2 max-h-fit overflow-y-auto">
              {filteredActivities.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>{getEmptyStateText()}</p>
                </div>
              ) : (
                <>
                  {paginatedActivities.map((activity) => (
                    <div key={activity.id} className="space-y-1 rounded-md overflow-hidden bg-card">
                      <div
                        className={`flex items-center justify-between p-2 cursor-pointer hover:bg-muted transition-colors ${expandedId === activity.id ? 'bg-muted' : ''}`}
                        onClick={() => toggleExpanded(activity.id)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded flex items-center justify-center ${getActivityBg(activity.type)}`}>
                              {getActivityIcon(activity.type)}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1 mb-1">
                              <span className="text-xs font-medium truncate">
                                {getActivityLabel(activity.type)}
                                {activity.tokenSymbol && ` (${activity.tokenSymbol})`}
                              </span>
                              {getStatusIcon(activity.status)}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {new Date(activity.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center justify-end gap-3">
                          <div className="flex flex-col items-end flex-shrink-0 text-xs space-y-1">
                            <span className="font-medium">
                              {Number(activity.amount).toLocaleString("en-US", {
                                style: "currency",
                                currency: activity.currency,
                              })}
                            </span>
                            <Badge
                              variant="outline"
                              className={`text-xs capitalize ${getStatusColor(activity.status)}`}
                            >
                              {activity.status}
                              {/* {activity.confirmations ? ` (${activity.confirmations} conf.)` : ""} */}
                            </Badge>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => toggleExpanded(activity.id, e)}
                            className="h-6 w-6 p-0 text-xs text-muted-foreground hover:text-foreground"
                          >
                            <ChevronDown className={`h-3 w-3 transition-transform ${expandedId === activity.id ? 'rotate-180' : ''}`} />
                          </Button>
                        </div>
                      </div>
                      {expandedId === activity.id && (
                        <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 px-2 pb-2">
                          {activity.status && activity.status && (
                            <p className="flex items-center justify-between">
                              <span>Fee:</span>
                              <span>{Number(activity.status).toLocaleString("en-US", { style: "currency", currency: activity.currency })} ({activity.status})</span>
                            </p>
                          )}
                          {activity.paymentMethod && (
                            <p className="flex items-center justify-between">
                              <span>Method:</span>
                              <span>{activity.paymentMethod}</span>
                            </p>
                          )}
                          {activity.status && (
                            <p className="flex items-center justify-between">
                              <span>From:</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span
                                    className="font-mono truncate cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(activity.status!);
                                    }}
                                  >
                                    {truncateAddress(activity.status)}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>Click to copy</TooltipContent>
                              </Tooltip>
                            </p>
                          )}
                          {activity.status && (
                            <p className="flex items-center justify-between">
                              <span>To:</span>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <span
                                    className="font-mono truncate cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      copyToClipboard(activity.status!);
                                    }}
                                  >
                                    {truncateAddress(activity.status)}
                                  </span>
                                </TooltipTrigger>
                                <TooltipContent>Click to copy</TooltipContent>
                              </Tooltip>
                            </p>
                          )}
                          {activity.blockchainHash && (
                            <p className="flex items-center justify-between">
                              <span>TX ID:</span>
                              <Link
                                href={getExplorerUrl(activity.blockchainHash, 'solana')}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 font-mono truncate hover:underline"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="truncate">{truncateAddress(activity.blockchainHash)}</span>
                                <ExternalLink className="h-3 w-3" />
                              </Link>
                            </p>
                          )}
                          {activity.exchangeRate && (
                            <p className="flex items-center justify-between">
                              <span>Rate:</span>
                              <span>{activity.exchangeRate}</span>
                            </p>
                          )}
                          <div className="pt-2 border-t">
                            <Button
                              asChild
                              variant="link"
                              size="sm"
                              className="h-auto p-0 text-xs text-primary hover:text-primary/80"
                            >
                              <Link href={`/transactions/${activity.id}`}>
                                View transaction details →
                              </Link>
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                </>

              )}
            </div>
          </div>
        </CardContent>

        <div>
          {displayCount < filteredActivities.length && (
            <div className="px-2">
              <div className="flex flex-row items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">
                  Showing {displayCount} of {filteredActivities.length} activities
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMore}
                  className="rounded-xl"
                >
                  Load More

                  {/* ({Math.min(ITEMS_PER_PAGE, filteredActivities.length - displayCount)}) */}
                </Button>
              </div>
            </div>
          )}
        </div>

      </Card>
    </div>
  );
}

function getStatusIcon(status: string) {
  switch (status.toLowerCase()) {
    case "completed": return <CheckCircle className="h-3 w-3 text-green-600" />;
    case "failed": return <XCircle className="h-3 w-3 text-red-600" />;
    case "pending": return <Clock className="h-3 w-3 text-yellow-600" />;
    default: return <Clock className="h-3 w-3 text-muted-foreground" />;
  }
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "completed": return "text-green-600 border-green-600";
    case "failed": return "text-red-600 border-red-600";
    case "pending": return "text-yellow-600 border-yellow-600";
    default: return "text-muted-foreground border-muted-foreground";
  }
}

function truncateAddress(address: string, start = 6, end = 4): string {
  return `${address.slice(0, start)}...${address.slice(-end)}`;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).then(() => {
    toast.success("Copied to clipboard");
  });
}

function getExplorerUrl(txId: string, network: string): string {
  const explorers: Record<string, string> = {
    ethereum: `https://etherscan.io/tx/${txId}`,
    bitcoin: `https://blockchair.com/bitcoin/transaction/${txId}`,
    solana: `https://solscan.io/tx/${txId}`,
    // Add more as needed
  };
  return explorers[network.toLowerCase()] || `https://etherscan.io/tx/${txId}`;
}
