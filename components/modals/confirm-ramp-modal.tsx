"use client";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { formatCurrency } from "@/lib/utils/formatter";

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
  selectedTransferMethod?: string | null | undefined; // For offramp
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
                label={`Amount (${fiatCurrency})`}
                value={formatCurrency(fiatAmount, fiatCurrency)}
              />
              <InfoRow
                label={`Estimated ${tokenSymbol} to Receive`}
                value={`${receiveAmount.toFixed(4)} ${tokenSymbol}`}
              />
              <InfoRow label="Payment Method" value={paymentOrTransfer} />
            </>
          ) : (
            <>
              {/* Offramp: User sends crypto, receives fiat */}
              <InfoRow
                label={`Amount to Send (${tokenSymbol})`}
                value={`${tokenAmount} ${tokenSymbol}`}
              />
              <InfoRow
                label={`Estimated to Receive (${fiatCurrency})`}
                value={formatCurrency(receiveAmount.toString(), fiatCurrency)}
              />
              <InfoRow label="Transfer Method" value={paymentOrTransfer} />
            </>
          )}

          {selectedWallet && (
            <div className="py-2 border-b border-border">
              <div className="flex justify-between items-start">
                <span className="font-medium text-muted-foreground">
                  {rampMode === "onramp" ? "Send to:" : "Receive to:"}
                </span>
                <div className="text-right">
                  <div className="font-semibold">{selectedWallet.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedWallet.details}</div>
                  {selectedWallet.walletAddress && (
                    <div className="text-xs text-muted-foreground font-mono mt-1">
                      {selectedWallet.walletAddress.slice(0, 8)}...
                      {selectedWallet.walletAddress.slice(-8)}
                    </div>
                  )}
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

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border">
      <span className="font-medium text-muted-foreground">{label}:</span>
      <span className="font-semibold">{value}</span>
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
    connect_wallet: "Connect Crypto Wallet", // for signing via Phantom or browser wallet
    manual_transfer: "Manual Crypto Transfer", // for users who copy and send manually
  };
  return transferMap[methodId] || methodId;
}

