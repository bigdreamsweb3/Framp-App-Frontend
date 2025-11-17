// File: context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { logout } from "@/lib/api/auth/logout";
import { getCurrentUser } from "@/lib/api/auth/me";
import { getAuthToken } from "@dynamic-labs/sdk-react-core";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core"

type User = {
  id: string;
  email: string;
  name?: string;
  wallet_address?: string;
  accountNumber?: string;
  tier?: string;
  created_at?: string;
  stats?: {
    total_transactions: number;
    total_volume_usd: number;
    portfolio_value: number;
  };
};

type AuthContextType = {
  user: User | null;
  authToken: string | null;
  loading: boolean;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Safe access to Dynamic context with fallback
  let setShowAuthFlow: ((show: boolean) => void) | undefined;
  let handleLogOut: (() => Promise<void>) | undefined;
  let dynamicUser: any;
  try {
    const dynamicContext = useDynamicContext();
    setShowAuthFlow = dynamicContext.setShowAuthFlow;
    handleLogOut = dynamicContext.handleLogOut;
    dynamicUser = dynamicContext.user;
  } catch {
    // Dynamic context not available yet
    setShowAuthFlow = () => { };
    handleLogOut = async () => { };
    dynamicUser = null;
  }

  // 👈 Listen to Dynamic user changes and fetch user data
  useEffect(() => {
    if (dynamicUser) {
      // User connected wallet - fetch user data
      fetchUser().then(() => {
        // Notify other components that user data has been updated
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('userDataUpdated'));
        }
      });
    } else {
      // User disconnected - clear user state
      setUser(null);
      setAuthToken(null);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('userDataUpdated'));
      }
    }
  }, [dynamicUser]);

  // 👈 Helper to get token from Dynamic Labs
  const fetchAuthToken = () => {
    if (typeof window === 'undefined') return null;

    const token = getAuthToken();
    if (token) {
      setAuthToken(token);
    } else {
      setAuthToken(null);
    }
    return token;
  };

  const fetchUser = async () => {
    try {
      setLoading(true);
      const token = fetchAuthToken();
      const res = await getCurrentUser(token || undefined);
      console.log("🔍 Current user from API:", res);
      if (res && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch (err: any) {
      console.error("AuthContext: no valid session", err);
      setUser(null);
      // 👈 Clear token for other errors
      setAuthToken(null);
    } finally {
      setLoading(false);
    }
  };

  // 👈 Refetch user
  const refetchUser = async () => {
    await fetchUser();
  };

  // 👈 Client-side init: Fetch on mount (after hydration)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    fetchUser();
  }, []);

  async function handleLogout() {
    try {
      console.log('AuthContext: calling logout API');
      const res = await handleLogOut?.();
      console.log('AuthContext: logout API response', res);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // 👈 Clear token from state on logout
      setAuthToken(null);
      // Refresh user state (will set null)
      try {
        await fetchUser();
      } catch (e) {
        setUser(null);
      }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authToken,
        loading,
        logout: handleLogout,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}