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

  useEffect(() => {
    (async () => {
      try {
        const res = await getCurrentUser();
        setUser(res.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleLogin(email: string, password: string) {
    const res = await login(email, password);
    setUser(res.user);
  }

  async function handleSignup(email: string, password: string, name?: string, wallet?: string) {
    const res = await signup(email, password, name, wallet);
    if (res.user) setUser(res.user);
  }

  async function handleLogout() {
    await logout();
    setUser(null);
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
