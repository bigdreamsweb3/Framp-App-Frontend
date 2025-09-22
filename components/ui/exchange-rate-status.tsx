// File: components/ui/exchange-rate-status.tsx

import { RefreshCw, AlertCircle, CheckCircle, Clock } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ExchangeRateStatusProps {
  loading: boolean;
  error: string | null;
  lastUpdated?: number;
  onRefresh: () => void;
  className?: string;
}

export function ExchangeRateStatus({
  loading,
  error,
  lastUpdated,
  onRefresh,
  className,
}: ExchangeRateStatusProps) {
  const getStatusIcon = () => {
    if (loading) {
      return <RefreshCw className="w-3 h-3 animate-spin text-blue-500" />;
    }
    if (error) {
      return <AlertCircle className="w-3 h-3 text-orange-500" />;
    }
    return <CheckCircle className="w-3 h-3 text-green-500" />;
  };

  const getStatusText = () => {
    if (loading) return "Updating...";
    if (error) return "Rate error";
    if (lastUpdated) {
      const now = Date.now();
      const diff = now - lastUpdated;
      const minutes = Math.floor(diff / (1000 * 60));
      
      if (minutes < 1) return "Just updated";
      if (minutes < 60) return `${minutes}m ago`;
      const hours = Math.floor(minutes / 60);
      return `${hours}h ago`;
    }
    return "Live rate";
  };

  const getStatusColor = () => {
    if (loading) return "text-blue-500";
    if (error) return "text-orange-500";
    return "text-green-500";
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {getStatusIcon()}
      <span className={cn("text-xs", getStatusColor())}>
        {getStatusText()}
      </span>
      <Button
        variant="ghost"
        size="sm"
        className="h-4 w-4 p-0 ml-1"
        onClick={onRefresh}
        disabled={loading}
        title="Refresh exchange rate"
      >
        <RefreshCw className={cn("w-2.5 h-2.5", loading && "animate-spin")} />
      </Button>
    </div>
  );
}
