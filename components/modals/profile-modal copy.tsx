"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Wallet2Icon, X, Copy, Check } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { Card } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Avatar } from "@/components/ui/avatar"
import { App_Name } from "@/app/appConfig"

interface ProfileModalProps {
  onQuickAction?: (action: string) => void
}

export function ProfileModal({ onQuickAction }: ProfileModalProps) {
  const router = useRouter()
  const [wallet, setWallet] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState(false)
  const { user, logout } = useAuth()

  const handleConnectWallet = () => {
    const dummyWallet = "7xGf" + Math.random().toString(36).substring(2, 6) + "...JkPz"
    setWallet(dummyWallet)
  }

  const handleCopyId = async () => {
    if (user?.id) {
      await navigator.clipboard.writeText(user.id)
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

  const handleLogin = () => {
    try {
      router.push("/login")
    } catch (e) {
      window.location.href = "/login"
    }
  }

  const handleBack = () => {
    if (typeof onQuickAction === "function") {
      onQuickAction("close")
      try {
        window.dispatchEvent(new CustomEvent("framp:closeProfile"))
      } catch (e) {}
      return
    }

    if (typeof window !== "undefined") {
      try {
        if (window.history.length > 1) {
          router.back()
          return
        }
      } catch (e) {}

      const prev = sessionStorage.getItem("framp.prevPath")
      if (prev) {
        router.push(prev)
        return
      }

      if (document.referrer) {
        window.location.href = document.referrer
        return
      }
    }

    router.push("/")
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center md:justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm z-10" onClick={handleBack} />

      {/* Modal */}
      <div className="mx-auto md:mx-0 w-full md:w-[520px] h-full md:min-h-screen bg-background px-2 sm:px-4 py-3 relative z-20 overflow-auto border-l md:border-l-0 border-border/50">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Control Deck</h1>
          <div className="flex items-center gap-3">
            {/* Connect Wallet Button */}
            <Button
              onClick={handleConnectWallet}
              variant="outline_soft_gradient"
              size="sm"
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border transition-all duration-300 ease-out ring-1 ring-primary/20 hover:ring-primary/40"
            >
              {wallet ? (
                <div className="flex items-center gap-2">
                  <Wallet2Icon className="size-4 text-primary" />
                  <p className="text-muted-foreground text-xs whitespace-nowrap">{wallet}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Wallet2Icon className="size-4" />
                  <span className="text-sm">Connect Wallet</span>
                </div>
              )}
            </Button>

            {/* Close Button */}
            <button
              onClick={handleBack}
              className="transition text-muted-foreground dark:text-foreground flex size-8 items-center justify-center rounded-lg hover:text-primary focus:outline-primary"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <Card className="mb-6 p-4">
          {user?.id ? (
            <>
              {/* User Header */}
              <div className="w-full flex items-start gap-3 mb-4">
                <Avatar className="size-10 flex-shrink-0">
                  <Button
                    variant="ghost"
                    className={`relative inline-flex items-center justify-center w-10 h-10 overflow-hidden rounded-full transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 bg-gradient-to-br shadow-lg ring-2 ring-primary/30`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    <svg
                      className={`w-6 h-6 transition-colors duration-300 text-primary hover:text-primary/80`}
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

                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold text-foreground truncate">{user.name || "User"}</h2>
                  <p className="text-xs text-muted-foreground truncate">{user.email || "user@email.com"}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">{App_Name}</p>
                </div>
              </div>

              <div className="w-full mb-4 p-3 bg-muted/30 rounded-lg border border-border/50">
                <p className="text-xs text-muted-foreground mb-2">User ID</p>
                <button
                  onClick={handleCopyId}
                  className="w-full flex items-center justify-between p-2 rounded-md hover:bg-muted/50 transition-colors group"
                >
                  <code className="text-xs font-mono text-foreground/70 break-all text-start flex-1">{user.id}</code>
                  <div className="ml-2 flex-shrink-0">
                    {copiedId ? (
                      <Check className="size-4 text-green-500" />
                    ) : (
                      <Copy className="size-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    )}
                  </div>
                </button>
              </div>

              {/* Logout Button */}
              <div className="w-full flex items-center justify-end">
                <Button
                  onClick={() => {
                    logout?.()
                    if (typeof onQuickAction === "function") onQuickAction("close")
                    try {
                      window.dispatchEvent(new CustomEvent("framp:closeProfile"))
                    } catch (e) {}
                  }}
                  size="sm"
                  variant="outline_soft_gradient"
                  className="font-medium text-red-500 hover:underline text-xs"
                >
                  Log Out
                </Button>
              </div>
            </>
          ) : (
            <div className="w-full p-3 text-center">
              <p className="text-xs text-muted-foreground mb-2">No user is logged in.</p>
              <Button onClick={handleLogin} size="sm" className="mx-auto">
                Log In
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
