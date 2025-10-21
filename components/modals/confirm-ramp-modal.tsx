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
  const amount = rampMode === 'onramp'
    ? Number(fiatAmount)   // Buying: fee based on NGN amount
    : Number(tokenAmount); // Selling: fee based on crypto amount

  // Pass exchangeRate to useFees hook
  const fees = useFees(amount, rampMode, receiveAmount, exchangeRate);

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
          {rampMode === "onramp" ? "Confirm Your Buy Order" : "Confirm Your Sell Order"}
        </h2>

        <div className="space-y-4 text-foreground">
          {rampMode === "onramp" ? (
            <>
              {/* Onramp: Show fee deduction from fiat */}
              <InfoRow
                label={`You Pay`}
                value={formatCurrency(fiatAmount, fiatCurrency)}
                highlight
              />

              {/* Fee Breakdown - Deducted from fiat */}
              {/* <div className="bg-muted/30 rounded-lg p-4 space-y-3 border border-border">
                <div className="text-sm font-medium text-muted-foreground">Fee Breakdown</div>

                <InfoRow
                  label="Service fee"
                  value={`${fees.percentage} (${formatCurrency(fees.serviceFee.toString(), fiatCurrency)})`}
                  className="text-sm pb-2"
                  noBorder
                />

                <div className="border-t border-border pt-2">
                  <InfoRow
                    label="Amount for crypto"
                    value={formatCurrency(fees.netAmount.toString(), fiatCurrency)}
                    className="text-sm font-medium"
                    subValue={`After ${fees.percentage} service fee`}
                    noBorder
                  />
                </div>
              </div> */}

              {/* <InfoRow
                label={`You Receive`}
                value={`${fees.cryptoAmount.toFixed(6)} ${tokenSymbol}`}
                highlight
              /> */}

              <InfoRow
                label={`You'll Receive`}
                value={`${fees.cryptoAmount.toFixed(6)} ${tokenSymbol}`}
                highlight
                subValue={`After ${fees.percentage} service fee`}
              />
            </>
          ) : (
            <>
              {/* Offramp: Show fee in crypto */}
              <InfoRow
                label={`You Send`}
                value={`${tokenAmount} ${tokenSymbol}`}
                highlight
              />

              <InfoRow
                label={`You'll Receive`}
                value={formatCurrency(fees.netAmount.toString(), fiatCurrency)}
                highlight
                subValue={`After ${fees.percentage} service fee`}
              />
            </>
          )}

          {/* Payment/Transfer Method */}
          <div className="py-2 border-b border-border">
            <div className="flex justify-between items-center">
              <span className="font-medium text-muted-foreground">
                {rampMode === "onramp" ? "Payment Method:" : "Transfer Method:"}
              </span>
              <div className="text-right">
                <div className="font-semibold text-xs px-2 py-1 border rounded-lg border-primary bg-primary/5 text-primary">{paymentOrTransfer}</div>
              </div>
            </div>
          </div>





          {selectedWallet && (
            <div className="py-2 border-b border-border">
              <div className="flex justify-between items-start">
                <span className="font-medium text-muted-foreground">
                  {rampMode === "onramp" ? "Receive to:" : "Receive to:"}
                </span>
                <div className="text-right">
                  <div className="font-semibold">{selectedWallet.name}</div>
                  <div className="text-sm text-muted-foreground">{selectedWallet.details}</div>
                </div>
              </div>
            </div>
          )}


          {/* Fee Breakdown */}
          {rampMode === "onramp"
            ? <InfoRow
              label="Service fee"
              value={`${fees.percentage} (${formatCurrency(fees.serviceFee.toString(), fiatCurrency)})`}
              className="text-sm pb-2"
              noBorder
            />
            :
            <InfoRow
              label="Service fee"
              value={`${fees.percentage} (${fees.serviceFee.toFixed(6)} ${tokenSymbol})`}
              className="text-sm"
              noBorder
            />
          }
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
  className = "",
  noBorder = false
}: {
  label: string;
  value: string;
  subValue?: string;
  highlight?: boolean;
  className?: string;
  noBorder?: boolean;
}) {
  return (
    <div className={`flex justify-between items-center py-2 ${noBorder ? '' : 'border-b border-border'} ${className}`}>
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