"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Edit, Save, User, User2Icon, MoreVertical, ArrowLeft, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { App_Name } from "@/app/appConfig";

interface ProfileProps {
  onQuickAction?: (action: string) => void;
}

export function Profile({ onQuickAction }: ProfileProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  interface UserProfile {
    id: string;
    name: string;
    email: string;
    wallet: string;
    accountNumber: string;
    tier: string;
    joinDate: string;
    stats: {
      total_transactions: number;
      total_volume_usd: number;
      portfolio_value: number;
    };
  }

  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: "",
    name: "",
    email: "",
    wallet: "",
    accountNumber: "",
    tier: "",
    joinDate: "",
    stats: {
      total_transactions: 0,
      total_volume_usd: 0,
      portfolio_value: 0,
    }
  });

  const { user, logout } = useAuth();
  // console.log(user?.id)

  const handleSave = () => {
    // save API call would go here
    setIsEditing(false);
  };

  const handleLogin = () => {
    // navigate to the login page - adjust path if your app uses a different route
    try { router.push('/login'); } catch (e) { window.location.href = '/login'; }
  };

  const handleBack = () => {
    // If this profile is rendered as a modal, the parent passes onQuickAction to close it
    if (typeof onQuickAction === "function") {
      try { onQuickAction("close"); } catch (e) { }
      try { window.dispatchEvent(new CustomEvent('framp:closeProfile')); } catch (e) { }
      return;
    }
    // Prefer native history back when possible
    if (typeof window !== "undefined") {
      try {
        if (window.history.length > 1) {
          router.back();
          return;
        }
      } catch (e) {
        // fallthrough to other strategies
      }

      // If a previous path was stored by the app (optional), use it
      const prev = sessionStorage.getItem("framp.prevPath");
      if (prev) {
        router.push(prev);
        return;
      }

      // As a last-ditch, try the document referrer (may navigate outside SPA)
      if (document.referrer) {
        window.location.href = document.referrer;
        return;
      }
    }

    // Default fallback
    router.push("/");
  };



  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center md:justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10" onClick={handleBack} />

      {/* Modal */}
      <div className="mx-auto md:mx-0 w-full md:w-[40%] h-full md:min-h-screen bg-background p-4 md:p-8 md:pl-8 relative z-20 overflow-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleBack}>
            < className="size-5" />
          </Button>
          <h1 className="text-lg font-semibold">My Profile</h1>
          <Button variant="ghost" size="icon" className="rounded-full">
            <X className="size-5" onClick={handleBack} />
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="mb-6 items-center md:items-start text-center md:text-start flex-row gap-3">
          {user?.id ? (
            <>
              <Avatar className="ml-3 size-14">
                <Button
                  variant="ghost"
                  className={`relative inline-flex items-center justify-center w-8 h-8 md:w-9 md:h-9 overflow-hidden rounded-full transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 bg-gradient-to-br shadow-lg ring-2 ring-primary/30`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  <svg
                    className={`relative w-6 h-6 md:w-8 md:h-8 transition-colors duration-300 text-primary hover:text-primary/80`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </Button>
              </Avatar>

              <div className="my-1 text-start">
                <h2 className="text-md font-semibold">
                  <span className="lowercase">{App_Name}-
                    {user.name || "User" }</span>
                  {user.id && (
                    <span className="text-sm text-muted-foreground capitalize">-ID: {user.id.slice(0, 8)}</span>
                  )}
                </h2>
                <p className="text-muted-foreground text-sm">{user.email}</p>
              </div>
            </>
          ) : (
            <div className="w-full p-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">No user is logged in.</p>
              <Button onClick={handleLogin} className="mx-auto">Log In</Button>
            </div>
          )}
        </Card>


        {/* My Account */}
        <div>
          <h3 className="text-muted-foreground mb-3 text-sm font-medium">My Account</h3>
          <div className="space-y-2">
            <button
              onClick={() => {
                logout?.();
                // close modal if parent provided a closer
                if (typeof onQuickAction === "function") onQuickAction("close");
                try { window.dispatchEvent(new CustomEvent('framp:closeProfile')); } catch (e) { }
              }}
              className="block font-medium text-red-500 hover:underline"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
