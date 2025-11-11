// File: lib/api/auth/user/activities.ts

import { getAuthToken } from "@dynamic-labs/sdk-react-core";

export interface OnRampTransaction {
  id: string;
  amount: string;
  currency: string;
  payment_reference: string;
  transaction_reference: string;
  checkout_url: string;
  fiat_amount: string;
  fiat_currency: string;
  amount_paid: string;
  settlement_amount: string;
  token_symbol: string;
  token_mint: string;
  token_amount: string;
  wallet_address: string;
  exchange_rate: string;
  fee_amount: string;
  fee_percentage: string;
  payment_method: string;
  payment_details: any;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  failure_reason: string | null;
  blockchain_tx_hash: string | null;
  blockchain_status: string | null;
  blockchain_confirmations: number | null;
  confirmed_at: string | null;
  completed_at: string | null;
  paid_on: string | null;
  created_at: string;
  updated_at: string;
}

export interface OffRampTransaction {
  id: string;
  user_id: string;
  wallet: string;
  token: string;
  token_mint_address: string;
  amount: string;
  fiat_amount: string;
  exchange_rate: string;
  bank_name: string;
  bank_account_number: string;
  bank_code: string;
  blockchain_tx_hash: string | null;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  created_at: string;
  updated_at: string;
  fiat_disbursement_status: "pending" | "processing" | "completed" | "failed";
  disbursed_at: string | null;
  payout_reference: string | null;
  admin_note: string | null;
  currency: string;
}

export interface ActivityTransaction {
  id: string;
  type: "onramp" | "offramp" | "bill";
  amount: string;
  currency: string;
  tokenAmount: string;
  tokenSymbol?: string;
  status: string;
  createdAt: string;
  completedAt?: string | null;
  paymentMethod?: string;
  walletAddress?: string;
  bankDetails?: any;

  // Extended fields for detailed view
  exchangeRate?: string;
  feeAmount?: string;
  feePercentage?: string;
  blockchainHash?: string | null;
  blockchainStatus?: string | null;
  blockchainConfirmations?: number | null;
  checkoutUrl?: string;
  paymentReference?: string;
  transactionReference?: string;

  // Off-ramp specific fields
  bankName?: string;
  bankAccountNumber?: string;
  bankCode?: string;
  fiatDisbursementStatus?: string;
  disbursedAt?: string | null;
  payoutReference?: string | null;
  adminNote?: string | null;
  tokenMintAddress?: string;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "https://framp-backend.vercel.app";

export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Helper function to get headers with authorization
const getHeaders = (): HeadersInit => {
  // Use Dynamic Labs token instead of localStorage
  const accessToken = getAuthToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "x-frontend-key": process.env.NEXT_PUBLIC_FRONTEND_KEY as string,
  };

  // Add authorization header if accessToken exists
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  return headers;
};

// Fetch all activities without pagination
// In lib/api/auth/user/activities.ts
export async function fetchAllUserActivities(
  accessToken?: string
): Promise<ActivityTransaction[]> {
  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      method: "GET",
      headers: getHeaders(),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user activities");
    }

    const data = await response.json();
    const userInfo = data.user;

    // Combine and format onramp and offramp transactions
    const activities: ActivityTransaction[] = [];

    // Add onramp transactions
    if (userInfo.recent_onramps) {
      userInfo.recent_onramps.forEach((tx: OnRampTransaction) => {
        activities.push({
          id: tx.id,
          type: "onramp",
          amount: tx.fiat_amount || tx.amount,
          currency: tx.fiat_currency || tx.currency,
          tokenAmount: tx.token_amount,
          tokenSymbol: tx.token_symbol,
          status: tx.status,
          createdAt: tx.created_at,
          completedAt: tx.completed_at,
          paymentMethod: tx.payment_method,
          walletAddress: tx.wallet_address,
          exchangeRate: tx.exchange_rate,
          feeAmount: tx.fee_amount,
          feePercentage: tx.fee_percentage,
          blockchainHash: tx.blockchain_tx_hash,
          blockchainStatus: tx.blockchain_status,
          blockchainConfirmations: tx.blockchain_confirmations,
          checkoutUrl: tx.checkout_url,
          paymentReference: tx.payment_reference,
          transactionReference: tx.transaction_reference,
        });
      });
    }

    // Add offramp transactions
    if (userInfo.recent_offramps) {
      userInfo.recent_offramps.forEach((tx: OffRampTransaction) => {
        activities.push({
          id: tx.id,
          type: "offramp",
          amount: tx.fiat_amount || tx.amount,
          currency: tx.currency,
          tokenAmount: tx.amount,
          tokenSymbol: tx.token,
          status: tx.status,
          createdAt: tx.created_at,
          completedAt: tx.disbursed_at || tx.updated_at,
          walletAddress: tx.wallet,
          exchangeRate: tx.exchange_rate,
          blockchainHash: tx.blockchain_tx_hash,
          bankName: tx.bank_name,
          bankAccountNumber: tx.bank_account_number,
          bankCode: tx.bank_code,
          fiatDisbursementStatus: tx.fiat_disbursement_status,
          disbursedAt: tx.disbursed_at,
          payoutReference: tx.payout_reference,
          adminNote: tx.admin_note,
          tokenMintAddress: tx.token_mint_address,
        });
      });
    }

    // Sort by creation date (newest first)
    activities.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return activities;
  } catch (error) {
    console.error("Error fetching user activities:", error);
    return [];
  }
}
// Fetch detailed transaction by ID (useful for the receipt view)
export async function fetchTransactionDetails(
  id: string,
  type: "onramp" | "offramp"
) {
  try {
    const endpoint =
      type === "onramp"
        ? `${API_BASE}/api/onramp/${id}`
        : `${API_BASE}/api/offramp/${id}`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-frontend-key": process.env.NEXT_PUBLIC_FRONTEND_KEY as string,
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${type} transaction details`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching ${type} transaction details:`, error);
    return null;
  }
}

// Legacy function for backward compatibility
// export async function fetchUserOnRampTxHistory() {
//   const response = await fetchUserActivities();
//   return response.data.filter(
//     (activity: ActivityTransaction) => activity.type === "onramp"
//   );
// }
