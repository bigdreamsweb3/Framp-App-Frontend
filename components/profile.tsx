"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  UserIcon,
  Edit,
  Wallet,
  Copy,
  LogOut,
  TrendingUp,
  DollarSign,
  Activity,
  Shield,
  ArrowUpCircle,
  Download,
  Send,
  Settings,
  QrCode,
  CreditCard,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { DynamicConnectButton } from "@dynamic-labs/sdk-react-core";
import Image from "next/image";
import { app_logo } from "@/asssets/image";
import { App_Name } from "@/app/appConfig";

interface AuthUser {
  name?: string;
  email?: string;
  wallet?: string;
  accountNumber?: string;
  tier?: string;
  created_at?: string;
  stats?: {
    total_transactions: number;
    total_volume_usd: number;
    portfolio_value: number;
    monthly_return: number;
    total_return: number;
    risk_score: number;
  };
}

interface ProfileProps {
  onQuickAction?: (action: string) => void;
}

export function Profile({ onQuickAction }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [copiedField, setCopiedField] = useState<"wallet" | "account" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState({
    name: "User",
    email: "Not set",
    wallet: "Not connected",
    accountNumber: "****1234",
    tier: "Standard",
    joinDate: "Unknown",
    balance: { usd: 0, crypto: [] as { symbol: string; amount: number }[] },
    stats: {
      total_transactions: 0,
      total_volume_usd: 0,
      portfolio_value: 0,
      monthly_return: 0,
      total_return: 0,
      risk_score: 0,
    },
  });

  const { user, logout } = useAuth();

  useEffect(() => {
    try {
      if (user === null) {
        setError("Please log in to view your profile");
        setIsLoading(false);
        return;
      }

      const u = user as AuthUser;
      setUserProfile({
        name: u?.name || "User",
        email: u?.email || "Not set",
        wallet: u?.wallet || "Not connected",
        accountNumber: u?.accountNumber || "****1234",
        tier: u?.tier || "Standard",
        joinDate: u?.created_at
          ? new Date(u.created_at).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          : "Unknown",
        balance: {
          usd: u?.stats?.portfolio_value || 0,
          crypto: [
            { symbol: "USDT", amount: (u?.stats?.portfolio_value || 0) / 1.0 },
            { symbol: "SOL", amount: (u?.stats?.portfolio_value || 0) / 150 },
          ],
        },
        stats: u?.stats || {
          total_transactions: 0,
          total_volume_usd: 0,
          portfolio_value: 0,
          monthly_return: 0,
          total_return: 0,
          risk_score: 0,
        },
      });
      setIsLoading(false);
    } catch (err) {
      setError("Failed to load profile data");
      setIsLoading(false);
    }
  }, [user]);

  const handleCopy = async (text: string, field: "wallet" | "account") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error("Copy failed:", err);
    }
  };

  const handleSave = async () => {
    try {
      console.log("Saving profile:", userProfile);
      setIsEditing(false);
    } catch (err) {
      console.error("Save failed:", err);
    }
  };

  const handleQuickAction = (action: string) => {
    if (onQuickAction) {
      onQuickAction(action);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 sm:p-6 space-y-6">
            <div className="animate-pulse space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-muted/30 rounded-full" />
                <div className="space-y-2">
                  <div className="h-5 w-32 bg-muted/30 rounded" />
                  <div className="h-4 w-24 bg-muted/30 rounded" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 bg-muted/30 rounded-xl" />
                ))}
              </div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-muted/30 rounded-xl" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
        <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="p-4 sm:p-6 text-center">
            <p className="text-sm text-destructive">{error}</p>
            {user && (
              <Button
                variant="outline"
                className="mt-4 rounded-xl bg-primary/10 hover:bg-primary/20"
                onClick={() => logout?.()}
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-30" />
        <CardContent className="p-4 sm:p-6 space-y-6 relative">
          {/* Profile Header */}
          <section aria-label="Profile header">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center space-y-2"
            >
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-primary/30 to-primary/10 blur-md opacity-50" />
                <Image
                  src={app_logo}
                  alt={`${App_Name} Logo`}
                  className="relative w-full h-full object-contain rounded-xl"
                />
              </div>
              <div className="flex items-center justify-center gap-2">
                <h3 className="text-lg font-semibold">{userProfile.name}</h3>
                <Badge
                  variant={userProfile.tier === "Premium" ? "default" : "outline"}
                  className={`rounded-xl ${userProfile.tier === "Premium" ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground" : "bg-primary/10 text-primary"}`}
                >
                  {userProfile.tier}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">Member since {userProfile.joinDate}</p>
            </motion.div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="absolute top-4 right-4 h-8 w-8 p-0 rounded-xl bg-primary/10 hover:bg-primary/20"
              aria-label={isEditing ? "Cancel editing profile" : "Edit profile"}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </section>

          {/* Quick Actions */}
          <section aria-label="Quick actions">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Button
                variant="default"
                className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 flex items-center gap-2"
                onClick={() => handleQuickAction("deposit")}
                aria-label="Deposit funds"
              >
                <ArrowUpCircle className="h-4 w-4" />
                <span className="text-xs">Deposit</span>
              </Button>
              <Button
                variant="outline"
                className="rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center gap-2"
                onClick={() => handleQuickAction("withdraw")}
                aria-label="Withdraw funds"
              >
                <Download className="h-4 w-4" />
                <span className="text-xs">Withdraw</span>
              </Button>
              <Button
                variant="outline"
                className="rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center gap-2"
                onClick={() => handleQuickAction("send")}
                aria-label="Send crypto"
              >
                <Send className="h-4 w-4" />
                <span className="text-xs">Send</span>
              </Button>
              <Button
                variant="outline"
                className="rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center gap-2"
                onClick={() => handleQuickAction("settings")}
                aria-label="Open settings"
              >
                <Settings className="h-4 w-4" />
                <span className="text-xs">Settings</span>
              </Button>
            </div>
          </section>

          {/* Account Info */}
          <section aria-label="Account information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-medium">
                  Full Name
                </Label>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  {isEditing ? (
                    <Input
                      id="name"
                      value={userProfile.name}
                      onChange={(e) =>
                        setUserProfile({ ...userProfile, name: e.target.value })
                      }
                      className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                      aria-label="Edit full name"
                    />
                  ) : (
                    <span className="text-sm">{userProfile.name}</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-medium">
                  Email Address
                </Label>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={userProfile.email}
                      onChange={(e) =>
                        setUserProfile({ ...userProfile, email: e.target.value })
                      }
                      className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                      aria-label="Edit email address"
                    />
                  ) : (
                    <span className="text-sm">{userProfile.email}</span>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="wallet" className="text-xs font-medium">
                  Wallet Address
                </Label>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50 relative">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  {userProfile.wallet === "Not connected" ? (
                    <DynamicConnectButton>
                      <Button
                        variant="outline"
                        className="text-xs bg-primary/10 hover:bg-primary/20 rounded-xl"
                        aria-label="Connect wallet"
                      >
                        Connect Wallet
                      </Button>
                    </DynamicConnectButton>
                  ) : (
                    <>
                      <span className="text-xs font-mono flex-1 truncate">
                        {userProfile.wallet}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(userProfile.wallet, "wallet")}
                        className="h-6 w-6 p-0 rounded-xl bg-primary/10 hover:bg-primary/20"
                        aria-label="Copy wallet address"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <AnimatePresence>
                        {copiedField === "wallet" && (
                          <motion.span
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-xl"
                            aria-live="polite"
                          >
                            Copied!
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber" className="text-xs font-medium">
                  Account Number
                </Label>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50 relative">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-mono">{userProfile.accountNumber}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(userProfile.accountNumber, "account")}
                    className="h-6 w-6 p-0 rounded-xl bg-primary/10 hover:bg-primary/20"
                    aria-label="Copy account number"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                  <AnimatePresence>
                    {copiedField === "account" && (
                      <motion.span
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-xl"
                        aria-live="polite"
                      >
                        Copied!
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleSave}
                  className="flex-1 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                  aria-label="Save profile changes"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 rounded-xl bg-primary/10 hover:bg-primary/20"
                  aria-label="Cancel editing profile"
                >
                  Cancel
                </Button>
              </div>
            )}
          </section>

          {/* Balance */}
          <section aria-label="Account balance">
            <h4 className="text-sm font-medium mb-3">Balance</h4>
            <div className="p-4 bg-muted/30 rounded-xl border border-border/50 space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">
                  ${(userProfile.balance?.usd ?? 0).toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              {userProfile.balance?.crypto?.length > 0 ? (
                userProfile.balance.crypto.map((coin, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {(coin.amount ?? 0).toLocaleString("en-US", { maximumFractionDigits: 4 })}{" "}
                      {coin.symbol}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No crypto assets</p>
              )}
            </div>
          </section>

          {/* Portfolio Stats */}
          <section aria-label="Portfolio statistics">
            <h4 className="text-sm font-medium mb-3">Portfolio Statistics</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Total Transactions</span>
                </div>
                <div className="text-lg font-semibold">
                  {userProfile.stats?.total_transactions ?? 0}
                </div>
              </div>
              <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Total Volume</span>
                </div>
                <div className="text-lg font-semibold">
                  ${(userProfile.stats?.total_volume_usd ?? 0).toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Portfolio Value</span>
                </div>
                <div className="text-lg font-semibold">
                  ${(userProfile.stats?.portfolio_value ?? 0).toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
              <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Monthly Return</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold">
                    {userProfile.stats?.monthly_return ?? 0}%
                  </span>
                  <Progress
                    value={Math.min((userProfile.stats?.monthly_return ?? 0) * 10, 100)}
                    className="h-2"
                    aria-label="Monthly return progress"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Risk Profile */}
          <section aria-label="Risk profile">
            <h4 className="text-sm font-medium mb-3">Risk Profile</h4>
            <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Risk Score</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">
                  {userProfile.stats?.risk_score ?? 0}/10
                </span>
                <Progress
                  value={(userProfile.stats?.risk_score ?? 0) * 10}
                  className="h-2"
                  aria-label="Risk score progress"
                />
              </div>
            </div>
          </section>

          {/* Share Profile */}
          <section aria-label="Share profile">
            <h4 className="text-sm font-medium mb-3">Share Your Profile</h4>
            <div className="p-4 bg-muted/30 rounded-xl border border-border/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Share via QR Code</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 rounded-xl bg-primary/10 hover:bg-primary/20"
                onClick={() => handleQuickAction("share-qr")}
                aria-label="Generate profile QR code"
              >
                Generate QR
              </Button>
            </div>
          </section>

          {/* Account Actions */}
          <section aria-label="Account actions">
            {user && (
              <Button
                variant="outline"
                className="w-full rounded-xl bg-gradient-to-r from-destructive/80 to-destructive hover:from-destructive hover:to-destructive/90 text-destructive-foreground"
                onClick={() => logout?.()}
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            )}
          </section>

          {/* Security Notice */}
          <div className="p-4 bg-muted/20 rounded-xl border border-border/30">
            <h5 className="font-medium text-sm mb-2">Security Notice</h5>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your profile, wallet, and financial data are encrypted and secure. {App_Name} prioritizes your privacy and never shares personal information.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}