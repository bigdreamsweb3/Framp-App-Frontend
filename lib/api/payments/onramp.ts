// File: lib/api/payments/onramp.ts
// const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://framp-backend.vercel.app";

// ✅ Always get the latest token when needed (not on load)
function getAccessToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
}

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
  const accessToken = getAccessToken();

  const res = await fetch(`${API_BASE}/api/payments/onramp`, {
    method: "POST", // ✅ FIXED
    headers: {
      "Content-Type": "application/json",
      "x-frontend-key": process.env.NEXT_PUBLIC_FRONTEND_KEY as string,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
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
  const accessToken = getAccessToken();

  const url = new URL(`${API_BASE}/api/payments/onramp`);
  if (status) url.searchParams.set("status", status);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));

  const res = await fetch(url.href, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-frontend-key": process.env.NEXT_PUBLIC_FRONTEND_KEY as string,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    credentials: "include",
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch onramps");

  return data;
}
