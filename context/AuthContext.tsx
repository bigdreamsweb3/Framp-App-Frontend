// File: context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { login } from "@/lib/api/auth/login";
import { signup } from "@/lib/api/auth/signup";
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
  authToken: string | null; // 👈 Added: Expose token for global access
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string, wallet?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null); // 👈 Added: Manage token in state
  const [loading, setLoading] = useState(true);

  const { setShowAuthFlow, handleLogOut, user: dynamicUser } = useDynamicContext();

  // 👈 Listen to Dynamic user changes and fetch user data
  useEffect(() => {
    if (dynamicUser) {
      // User connected wallet - fetch user data
      fetchUser();
    } else {
      // User disconnected - clear user state
      setUser(null);
      setAuthToken(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
    }
  }, [dynamicUser]);

  // 👈 Added: Helper to get token and persist it
  const fetchAndStoreToken = () => {
    if (typeof window === 'undefined') return null;
    
    const token = getAuthToken();
    if (token) {
      localStorage.setItem('authToken', token); // Store in localStorage
      setAuthToken(token);
    } else {
      // If no token, clear localStorage (e.g., on app init if expired)
      localStorage.removeItem('authToken');
      setAuthToken(null);
    }
    return token;
  };

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
      // 👈 Clear invalid token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
      setAuthToken(null);
    } finally {
      setLoading(false);
    }
  };

  // 👈 Updated: Init effect - load token from localStorage first, then fetch user
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Restore token from localStorage on mount (e.g., page refresh)
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setAuthToken(storedToken);
    }
    fetchUser();
  }, []);

  async function handleLogin(email: string, password: string) {
    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.user) {
        setUser(res.user);
        // 👈 Fetch and store token post-login (Dynamic Labs may set it internally)
        fetchAndStoreToken();
        // 👈 Refetch user data to ensure we have the latest state
        await fetchUser();
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function handleSignup(email: string, password: string, name?: string, wallet?: string) {
    try {
      setLoading(true);
      const res = await signup(email, password, name, wallet);
      if (res.user) {
        setUser(res.user);
        // 👈 Fetch and store token post-signup
        fetchAndStoreToken();
        // 👈 Refetch user data to ensure we have the latest state
        await fetchUser();
      }
    } catch (error) {
      console.error("Signup error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      console.log('AuthContext: calling logout API');
      const res = await handleLogOut();
      console.log('AuthContext: logout API response', res);
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // 👈 Clear token from state and localStorage on logout
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
      }
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
      value={{ user, authToken, loading, login: handleLogin, signup: handleSignup, logout: handleLogout }} // 👈 Added authToken to value
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