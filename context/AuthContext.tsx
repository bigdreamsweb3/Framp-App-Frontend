// File: context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { login } from "@/lib/api/auth/login";
import { signup } from "@/lib/api/auth/signup";
import { logout } from "@/lib/api/auth/logout";
import { getCurrentUser } from "@/lib/api/auth/me";
import { getAuthToken } from "@dynamic-labs/sdk-react-core";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";

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
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string, wallet?: string) => Promise<void>;
  logout: () => Promise<void>;
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
    setShowAuthFlow = () => { };
    handleLogOut = async () => { };
    dynamicUser = null;
  }

  const fetchAndStoreToken = () => {
    if (typeof window === "undefined") return null;

    let token: string | null = null;

    try {
      const rawToken = getAuthToken();
      token = rawToken ?? null;
    } catch {
      token = null;
    }


    if (token) {
      localStorage.setItem("authToken", token);
      setAuthToken(token);
    } else {
      localStorage.removeItem("authToken");
      setAuthToken(null);
    }

    return token;
  };

  const fetchUser = async () => {
    if (typeof window === "undefined") return; // ✅ Prevent SSR crash

    try {
      setLoading(true);
      const token = fetchAndStoreToken();
      const res = await getCurrentUser(token || undefined);

      if (res?.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("AuthContext: no valid session", err);
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }
      setAuthToken(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Init load
  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedToken = localStorage.getItem("authToken");
    if (storedToken) setAuthToken(storedToken);

    fetchUser();
  }, []);

  // ✅ Dynamic Wallet changes
  useEffect(() => {
    if (dynamicUser) {
      fetchUser();
    } else {
      setUser(null);
      setAuthToken(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }
    }
  }, [dynamicUser]);

  async function handleLogin(email: string, password: string) {
    try {
      setLoading(true);
      const res = await login(email, password);

      if (res.user) {
        setUser(res.user);
        fetchAndStoreToken();
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
        fetchAndStoreToken();
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
      await handleLogOut?.();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("authToken");
      }
      setAuthToken(null);
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        authToken,
        loading,
        login: handleLogin,
        signup: handleSignup,
        logout: handleLogout,
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
