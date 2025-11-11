"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet2Icon, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Card } from "../ui/card";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/avatar";
import { App_Name } from "@/app/appConfig";

interface ProfileProps {
  onQuickAction?: (action: string) => void;
}

export function Profile({ onQuickAction }: ProfileProps) {
  const router = useRouter();
  const [wallet, setWallet] = useState<string | null>(null);
  const { user, logout } = useAuth();

  // 🔹 Dummy connect wallet function
  const handleConnectWallet = () => {
    // Generate a fake wallet address like "7xGf...JkPz"
    const dummyWallet = "7xGf" + Math.random().toString(36).substring(2, 6) + "...JkPz";
    setWallet(dummyWallet);
  };

  const handleLogin = () => {
    try {
      router.push("/login");
    } catch (e) {
      window.location.href = "/login";
    }
  };

  const handleBack = () => {
    if (typeof onQuickAction === "function") {
      onQuickAction("close");
      try {
        window.dispatchEvent(new CustomEvent("framp:closeProfile"));
      } catch (e) { }
      return;
    }

    if (typeof window !== "undefined") {
      try {
        if (window.history.length > 1) {
          router.back();
          return;
        }
      } catch (e) { }

      const prev = sessionStorage.getItem("framp.prevPath");
      if (prev) {
        router.push(prev);
        return;
      }

      if (document.referrer) {
        window.location.href = document.referrer;
        return;
      }
    }

    router.push("/");
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center md:justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10"
        onClick={handleBack}
      />

      {/* Modal */}
      <div className="mx-auto md:mx-0 w-full md:w-[520px] h-full md:min-h-screen bg-background p-4 relative z-20 overflow-auto border-l md:border-l-0 border-border/50">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Control Deck</h1>
          <div className="flex items-center gap-2">

            <div className="flex items-center justify-end">
              <Button
                onClick={handleConnectWallet}
                variant="outline_soft_gradient"
                size="sm"
                className={`flex items-center gap-2 px-0 md:px-0 lg:px-0 rounded-xl border border-border overflow-hidden transition-all duration-300 ease-out $ ring-1 ring-primary/20"
                  `}
               
              >
                <div className="flex-1 pl-3 text-left">
                  {wallet ? (
                    <p className="text-muted-foreground text-xs truncate mt-1 text-nowrap">
                      <span className="text-md font-semibold"><Wallet2Icon /></span> {wallet}
                    </p>
                  ) : (
                    "Connect Wallet")}
                </div>

                <div
                  onClick={handleBack}
                  className={`relative inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ease-out transform hover:scale-105 bg-gradient-to-br from-primary to-primary/80 shadow-md ring-2 ring-primary/30
                      `}
                >
                  <X
                    className={`size-4 "text-primary-foreground`}
                  />
                </div>
              </Button>
            </div>
            {/* <Button
              size="sm"
              variant="outline_soft_gradient"
              className=""
              onClick={handleConnectWallet}
            > {wallet ? (
              <p className="text-muted-foreground text-xs truncate mt-1">
                <span className="text-md font-semibold">Connected ✅:</span> {wallet}
              </p>
            ) : (
              "Connect Wallet")}
            </Button>
            <button
              onClick={handleBack}
              className="transition text-muted-foreground dark:text-foreground flex size-8 items-center justify-center rounded-lg hover:text-primary focus:outline-primary"
            >
              <X className="w-6 h-6" />
            </button> */}

          </div>
        </div>

        {/* Profile Card */}
        <Card className="mb-6 items-center md:items-start text-center md:text-start flex-col gap-3">
          {user?.id ? (
            <>
              <div className="w-full flex items-center md:items-start text-center md:text-start flex-row gap-3">
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

                {/* <div className="my-1 text-start"> */}
                <div className="text-start">
                  <h2 className="text-md font-semibold">
                    <span className="lowercase">
                      {App_Name}-{user.name || "User"}
                    </span>{" "}
                    {user.id && (
                      <span className="text-sm text-muted-foreground capitalize">
                        -ID: {user.id.slice(0, 8)}
                      </span>
                    )}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {user.email || "user@email.com"}
                  </p>
                </div>
              </div>

              {/* Wallet Display */}
              <div className="w-full flex items-center justify-end px-3">

                <Button
                  size="sm"
                  variant="outline_soft_gradient"
                  className="mt-2"
                  onClick={handleConnectWallet}
                > {wallet ? (
                  <p className="text-muted-foreground text-xs truncate mt-1">
                    <span className="text-md font-semibold">Connected ✅:</span> {wallet}
                  </p>
                ) : (
                  "Connect Wallet")}
                </Button>

              </div>
              {/* </div> */}
            </>
          ) : (
            <div className="w-full p-6 text-center">
              <p className="text-sm text-muted-foreground mb-3">No user is logged in.</p>
              <Button onClick={handleLogin} className="mx-auto">Log In</Button>
            </div>
          )}
        </Card>

        {/* My Account Section */}
        <div>
          <h3 className="text-muted-foreground mb-3 text-sm font-medium">
            My Account
          </h3>
          <div className="space-y-2">
            {/* <Button
              onClick={handleConnectWallet}
              className="w-full"
              variant="outline"
            >
              {wallet ? "Wallet Connected ✅" : "Connect Wallet"}
            </Button> */}

            <button
              onClick={() => {
                logout?.();
                if (typeof onQuickAction === "function") onQuickAction("close");
                try {
                  window.dispatchEvent(new CustomEvent("framp:closeProfile"));
                } catch (e) { }
              }}
              className="block font-medium text-red-500 hover:underline w-full text-left"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
