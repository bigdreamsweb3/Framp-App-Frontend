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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";



interface ProfileViewProps {
  isLoggedIn: boolean;
  onLogin: () => void;
  onClose?: () => void;
}

export function ProfileView({ isLoggedIn, onLogin, onClose }: ProfileViewProps) {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [copiedField, setCopiedField] = useState<"wallet" | "referral" | null>(null);

  const { user, logout } = useAuth();

  const [userProfile, setUserProfile] = useState({
    name: (user as any)?.user?.name || "",
    email: (user as any)?.user?.email || "",
    phone: (user as any)?.user?.phone || "",
    location: (user as any)?.user?.location || "",
    wallet: (user as any)?.user?.wallet || "",
    referral: (user as any)?.user?.referral || "",
    status: (user as any)?.user?.status || "",
    dateOfBirth: (user as any)?.user?.date_of_birth || "",
    joinDate: (user as any)?.user?.created_at
      ? new Date((user as any).user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
      : "Unknown",
  });

  useEffect(() => {
    if (user) {
      setUserProfile({
        name: (user as any)?.user?.name || "",
        email: (user as any)?.user?.email || "",
        phone: (user as any)?.user?.phone || "",
        location: (user as any)?.user?.location || "",
        wallet: (user as any)?.user?.wallet || "",
        referral: (user as any)?.user?.referral || "",
        status: (user as any)?.user?.status || "",
        dateOfBirth: (user as any)?.user?.date_of_birth || "",
        joinDate: (user as any)?.user?.created_at
          ? new Date((user as any).user.created_at).toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })
          : "Unknown",
      });
    }
  }, [user]);

  const handleCopy = async (text: string, field: "wallet" | "referral") => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSave = () => {
    // Mock API call to save profile
    console.log("Saving profile:", userProfile);
    setIsEditingProfile(false);
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50 max-w-md mx-auto">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">Profile</h3>
          </div>
          <div className="flex items-center gap-2">
            {user && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditingProfile(!isEditingProfile)}
                className="h-8 w-8 p-0 rounded-xl bg-primary/10 hover:bg-primary/20"
                aria-label={isEditingProfile ? "Cancel editing profile" : "Edit profile"}
              >
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {onClose && (
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 rounded-xl bg-primary/10 hover:bg-primary/20"
                aria-label="Close profile view"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {!user ? (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-muted/30 rounded-full mx-auto mb-4 flex items-center justify-center">
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Log in to manage your profile and access your wallet
            </p>
            <Button
              onClick={onLogin}
              className="rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
              aria-label="Log in or sign up"
            >
              Log in or Sign up
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="w-24 h-24">
                  <AvatarImage src="" alt={userProfile.name || "User"} />
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
                    {userProfile.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                {isEditingProfile && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute -bottom-1 -right-1 h-8 w-8 p-0 rounded-full bg-background border-border/50"
                    aria-label="Upload profile picture"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <h4 className="font-semibold text-lg mt-2">{userProfile.name || "User"}</h4>
              <p className="text-xs text-muted-foreground">
                Member since {userProfile.joinDate}
              </p>
            </div>

            {/* Profile Information */}
            <section aria-label="Profile information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-medium">
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
                        aria-label="Edit full name"
                      />
                    ) : (
                      <span className="text-sm">{userProfile.name || "Not set"}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs font-medium">
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
                          setUserProfile({ ...userProfile, email: e.target.value })
                        }
                        className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                        aria-label="Edit email address"
                      />
                    ) : (
                      <span className="text-sm">{userProfile.email || "Not set"}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-medium">
                    Phone Number
                  </Label>
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {isEditingProfile ? (
                      <Input
                        id="phone"
                        value={userProfile.phone}
                        onChange={(e) =>
                          setUserProfile({ ...userProfile, phone: e.target.value })
                        }
                        className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                        aria-label="Edit phone number"
                      />
                    ) : (
                      <span className="text-sm">{userProfile.phone || "Not set"}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location" className="text-xs font-medium">
                    Location
                  </Label>
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {isEditingProfile ? (
                      <Input
                        id="location"
                        value={userProfile.location}
                        onChange={(e) =>
                          setUserProfile({ ...userProfile, location: e.target.value })
                        }
                        className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                        aria-label="Edit location"
                      />
                    ) : (
                      <span className="text-sm">{userProfile.location || "Not set"}</span>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wallet" className="text-xs font-medium">
                    Wallet Address
                  </Label>
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50 relative">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-mono flex-1 truncate">
                      {userProfile.wallet || "Not connected"}
                    </span>
                    {userProfile.wallet && (
                      <>
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

                <div className="space-y-2">
                  <Label htmlFor="referral" className="text-xs font-medium">
                    Referral Code
                  </Label>
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50 relative">
                    <Gift className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs font-mono">{userProfile.referral || "Not available"}</span>
                    {userProfile.referral && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopy(userProfile.referral, "referral")}
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
                </div>
              </div>
            </section>

            {/* Additional Information */}
            <section aria-label="Additional information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-xs font-medium">
                    Account Status
                  </Label>
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                    <Shield className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm capitalize">{userProfile.status || "Unknown"}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-xs font-medium">
                    Date of Birth
                  </Label>
                  <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl border border-border/50">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{userProfile.dateOfBirth || "Not provided"}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Action Buttons */}
            {isEditingProfile && (
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
                  onClick={() => setIsEditingProfile(false)}
                  className="flex-1 rounded-xl bg-primary/10 hover:bg-primary/20"
                  aria-label="Cancel editing profile"
                >
                  Cancel
                </Button>
              </div>
            )}

            {/* Account Statistics */}
            <section aria-label="Account statistics" className="pt-4 border-t border-border/50">
              <h4 className="text-sm font-medium mb-3">Account Statistics</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                  <div className="text-xs text-muted-foreground">Total Requests</div>
                  <div className="text-lg font-semibold">{(user as any)?.stats?.total_requests || 0}</div>
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
                  <div className="text-xs text-muted-foreground">Total Volume</div>
                  <div className="text-lg font-semibold">${(user as any)?.stats?.total_amount_usd || 0}</div>
                </div>
              </div>
            </section>

            {/* Account Actions */}
            <section aria-label="Account actions" className="pt-4 border-t border-border/50 space-y-2">
              {/* <Button
                variant="outline"
                className="w-full justify-start rounded-xl bg-primary/10 hover:bg-primary/20 text-foreground"
                aria-label="View security settings"
              >
                Security Settings
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start rounded-xl bg-primary/10 hover:bg-primary/20 text-foreground"
                aria-label="View notification preferences"
              >
                Notification Preferences
              </Button> */}
              <Button
                variant="outline"
                className="w-full justify-start rounded-xl bg-gradient-to-r from-destructive/80 to-destructive hover:from-destructive hover:to-destructive/90 text-destructive-foreground"
                onClick={() => logout()} // Replace with actual logout
                aria-label="Sign out"
              >
                Sign Out
              </Button>
            </section>

            {/* Security Notice */}
            {/* <div className="p-4 bg-muted/20 rounded-xl border border-border/30 mt-4">
              <h5 className="font-medium text-sm mb-2">Security Notice</h5>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your profile data is encrypted and secure. We prioritize your privacy and never share personal information.
              </p>
            </div> */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}