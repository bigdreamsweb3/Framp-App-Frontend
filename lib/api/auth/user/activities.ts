// File: lib/api/auth/user/activities.ts

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
  amount: string;
  currency: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
  created_at: string;
  updated_at: string;
}

export interface ActivityTransaction {
  id: string;
  type: "onramp" | "offramp";
  amount: string;
  currency: string;
  tokenSymbol?: string;
  status: string;
  createdAt: string;
  completedAt?: string | null;
  paymentMethod?: string;
  walletAddress?: string;
  bankDetails?: any;
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

// Fetch all activities without pagination
export async function fetchAllUserActivities() {
  try {
    const response = await fetch(`${API_BASE}/api/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-frontend-key": process.env.NEXT_PUBLIC_FRONTEND_KEY as string,
      },
      credentials: "include", // cookies sent automatically
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
          tokenSymbol: tx.token_symbol,
          status: tx.status,
          createdAt: tx.created_at,
          completedAt: tx.completed_at,
          paymentMethod: tx.payment_method,
          walletAddress: tx.wallet_address,
        });
      });
    }
    
    // Add offramp transactions
    if (userInfo.recent_offramps) {
      userInfo.recent_offramps.forEach((tx: OffRampTransaction) => {
        activities.push({
          id: tx.id,
          type: "offramp",
          amount: tx.amount,
          currency: tx.currency,
          status: tx.status,
          createdAt: tx.created_at,
          completedAt: tx.updated_at,
        });
      });
    }
    
    // Sort by creation date (newest first)
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return activities;
  } catch (error) {
    console.error("Error fetching user activities:", error);
    return [];
  }
}

export async function fetchUserActivities(params: PaginationParams = {}) {
  try {
    const { page = 1, limit = 20 } = params;
    const offset = (page - 1) * limit;

    const response = await fetch(`${API_BASE}/api/auth/me?page=${page}&limit=${limit}&offset=${offset}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-frontend-key": process.env.NEXT_PUBLIC_FRONTEND_KEY as string,
      },
      credentials: "include", // cookies sent automatically
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
          tokenSymbol: tx.token_symbol,
          status: tx.status,
          createdAt: tx.created_at,
          completedAt: tx.completed_at,
          paymentMethod: tx.payment_method,
          walletAddress: tx.wallet_address,
        });
      });
    }
    
    // Add offramp transactions
    if (userInfo.recent_offramps) {
      userInfo.recent_offramps.forEach((tx: OffRampTransaction) => {
        activities.push({
          id: tx.id,
          type: "offramp",
          amount: tx.amount,
          currency: tx.currency,
          status: tx.status,
          createdAt: tx.created_at,
          completedAt: tx.updated_at,
        });
      });
    }
    
    // Sort by creation date (newest first)
    activities.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    // Calculate pagination info
    const total = activities.length;
    const totalPages = Math.ceil(total / limit);
    const paginatedData = activities.slice(offset, offset + limit);
    
    return {
      data: paginatedData,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error("Error fetching user activities:", error);
    return {
      data: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNext: false,
        hasPrev: false,
      },
    };
  }
}

// Legacy function for backward compatibility
export async function fetchUserOnRampTxHistory() {
  const response = await fetchUserActivities();
  return response.data.filter((activity: ActivityTransaction) => activity.type === "onramp");
}
