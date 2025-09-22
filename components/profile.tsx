"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserIcon, Edit, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface ProfileProps {
  onQuickAction?: (action: string) => void;
}

export function Profile({ onQuickAction }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [copiedField, setCopiedField] = useState<"wallet" | "account" | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState({
    name: "User",
    email: "Not set",
    wallet: "Not connected",
    accountNumber: "****1234",
    tier: "Premium",
    joinDate: "Unknown",
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
        setUserProfile({
          name: "Alex Morgan",
          email: "alex.morgan@example.com",
          wallet: "0x742d35Cc6634C0532925a3b8D404fddF4f",
          accountNumber: "****8429",
          tier: "Premium",
          joinDate: "March 2024",
          stats: {
            total_transactions: 247,
            total_volume_usd: 125840,
            portfolio_value: 89420,
            monthly_return: 8.4,
            total_return: 24.7,
            risk_score: 6.2,
          },
        });
        setIsLoading(false);
        return;
      }

      const u = user as any;
      setUserProfile({
        name: u?.user?.name || "User",
        email: u?.user?.email || "Not set",
        wallet: u?.user?.wallet || "Not connected",
        accountNumber: u?.user?.accountNumber || "****1234",
        tier: u?.user?.tier || "Standard",
        joinDate: u?.user?.created_at
          ? new Date(u.user.created_at).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })
          : "Unknown",
        stats: u?.user?.stats || {
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
        <Card className="w-full max-w-md border-border/50">
          <CardContent className="p-6 text-center text-sm text-muted-foreground">
            <div className="animate-pulse">Loading your portfolio...</div>
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
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Account Information
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
                className="h-8 px-3 rounded-lg border-border/50"
                aria-label={
                  isEditing ? "Cancel editing profile" : "Edit profile"
                }
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-foreground"
                >
                  Full Name
                </Label>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
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
                    <span className="text-sm font-medium text-foreground">
                      {userProfile.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-foreground"
                >
                  Email Address
                </Label>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border border-border/50">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={userProfile.email}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          email: e.target.value,
                        })
                      }
                      className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                      aria-label="Edit email address"
                    />
                  ) : (
                    <span className="text-sm text-foreground">
                      {userProfile.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4 border-t border-border/50">
                <Button
                  onClick={handleSave}
                  className="flex-1 rounded-lg bg-primary hover:bg-primary/90"
                  aria-label="Save profile changes"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 rounded-lg border-border/50"
                  aria-label="Cancel editing profile"
                >
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            {user ? (
              <Button
                variant="outline"
                className="w-full rounded-lg border-destructive/20 text-destructive hover:bg-destructive/10 bg-transparent"
                onClick={() => logout?.()}
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            ) : (
              <div className="w-full p-4 rounded-lg border border-border/50 bg-muted/20 text-sm text-muted-foreground text-center">
                You are not signed in. Use the header to sign in.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
