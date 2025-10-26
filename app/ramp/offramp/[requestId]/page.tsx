"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OffRampPaymentDetails from "@/components/views/ramp/ramp-payment-details";
import { getOfframp } from "@/lib/api/payments/offramp";

export default function OffRampRequestPage({ params }: { params: Promise<{ requestId: string }> }) {
  const router = useRouter();

  // Unwrap params safely
  const { requestId } = use(params);

  const [request, setRequest] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getOfframp(requestId);
        setRequest(data);
      } catch (err) {
        console.error("Failed to load offramp request:", err);
        router.push("/ramp/offramp");
      }
    }
    load();
  }, [requestId, router]);

  if (!request) return <p className="text-center">Loading...</p>;

  const handleConfirm = () => {
    router.push(`/ramp/offramp/status/${requestId}`);
  };

  return (
    <OffRampPaymentDetails
      requestId={requestId}
      amountCrypto={request.amount}
      asset={request.token}
      network="SOLANA"
      walletAddress={request.expected_wallet_address}
      expiresAt={request.expires_at}
      onConfirm={handleConfirm}
    />
  );
}
