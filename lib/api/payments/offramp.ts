// File: lib/api/payments/offramp.ts
const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://framp-backend.vercel.app";

// ✅ Always fetch fresh token
function getAccessToken() {
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken");
  }
  return null;
}

export async function createOfframp({
  userWallet,
  // expectedWalletAddress,
  tokenSymbol,
  tokenMintAddress,
  amount,
  exchangeRate,
  fiatAmount,
  bankName,
  bankAccountNumber,
  bankAccountName,
  bankCode,
  currency,
  signedTransaction, // optional when user hasn’t sent token yet
}: {
  userWallet: string;
  // expectedWalletAddress: string;
  tokenSymbol: string;
  tokenMintAddress: string;
  amount: number;
  exchangeRate: number;
  fiatAmount: number;
  bankName?: string | null;
  bankAccountNumber: string;
  bankAccountName: string;
  bankCode: string;
  currency: string;
  signedTransaction?: string | null;
}) {
  const accessToken = getAccessToken();

  const res = await fetch(`${API_BASE}/api/payments/offramp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-frontend-key": process.env.NEXT_PUBLIC_FRONTEND_KEY as string,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    credentials: "include",
    body: JSON.stringify({
      user_wallet: userWallet,
      // expected_wallet_address: expectedWalletAddress,
      token_symbol: tokenSymbol,
      token_mint_address: tokenMintAddress,
      amount,
      exchange_rate: exchangeRate,
      fiat_amount: fiatAmount,
      bank_name: bankName,
      bank_account_number: bankAccountNumber,
      bank_account_name: bankAccountName,
      bank_code: bankCode,
      currency,
      signed_transaction: signedTransaction || null,
    }),
  });

  const data = await res.json();
  console.log("createOfframp:", data);

  if (!res.ok) {
    throw new Error(data.error || "Failed to create offramp request");
  }

  return data;
}

export async function getOfframp(id: string) {
  const accessToken = getAccessToken();

  const res = await fetch(`${API_BASE}/api/payments/offramp/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-frontend-key": process.env.NEXT_PUBLIC_FRONTEND_KEY as string,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to fetch offramp request");

  return data;
}
