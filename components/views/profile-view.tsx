"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  User,
  Edit,
  Camera,
  Mail,
  Phone,
  MapPin,
  X,
  Wallet,
  Gift,
  Calendar,
  Shield,
  Copy,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
// import type { AuthUser } from "@/types/user";

interface ProfileViewProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onClose?: () => void;
}

export function ProfileView({
  isLoggedIn,
  onLogin,
  onClose,
}: ProfileViewProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const { user } = useAuth();

  const [userProfile, setUserProfile] = useState({
    name: (user as any)?.user.user?.name || "",
    email: (user as any)?.user.user?.email || "",
    phone: (user as any)?.user.user?.phone || "",
    location: (user as any)?.user.user?.location || "",
    wallet: (user as any)?.user.user?.wallet || "",
    referral: (user as any)?.user.user?.referral || "",
    status: (user as any)?.user.user?.status || "",
    dateOfBirth: (user as any)?.user.user?.date_of_birth || "",
    joinDate: (user as any)?.user.user?.created_at
      ? new Date((user as any).user.user.created_at).toLocaleDateString(
          "en-US",
          {
            month: "long",
            year: "numeric",
          }
        )
      : "Unknown",
  });

  // Update profile when user data changes
  useEffect(() => {
    if (user) {
      setUserProfile({
        name: (user as any)?.user.user?.name || "",
        email: (user as any)?.user?.email || "",
        phone: (user as any)?.user.user?.phone || "",
        location: (user as any)?.user.user?.location || "",
        wallet: (user as any)?.user.user?.wallet || "",
        referral: (user as any)?.user.user?.referral || "",
        status: (user as any)?.user.user?.status || "",
        dateOfBirth: (user as any)?.user.user?.date_of_birth || "",
        joinDate: (user as any)?.user.user?.created_at
          ? new Date((user as any).user.user.created_at).toLocaleDateString(
              "en-US",
              { month: "long", year: "numeric" }
            )
          : "Unknown",
      });
    }
  }, [user]);

  // Debug: Log the full user object to see what data is available
  console.log("Full user object:", user);
  console.log("User profile data:", userProfile);
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Profile</h3>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="h-8 w-8 p-0 rounded-full"
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {!user ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Please log in to view your profile
            </p>
            <Button onClick={onLogin} className="rounded-xl">
              Log in or sign up
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute -bottom-1 -right-1 h-8 w-8 p-0 rounded-full bg-background"
                >
                  <Camera className="h-4 w-4" />
                </Button>
              </div>
              <h4 className="font-semibold text-lg">{userProfile.name}</h4>
              <p className="text-sm text-muted-foreground">
                Member since {userProfile.joinDate}
              </p>
            </div>

            {/* Profile Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">
                  Full Name
                </Label>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                  <User className="h-4 w-4 text-muted-foreground" />
                  {isEditingProfile ? (
                    <Input
                      id="name"
                      value={userProfile.name}
                      onChange={(e) =>
                        setUserProfile({ ...userProfile, name: e.target.value })
                      }
                      className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                    />
                  ) : (
                    <span className="text-sm">{userProfile.name}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {isEditingProfile ? (
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
                    />
                  ) : (
                    <span className="text-sm">{userProfile.email}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">
                  Phone Number
                </Label>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  {isEditingProfile ? (
                    <Input
                      id="phone"
                      value={userProfile.phone}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          phone: e.target.value,
                        })
                      }
                      className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                    />
                  ) : (
                    <span className="text-sm">{userProfile.phone}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-medium">
                  Location
                </Label>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  {isEditingProfile ? (
                    <Input
                      id="location"
                      value={userProfile.location}
                      onChange={(e) =>
                        setUserProfile({
                          ...userProfile,
                          location: e.target.value,
                        })
                      }
                      className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                    />
                  ) : (
                    <span className="text-sm">
                      {userProfile.location || "Not set"}
                    </span>
                  )}
                </div>
              </div>

              {/* Crypto-related fields */}
              <div className="space-y-2">
                <Label htmlFor="wallet" className="text-sm font-medium">
                  Wallet Address
                </Label>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-mono flex-1 truncate">
                    {userProfile.wallet || "Not connected"}
                  </span>
                  {userProfile.wallet && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigator.clipboard.writeText(userProfile.wallet)
                      }
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="referral" className="text-sm font-medium">
                  Referral Code
                </Label>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                  <Gift className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-mono">
                    {userProfile.referral || "Not available"}
                  </span>
                  {userProfile.referral && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigator.clipboard.writeText(userProfile.referral)
                      }
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium">
                  Account Status
                </Label>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm capitalize">
                    {userProfile.status || "Unknown"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-sm font-medium">
                  Date of Birth
                </Label>
                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {userProfile.dateOfBirth || "Not provided"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {isEditingProfile && (
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 rounded-xl"
                >
                  Save Changes
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 rounded-xl"
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* User Statistics */}
            <div className="pt-4 border-t border-border/50">
              <h4 className="text-sm font-medium mb-3">Account Statistics</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                  <div className="text-xs text-muted-foreground">
                    Total Requests
                  </div>
                  <div className="text-lg font-semibold">
                    {(user as any)?.stats?.total_requests || 0}
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                  <div className="text-xs text-muted-foreground">Completed</div>
                  <div className="text-lg font-semibold text-green-600">
                    {(user as any)?.stats?.completed_requests || 0}
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                  <div className="text-xs text-muted-foreground">Pending</div>
                  <div className="text-lg font-semibold text-yellow-600">
                    {(user as any)?.stats?.pending_requests || 0}
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                  <div className="text-xs text-muted-foreground">
                    Total Volume
                  </div>
                  <div className="text-lg font-semibold">
                    ${(user as any)?.stats?.total_amount_usd || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Account Actions */}
            <div className="pt-4 border-t border-border/50 space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start rounded-xl text-muted-foreground"
              >
                Security Settings
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start rounded-xl text-muted-foreground"
              >
                Notification Preferences
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start rounded-xl text-destructive"
              >
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
