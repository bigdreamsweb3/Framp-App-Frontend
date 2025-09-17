// File: lib/api/payments/onramp.ts
// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://framp-backend.vercel.app";

// Initialize a new onramp payment
// lib/api/payments/onramp.ts

export async function createOnramp({
  amount,
  currency = "NGN",
  tokenSymbol,
  tokenMint,
  walletAddress,

  paymentMethods = ["ACCOUNT_TRANSFER"],
}: //   paymentMethods = ["ACCOUNT_TRANSFER", "CARD", "USSD", "PHONE_NUMBER"],
{
  amount: number;
  currency?: string;
  tokenSymbol: string;
  tokenMint: string;
  walletAddress: string;
  paymentMethods?: string[];
}) {
  const res = await fetch(`${API_BASE}/api/payments/onramp`, {
    // ✅ FIXED URL
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-frontend-key": process.env.NEXT_PUBLIC_FRONTEND_KEY as string,
    },
    credentials: "include", // cookies sent automatically

    body: JSON.stringify({
      amount,
      currency,
      token: tokenSymbol,
      tokenMint,
      walletAddress,
      paymentMethods,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create onramp request");
  return data;
}

// Get all onramp requests
export async function getOnramps(
  token: string,
  {
    status,
    limit = 10,
    offset = 0,
  }: { status?: string; limit?: number; offset?: number } = {}
) {
  const url = new URL(`${API_BASE}/api/payments/onramp`);
  if (status) url.searchParams.set("status", status);
  url.searchParams.set("limit", limit.toString());
  url.searchParams.set("offset", offset.toString());

  const res = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-frontend-key": process.env.NEXT_PUBLIC_FRONTEND_KEY as string,
    },

    credentials: "include", // cookies sent automatically
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch onramps");
  return data;
}
