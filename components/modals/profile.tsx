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
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="max-w-4xl mx-auto">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="animate-pulse space-y-4">
                  <div className="h-8 w-48 bg-muted/30 rounded-lg mx-auto"></div>
                  <div className="h-4 w-64 bg-muted/30 rounded-lg mx-auto"></div>
                  <div className="h-32 w-full bg-muted/30 rounded-xl mt-8"></div>
                </div>
                <p className="text-sm text-muted-foreground mt-6">Loading your profile...</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="max-w-4xl mx-auto">
            <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
              <CardContent className="p-8 sm:p-12 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto">
                    <LogOut className="h-8 w-8 text-destructive" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground">Error Loading Profile</h3>
                  <p className="text-sm text-destructive max-w-md mx-auto">{error}</p>
                  {user ? (
                    <Button
                      variant="outline"
                      className="mt-6 rounded-xl bg-primary/10 hover:bg-primary/20"
                      onClick={() => logout?.()}
                      aria-label="Log out"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log Out
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      className="mt-6 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      onClick={() => window.location.reload()}
                    >
                      Try Again
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          {/* Header Section */}
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
              Profile Settings
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your account information and preferences
            </p>
          </div>

          {/* Main Profile Card */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
            <CardHeader className="pb-4 sm:pb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-foreground">
                    Account Information
                  </h2>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Update your personal details
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="h-9 px-4 rounded-xl border-border/50 hover:bg-primary/5 self-start sm:self-auto"
                  aria-label={
                    isEditing ? "Cancel editing profile" : "Edit profile"
                  }
                >
                  <Edit className="h-4 w-4 mr-2" />
                  {isEditing ? "Cancel" : "Edit"}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 sm:space-y-8">
              <div className="grid grid-cols-1 gap-4 sm:gap-6">
                {/* Full Name Field */}
                <div className="space-y-3">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-foreground"
                  >
                    Full Name
                  </Label>
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/50 hover:border-border/70 transition-colors">
                    <UserIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    {isEditing ? (
                      <Input
                        id="name"
                        value={userProfile.name}
                        onChange={(e) =>
                          setUserProfile({ ...userProfile, name: e.target.value })
                        }
                        className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm sm:text-base"
                        aria-label="Edit full name"
                        placeholder="Enter your full name"
                      />
                    ) : (
                      <span className="text-sm sm:text-base font-medium text-foreground truncate">
                        {userProfile.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Email Field */}
                <div className="space-y-3">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-foreground"
                  >
                    Email Address
                  </Label>
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-xl border border-border/50 hover:border-border/70 transition-colors">
                    <UserIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
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
                        className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0 text-sm sm:text-base"
                        aria-label="Edit email address"
                        placeholder="Enter your email address"
                      />
                    ) : (
                      <span className="text-sm sm:text-base text-foreground truncate">
                        {userProfile.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/50">
                  <Button
                    onClick={handleSave}
                    className="flex-1 h-11 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-sm font-medium"
                    aria-label="Save profile changes"
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 h-11 rounded-xl border-border/50 hover:bg-muted/50 text-sm font-medium"
                    aria-label="Cancel editing profile"
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Actions Card */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm shadow-sm">
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Account Actions
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your account and security settings
                  </p>
                </div>
                
                {user ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 h-11 rounded-xl border-destructive/20 text-destructive hover:bg-destructive/10 bg-transparent text-sm font-medium"
                      onClick={() => logout?.()}
                      aria-label="Log out"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                    {/* <Button
                      variant="outline"
                      className="flex-1 h-11 rounded-xl border-border/50 hover:bg-muted/50 text-sm font-medium"
                      aria-label="Change password"
                    >
                      Change Password
                    </Button> */}
                  </div>
                ) : (
                  <div className="w-full p-6 rounded-xl border border-border/50 bg-muted/20 text-center">
                    <p className="text-sm text-muted-foreground mb-4">
                      You are not signed in. Use the header to sign in.
                    </p>
                    <Button
                      variant="default"
                      className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                      onClick={() => window.location.reload()}
                    >
                      Refresh Page
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
