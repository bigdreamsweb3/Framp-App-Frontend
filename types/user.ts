// User types based on the backend API response structure

export interface UserProfile {
  id: string;
  email: string;
  name?: string; // Direct name property
  role: string;
  user: {
    id: string;
    name?: string;
    phone?: string;
    location?: string;
    created_at: string;
    updated_at: string;
    [key: string]: any;
  };
  profile: {
    role: string;
    phone?: string;
    location?: string;
    [key: string]: any;
  } | null;
  recent_offramps: any[];
  recent_onramps: any[];
  stats: {
    total_requests: number;
    completed_requests: number;
    pending_requests: number;
    total_amount_usd: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    location?: string;
    wallet?: string;
    referral?: string;
    status?: string;
    ip_address?: string;
    user_agent?: string;
    created_at: string;
    updated_at: string;
    role?: string;
    deleted_at?: string | null;
    date_of_birth?: string;
    [key: string]: any;
  };
  profile: {
    role: string;
    phone?: string;
    location?: string;
    [key: string]: any;
  } | null;
  recent_offramps: any[];
  recent_onramps: any[];
  stats: {
    total_requests: number;
    completed_requests: number;
    pending_requests: number;
    total_amount_usd: number;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
