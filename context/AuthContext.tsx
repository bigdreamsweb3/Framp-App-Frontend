// File: context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { login } from "@/lib/api/auth/login";
import { signup } from "@/lib/api/auth/signup";
import { logout } from "@/lib/api/auth/logout";
import { getCurrentUser } from "@/lib/api/auth/me";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core"
import { fetchAndStoreToken, logoutDynamicUser } from "@/lib/dynamic-auth-manager";


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
  // authToken: string | null; // 👈 Added: Expose token for global access
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // const { setShowAuthFlow, handleLogOut } = useDynamicContext();

  const fetchUser = async () => {
    try {
      setLoading(true);
      const token = fetchAndStoreToken(); // 👈 Use helper to ensure token is stored
      const res = await getCurrentUser(token || undefined);
      console.log("🔍 Current user from API:", res);
      if (res && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("AuthContext: no valid session", err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // 👈 Updated: Init effect - load token from localStorage first, then fetch user
  useEffect(() => {
    const token = fetchAndStoreToken();
    if (token) {
      fetchUser();
    } else {
      setLoading(false); // nothing to fetch yet
    }
  }, []);



  async function handleLogout() {
    try {
      console.log('AuthContext: calling logout API');
      // const res = await handleLogOut()
      await logoutDynamicUser()
      // console.log('AuthContext: logout API response', res);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
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
      value={{ user, loading, logout: handleLogout }} // 👈 Added authToken to value
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