"use client";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { formatCurrency } from "@/lib/utils/formatter";
import { useFees } from "@/lib/hooks/useFees";

interface ConfirmRampModalProps {
  isOpen: boolean;
  onClose: () => void;
  rampMode: "onramp" | "offramp";
  fiatAmount: string;
  fiatCurrency: string;
  tokenAmount: string;
  tokenSymbol: string;
  receiveAmount: number;
  exchangeRate: number;
  selectedWallet?: {
    id: string;
    type: "bank" | "wallet";
    name: string;
    details: string;
    accountName: string;
    isDefault: boolean;
    walletAddress?: string;
    bankCode?: string;
    accountNumber?: string;
  } | null;
  selectedPaymentMethod?: string | null | undefined;
  selectedTransferMethod?: string | null | undefined;
  isWalletConnected?: boolean;
  user?: any;
  onConfirm: () => Promise<void> | void;
  loading?: boolean;
}

export function ConfirmRampModal({
  isOpen,
  onClose,
  rampMode,
  fiatAmount,
  fiatCurrency,
  tokenAmount,
  tokenSymbol,
  receiveAmount,
  exchangeRate,
  selectedWallet,
  selectedPaymentMethod,
  selectedTransferMethod,
  isWalletConnected,
  onConfirm,
  loading = false,
}: ConfirmRampModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  // Calculate fees based on the transaction
  // For onramp: fee based on fiat amount (NGN)
  // For offramp: fee based on crypto amount (token amount)
  const amount = rampMode === 'onramp' 
    ? Number(fiatAmount)   // Buying: fee based on NGN amount
    : Number(tokenAmount); // Selling: fee based on crypto amount
  
  const fees = useFees(amount, rampMode, receiveAmount);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && !isProcessing && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isProcessing, onClose]);

  if (!isOpen) return null;

  async function handleConfirm() {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await onConfirm();
    } catch (err) {
      console.error("Confirmation failed:", err);
    } finally {
      setIsProcessing(false);
    }
  }

  const paymentOrTransfer =
    rampMode === "onramp"
      ? getPaymentMethodDisplayName(selectedPaymentMethod || "")
      : getTransferMethodDisplayName(selectedTransferMethod || "");

  return (
    <div
      className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm flex items-center justify-center"
      onClick={!isProcessing ? onClose : undefined}
    >
      <div
        className="relative w-[90%] max-w-md bg-card border border-border rounded-lg p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <Button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-3 right-3 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-full w-8 h-8 flex items-center justify-center transition-colors"
        >
          ✕
        </Button>

        <h2 className="text-xl font-semibold mb-6 text-foreground">
          {rampMode === "onramp" ? "Confirm Your Purchase" : "Confirm Your Sell Order"}
        </h2>

        <div className="space-y-4 text-foreground">
          {rampMode === "onramp" ? (
            <>
              {/* Onramp: User sends fiat, receives crypto */}
              <InfoRow
                label={`You Pay`}
                value={formatCurrency(fiatAmount, fiatCurrency)}
                highlight
              />

              {/* Fee Breakdown */}
              <div className="bg-muted/30 rounded-lg p-3 space-y-2 border border-border">
                <div className="text-sm font-medium text-muted-foreground mb-2">Fee Breakdown</div>

                {/* Platform Fee */}
                <InfoRow
                  label="Platform fee"
                  value={`${fees.breakdown.platform.percentage} (${formatCurrency(fees.breakdown.platform.amount.toString(), fiatCurrency)})`}
                  className="text-sm"
                />

                {/* Processing Fee */}
                <InfoRow
                  label="Processing fee"
                  value={`${fees.breakdown.processing.percentage} (${formatCurrency(fees.breakdown.processing.amount.toString(), fiatCurrency)})`}
                  className="text-sm"
                  subValue="Charged by payment processor"
                />

                <div className="border-t border-border pt-2">
                  <InfoRow
                    label="Total fees"
                    value={formatCurrency(fees.totalFee.toString(), fiatCurrency)}
                    className="font-medium"
                  />
                </div>
              </div>

              <InfoRow
                label={`You Receive`}
                value={`${receiveAmount.toFixed(4)} ${tokenSymbol}`}
                highlight
              />
              <InfoRow label="Payment Method" value={paymentOrTransfer} />
            </>
          ) : (
            <>
              {/* Offramp: User sends crypto, receives fiat */}
              <InfoRow
                label={`You Send`}
                value={`${tokenAmount} ${tokenSymbol}`}
                highlight
              />

              {/* Fee Breakdown - Show percentage based on crypto amount but display in fiat */}
              <div className="bg-muted/30 rounded-lg p-3 space-y-2 border border-border">
                <div className="text-sm font-medium text-muted-foreground mb-2">Fee Breakdown</div>
                
                {/* Show that fees are calculated on the crypto amount */}
                <div className="text-xs text-muted-foreground mb-2 italic">
                  Fees calculated on {tokenAmount} {tokenSymbol} ({formatCurrency(receiveAmount.toString(), fiatCurrency)})
                </div>

                {/* Platform Fee */}
                <InfoRow
                  label="Platform fee"
                  value={`${fees.breakdown.platform.percentage} (${formatCurrency(fees.breakdown.platform.amount.toString(), fiatCurrency)})`}
                  className="text-sm"
                />

                {/* Processing Fee */}
                <InfoRow
                  label="Processing fee"
                  value={`${fees.breakdown.processing.percentage} (${formatCurrency(fees.breakdown.processing.amount.toString(), fiatCurrency)})`}
                  className="text-sm"
                  subValue="Bank transfer fee"
                />

                <div className="border-t border-border pt-2">
                  <InfoRow
                    label="Total fees"
                    value={formatCurrency(fees.totalFee.toString(), fiatCurrency)}
                    className="font-medium"
                  />
                </div>
              </div>

              <InfoRow
                label={`You'll Receive`}
                value={formatCurrency(fees.netAmount.toString(), fiatCurrency)}
                highlight
                subValue={`Before fees: ${formatCurrency(receiveAmount.toString(), fiatCurrency)}`}
              />
              <InfoRow label="Transfer Method" value={paymentOrTransfer} />
            </>
          )}

          {/* Exchange Rate - Uncomment if you want to show it */}
          <div className="bg-primary/5 rounded-lg p-3 text-center border border-primary/10">
            <div className="text-sm text-muted-foreground">Exchange Rate</div>
            <div className="font-medium">
              1 {tokenSymbol} = {formatCurrency(exchangeRate.toString(), fiatCurrency)}
            </div>
          </div>

          {selectedWallet && (
            <div className="py-2 border-b border-border">
              <div className="flex justify-between items-start">
                <span className="font-medium text-muted-foreground">
                  {rampMode === "onramp" ? "Send to:" : "Receive to:"}
                </span>
                <div className="text-right">
                  <div className="font-semibold">{selectedWallet.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedWallet.details}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-3">
          <Button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg py-3 font-medium transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-3 font-medium transition-colors disabled:opacity-70"
          >
            {isProcessing ? "Processing..." : "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  subValue,
  highlight = false,
  className = ""
}: {
  label: string;
  value: string;
  subValue?: string;
  highlight?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex justify-between items-center py-2 border-b border-border ${className}`}>
      <span className={`font-medium ${highlight ? "text-foreground" : "text-muted-foreground"}`}>
        {label}:
      </span>
      <div className="text-right">
        <div className={`font-semibold ${highlight ? "text-primary" : ""}`}>
          {value}
        </div>
        {subValue && (
          <div className="text-xs text-muted-foreground mt-0.5">
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
}

function getPaymentMethodDisplayName(methodId: string): string {
  const methodMap: Record<string, string> = {
    CARD: "Credit/Debit Card",
    ACCOUNT_TRANSFER: "Bank Transfer",
    USSD: "USSD",
    PHONE_NUMBER: "Phone Number",
  };
  return methodMap[methodId] || methodId;
}

function getTransferMethodDisplayName(methodId: string): string {
  const transferMap: Record<string, string> = {
    connect_wallet: "Connect Crypto Wallet",
    manual_transfer: "Manual Crypto Transfer",
  };
  return transferMap[methodId] || methodId;
}