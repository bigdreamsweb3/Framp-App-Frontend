"use client";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";

interface ConfirmOnRampModalProps {
  payAmount: string;       // User’s fiat amount (e.g. NGN)
  payCurrency: string;     // Fiat currency code
  receiveAmount: number;   // Estimated crypto amount
  receiveToken: string;    // Crypto token name
  paymentMethod: string;   // Payment method (Card, Bank etc.)
  onConfirm: () => Promise<void> | void; // ✅ Supports async or sync
  onCancel: () => void;
}

export function ConfirmOnRampModal({
  payAmount,
  payCurrency,
  receiveAmount,
  receiveToken,
  paymentMethod,
  onConfirm,
  onCancel,
}: ConfirmOnRampModalProps) {
  const [loading, setLoading] = useState(false);

  // Allow closing with ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && !loading && onCancel();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [loading, onCancel]);

  async function handleConfirm() {
    if (loading) return; // Prevent multiple clicks
    setLoading(true);
    try {
      await onConfirm(); // ✅ Wait for any async action
    } catch (err) {
      console.error("Confirmation failed:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] bg-background/80 backdrop-blur-sm flex items-center justify-center"
      onClick={!loading ? onCancel : undefined}
    >
      <div
        className="relative w-[90%] max-w-md bg-card border border-border rounded-lg p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <Button
          onClick={onCancel}
          disabled={loading}
          className="absolute top-3 right-3 bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground rounded-full w-8 h-8 flex items-center justify-center transition-colors"
        >
          ✕
        </Button>

        <h2 className="text-xl font-semibold mb-6 text-foreground">
          Confirm Your Purchase
        </h2>

        {/* Details */}
        <div className="space-y-4 text-foreground">
          <InfoRow label={`Amount (${payCurrency})`} value={payAmount} />
          <InfoRow label="Token" value={receiveToken} />
          <InfoRow label={`Estimated ${receiveToken}`} value={receiveAmount.toString()} />
          <InfoRow label="Payment Method" value={paymentMethod} />
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          <Button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg py-3 font-medium transition-colors"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-3 font-medium transition-colors disabled:opacity-70"
          >
            {loading ? "Processing..." : "Confirm"}
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
