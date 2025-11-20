// File: lib/api/payments/onramp.ts
// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

import { getHeaders } from "@/lib/helpers/api-headers";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://framp-backend.vercel.app";

export async function createOnramp({
  fiatAmount,
  fiatCurrency,
  tokenSymbol,
  tokenMint = "",
  tokenAmount = "",
  exchangeRate = 0,
  walletAddress,
  walletInfo,
  paymentMethods = ["CARD"],
}: {
  fiatAmount: number;
  fiatCurrency: string;
  tokenSymbol: string;
  tokenMint?: string;
  tokenAmount?: string;
  exchangeRate?: number;
  walletAddress: string;
  walletInfo?: {
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
  paymentMethods?: string[];
}) {
  const res = await fetch(`${API_BASE}/api/payments/onramp`, {
    method: "POST", // ✅ FIXED
    headers: getHeaders(),
    credentials: "include",
    body: JSON.stringify({
      fiatAmount,
      fiatCurrency,
      token: tokenSymbol,
      tokenMint,
      tokenAmount,
      exchangeRate,
      walletAddress,
      walletInfo,
      paymentMethods,
    }),
  });

  const data = await res.json();
  console.log("✅ createOnramp:", data);

  if (!res.ok) {
    throw new Error(data.error || "Failed to create onramp request");
  }

  return data;
}

export async function getOnramps({
  status,
  limit = 10,
  offset = 0,
}: {
  status?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const url = new URL(`${API_BASE}/api/payments/onramp`);
  if (status) url.searchParams.set("status", status);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));

  const res = await fetch(url.href, {
    method: "GET",
    headers: getHeaders(),
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch onramps");

  return data;
}
