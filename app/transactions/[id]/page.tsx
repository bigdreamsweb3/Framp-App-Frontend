// app/transactions/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  CheckCheck,
  Activity,
  ArrowUpCircle,
  Clock,
  Building2,
  Download
} from "lucide-react";
import { fetchAllUserActivities, ActivityTransaction } from "@/lib/api/auth/user/activities";

export default function TransactionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [activity, setActivity] = useState<ActivityTransaction | null>(null);
  const [loading, setLoading] = useState(true);

  const transactionId = params.id as string;

  // Determine if we're on devnet or mainnet
  const isDevnet = process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'devnet';
  const solanaNetwork = isDevnet ? 'devnet' : 'mainnet';

  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    async function loadTransaction() {
      try {
        setLoading(true);
        // Fetch all activities and find the specific one
        const activities = await fetchAllUserActivities();
        const foundActivity = activities.find(a => a.id === transactionId);
        
        if (foundActivity) {
          setActivity(foundActivity);
        } else {
          toast.error("Transaction not found");
          router.push("/activities");
        }
      } catch (error) {
        console.error("Error loading transaction:", error);
        toast.error("Failed to load transaction details");
        router.push("/activities");
      } finally {
        setLoading(false);
      }
    }

    if (transactionId) {
      loadTransaction();
    }
  }, [transactionId, router]);

  // Generate Solscan URL based on network and transaction hash
  const getSolscanUrl = (txHash: string) => {
    const baseUrl = 'https://solscan.io/tx';
    
    if (isDevnet) {
      return `${baseUrl}/${txHash}?cluster=devnet`;
    }
    
    return `${baseUrl}/${txHash}`;
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied to clipboard`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  };

  const getProcessingTime = () => {
    if (!activity?.completedAt) return "Pending"
    const created = new Date(activity.createdAt).getTime()
    const confirmed = new Date(activity.completedAt).getTime()
    const diffMinutes = Math.round((confirmed - created) / (1000 * 60))
    if (diffMinutes < 60) return `${diffMinutes} minutes`
    const diffHours = (diffMinutes / 60).toFixed(1)
    return `${diffHours} hours`
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-48 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="h-64 bg-muted rounded-lg"></div>
                <div className="h-48 bg-muted rounded-lg"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-muted rounded-lg"></div>
                <div className="h-32 bg-muted rounded-lg"></div>
                <div className="h-32 bg-muted rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Transaction Not Found</h1>
          <Button onClick={() => router.push("/activities")}>
            Back to Activities
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex flex-col items-start gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/activities")}
              className="rounded-xl"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Transactions
            </Button>
            <div className="flex flex-wrap items-center justify-between">
              <h1 className="text-2xl font-bold text-foreground">
                Transaction Receipt
              </h1>
              <p className="text-sm text-muted-foreground">
                Complete details of your {activity.type} transaction
                {/* {isDevnet && (
                  <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    DEVNET
                  </span>
                )} */}
              </p>
            </div>
          </div>
          
          {/* <div className="flex gap-2">
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="rounded-xl"
            >
              <Download className="h-4 w-4 mr-2" />
              Print
            </Button>
          </div> */}
        </div>

        {/* Receipt-style header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 border border-primary/20 mb-6">
          <div className="flex justify-between items-start">
            <div>
              {/* <h2 className="font-semibold text-xl">
                {activity.type === "onramp" ? "CRYPTO PURCHASE" : "CRYPTO SALE"}
              </h2> */}
              <p className="text-sm text-muted-foreground">
                {formatDate(activity.createdAt)}
                {/* {isDevnet && (
                  <span className="ml-2 text-yellow-600 font-medium">• Devnet Mode</span>
                )} */}
              </p>
            </div>
            <Badge
              variant={activity.status === 'completed' ? 'default' : 'secondary'}
              className="text-sm"
            >
              {activity.status.toUpperCase()}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Transaction Details */}
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-lg p-6 border">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <CheckCheck className="h-5 w-5" />
                Transaction Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">
                      #{activity.id?.slice(0, 12)}...
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(activity.id, 'txid')}
                    >
                      {copiedField === 'txid' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="font-medium capitalize">{activity.type}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fiat Amount:</span>
                  <span className="font-medium">
                    {activity.amount} {activity.currency}
                  </span>
                </div>

                {activity.tokenAmount && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Crypto Amount:</span>
                    <span className="font-medium">
                      {activity.tokenAmount} {activity.tokenSymbol}
                    </span>
                  </div>
                )}

                {activity.exchangeRate && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Exchange Rate:</span>
                    <span className="font-medium">
                      1 {activity.tokenSymbol} = {activity.exchangeRate} {activity.currency}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Blockchain Info */}
            {(activity.blockchainHash) && (
              <div className="bg-muted/30 rounded-lg p-6 border">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Blockchain Information
                  <Badge variant="outline" className="text-xs">
                    {solanaNetwork.toUpperCase()}
                  </Badge>
                </h3>
                <div className="space-y-3 text-sm">
                  {activity.blockchainHash && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Transaction Hash:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm truncate max-w-[140px]">
                          {activity.blockchainHash.slice(0, 12)}...
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(activity.blockchainHash!, 'hash')}
                        >
                          {copiedField === 'hash' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {activity.blockchainHash && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => openInNewTab(getSolscanUrl(activity.blockchainHash!))}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View on Solscan
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Additional Details */}
          <div className="space-y-4">
            {/* Wallet Information */}
            <div className="bg-muted/30 rounded-lg p-6 border">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5" />
                Wallet Information
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Wallet Address:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm truncate max-w-[120px]">
                      {activity.walletAddress?.slice(0, 8)}...{activity.walletAddress?.slice(-6)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => copyToClipboard(activity.walletAddress || '', 'wallet')}
                    >
                      {copiedField === 'wallet' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-muted/30 rounded-lg p-6 border">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Transaction Timeline
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Created:</span>
                  <span>{formatDate(activity.createdAt)}</span>
                </div>

                {activity.completedAt && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Completed:</span>
                    <span>{formatDate(activity.completedAt)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processing Time:</span>
                  <span className="font-medium">{getProcessingTime()}</span>
                </div>
              </div>
            </div>

            {/* Payment/Checkout Links */}
            {(activity.checkoutUrl) && (
              <div className="bg-muted/30 rounded-lg p-6 border">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <ExternalLink className="h-5 w-5" />
                  Payment Link
                </h3>
                <div className="space-y-2">
                  {activity.checkoutUrl && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => openInNewTab(activity.checkoutUrl!)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Checkout Page
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Bank Details for Off-Ramp */}
            {activity.type === "offramp" && activity.bankName && (
              <div className="bg-muted/30 rounded-lg p-6 border">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Bank Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bank:</span>
                    <span className="font-medium">{activity.bankName}</span>
                  </div>
                  {activity.bankAccountNumber && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Account:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          ****{activity.bankAccountNumber.slice(-4)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(activity.bankAccountNumber!, 'account')}
                        >
                          {copiedField === 'account' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  {activity.fiatDisbursementStatus && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Payout Status:</span>
                      <span className="font-medium capitalize">{activity.fiatDisbursementStatus}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}