// File: components/ui/exchange-rate-error.tsx

import { AlertCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import { Button } from "./button";
import { Alert, AlertDescription } from "./alert";

interface ExchangeRateErrorProps {
  error: string;
  onRetry: () => void;
  loading: boolean;
  className?: string;
}

export function ExchangeRateError({
  error,
  onRetry,
  loading,
  className,
}: ExchangeRateErrorProps) {
  const isNetworkError = error.toLowerCase().includes('network') || 
                        error.toLowerCase().includes('fetch') ||
                        error.toLowerCase().includes('connection');

  return (
    <Alert className={className}>
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isNetworkError ? (
            <WifiOff className="h-3 w-3 text-orange-500" />
          ) : (
            <Wifi className="h-3 w-3 text-orange-500" />
          )}
          <span className="text-sm">
            {isNetworkError 
              ? "Network error - using cached rate" 
              : "Rate update failed - using cached rate"
            }
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRetry}
          disabled={loading}
          className="h-6 px-2 text-xs"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  );
}
