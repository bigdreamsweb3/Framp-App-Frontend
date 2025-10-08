// File: context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { login } from "@/lib/api/auth/login";
import { signup } from "@/lib/api/auth/signup";
import { logout } from "@/lib/api/auth/logout";
import { getCurrentUser } from "@/lib/api/auth/me";

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
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string, wallet?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await getCurrentUser(); // should call /api/auth/me
      console.log("🔍 Current user from API:", res); // 👈 Log API response
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

  useEffect(() => {
    fetchUser();
  }, []);

  async function handleLogin(email: string, password: string) {
    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.user) {
        setUser(res.user);
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
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Always clear user state, even if logout API fails
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login: handleLogin, signup: handleSignup, logout: handleLogout }}
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
