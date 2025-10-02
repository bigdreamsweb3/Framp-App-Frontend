"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Edit, Save, User, User2Icon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";

interface ProfileProps {
  onQuickAction?: (action: string) => void;
}

export function Profile({ onQuickAction }: ProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState({
    name: "User",
    email: "Not set",
    wallet: "Not connected",
    accountNumber: "****1234",
    tier: "Standard",
    joinDate: "Unknown",
    stats: {
      total_transactions: 0,
      total_volume_usd: 0,
      portfolio_value: 0,
    },
  });

  const { user, logout } = useAuth();

  useEffect(() => {
    if (user) {
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
        },
      });
    }
  }, [user]);

  const handleSave = () => {
    // save API call would go here
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-background mt-8.5 pt-1.5">
      {/* Profile section */}
      <Card
        className="bg-card/50 backdrop-blur-sm border-border/50"
        data-tour=""
      >
        {/* My Account Header */}
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User2Icon className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">My Profile</h2>
            </div>

          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Manage your profile and account settings
          </CardDescription>
        </CardHeader>

        <CardContent className="p-0">
          <div className="flex items-center gap-6 px-4 space-y-4">
            {/* Simple Avatar */}
            <div className="w-16 h-16 rounded-full bg-muted border flex items-center justify-center">
              <User className="h-6 w-6 text-muted-foreground" />
            </div>

            {/* User Info */}
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3 max-w-md">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Name
                    </label>
                    <Input
                      value={userProfile.name}
                      onChange={(e) =>
                        setUserProfile({ ...userProfile, name: e.target.value })
                      }
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1 block">
                      Email
                    </label>
                    <Input
                      value={userProfile.email}
                      onChange={(e) =>
                        setUserProfile({ ...userProfile, email: e.target.value })
                      }
                      placeholder="Enter your email"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <h1 className="text-xl font-semibold text-foreground">
                    {userProfile.name}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {userProfile.email}
                  </p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-2 mt-4">
                {isEditing ? (
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-1" /> Save Changes
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    <Edit className="h-4 w-4 mr-1" /> Edit Profile
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => logout?.()}
                >
                  <LogOut className="h-4 w-4 mr-1" /> Log Out
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      {/* <div className="mt-8 grid grid-cols-3 gap-6 text-center">
          <div>
            <p className="text-lg font-semibold">
              {userProfile.stats.total_transactions}
            </p>
            <p className="text-xs text-muted-foreground">Transactions</p>
          </div>
          <div>
            <p className="text-lg font-semibold">
              ${userProfile.stats.total_volume_usd}
            </p>
            <p className="text-xs text-muted-foreground">Total Volume</p>
          </div>
          <div>
            <p className="text-lg font-semibold">
              ${userProfile.stats.portfolio_value}
            </p>
            <p className="text-xs text-muted-foreground">Portfolio</p>
          </div>
        </div> */}

      {/* Join date */}
      {/* <p className="mt-6 text-xs text-muted-foreground text-center">
          Joined {userProfile.joinDate} • {userProfile.tier}
        </p> */}
    </div>

  );
}