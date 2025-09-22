"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User as UserIcon,
  Edit,
  Wallet,
  Send,
  Download,
  Settings,
  Copy,
  QrCode,
  ArrowUpCircle,
  DollarSign,
  Clock,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
 

interface ProfileProps {
  onQuickAction?: (action: string) => void;
}

export function Profile({ onQuickAction }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [copiedField, setCopiedField] = useState<"wallet" | "referral" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState({
    name: "User",
    email: "Not set",
    wallet: "Not connected",
    // referral: "Not available",
    joinDate: "Unknown",
    stats: { total_transactions: 0, total_volume_usd: 0 },
  });

  const { user, logout } = useAuth();

  useEffect(() => {
    try {
      if (user === null) {
        // Show graceful defaults when not logged in
        setUserProfile({
          name: "Guest",
          email: "Not set",
          wallet: "Not connected",
          // referral: "Not available",
          joinDate: "Unknown",
          stats: { total_transactions: 0, total_volume_usd: 0 },
        });
        setIsLoading(false);
        return;
      }

      const u = user as any;
      setUserProfile({
        name: u?.user?.name || "User",
        email: u?.user?.email || "Not set",
        wallet: u?.user?.wallet || "Not connected",
        // referral: u?.user?.referral || "Not available",
        joinDate: u?.user?.created_at
          ? new Date(u.user.created_at).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          : "Unknown",
        stats: u?.user?.stats || { total_transactions: 0, total_volume_usd: 0 },
      });
      setIsLoading(false);
    } catch (err) {
      setError("Failed to load profile data");
      setIsLoading(false);
    }
  }, [user]);

  const handleCopy = async (text: string, field: "wallet" | "referral") => {
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
      // Mock API call to save profile
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
            {user ? (
              <Button
                variant="outline"
                className="mt-4 rounded-xl bg-primary/10 hover:bg-primary/20"
                onClick={() => logout?.()}
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            ) : null}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 sm:p-6">
      <Card className="w-full max-w-md bg-card/50 backdrop-blur-sm border-border/50 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-30" />
        <CardContent className="p-4 sm:p-6 space-y-6 relative">
          {/* Profile Header */}
          <section aria-label="Profile header">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-16 h-16">
                  <AvatarImage src="" alt={userProfile.name} />
                  <AvatarFallback className="bg-primary/20 text-primary text-xl font-medium">
                    {userProfile.name.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">{userProfile.name}</h3>
                  <p className="text-xs text-muted-foreground">Member since {userProfile.joinDate}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="h-8 w-8 p-0 rounded-xl bg-primary/10 hover:bg-primary/20"
                aria-label={isEditing ? "Cancel editing profile" : "Edit profile"}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </section>

          {/* Quick Actions */}
          {/* <section aria-label="Quick actions">
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
          </section> */}

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
                  Email
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
                    <Button
                      variant="outline"
                      className="text-xs bg-primary/10 hover:bg-primary/20 rounded-xl"
                      aria-label="Connect wallet"
                      onClick={() => handleQuickAction("connect-wallet")}
                    >
                      Connect Wallet
                    </Button>
                  ) : (
                    <>
                      <span className="text-xs font-mono flex-1 truncate">{userProfile.wallet}</span>
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
                          >
                            Copied!
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              </div>
              {/* <div className="space-y-2">
                <Label htmlFor="referral" className="text-xs font-medium">
                  Referral Code
                </Label>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50 relative">
                  <QrCode className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-mono">{userProfile.referral}</span>
                  {userProfile.referral && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopy(userProfile.referral || "Not available", "referral")}
                        className="h-6 w-6 p-0 rounded-xl bg-primary/10 hover:bg-primary/20"
                        aria-label="Copy referral code"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <AnimatePresence>
                        {copiedField === "referral" && (
                          <motion.span
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-primary/90 text-primary-foreground text-xs px-2 py-1 rounded-xl"
                          >
                            Copied!
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </>
                  )}
                </div>
              </div> */}
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

        
          {/* Stats */}
          <section aria-label="Account statistics">
            <h4 className="text-sm font-medium mb-3">Statistics</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                <div className="text-xs text-muted-foreground">Total Transactions</div>
                <div className="text-lg font-semibold">
                  {userProfile.stats?.total_transactions ?? 0}
                </div>
              </div>
              <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                <div className="text-xs text-muted-foreground">Total Volume</div>
                <div className="text-lg font-semibold">
                  ${(userProfile.stats?.total_volume_usd ?? 0).toLocaleString("en-US", {
                    maximumFractionDigits: 2,
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Share Profile */}
          {/* <section aria-label="Share profile">
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
          </section> */}

          {/* Account Actions */}
          <section aria-label="Account actions">
            {user ? (
              <Button
                variant="outline"
                className="w-full rounded-xl bg-gradient-to-r from-destructive/80 to-destructive hover:from-destructive hover:to-destructive/90 text-destructive-foreground"
                onClick={() => logout?.()}
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            ) : (
              <div className="w-full p-3 rounded-xl border border-border/50 bg-muted/20 text-sm text-muted-foreground text-center">
                You are not signed in. Use the header to sign in.
              </div>
            )}
          </section>

          {/* Security Notice */}
          {/* <div className="p-4 bg-muted/20 rounded-xl border border-border/30">
            <h5 className="font-medium text-sm mb-2">Security Notice</h5>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Your profile and wallet data are encrypted and secure. We prioritize your privacy and never
              share personal information.
            </p>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}