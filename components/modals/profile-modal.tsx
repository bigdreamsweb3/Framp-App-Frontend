"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy, LayoutDashboard, User, Wallet, X } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
      } catch (e) { }
      return
    }

    if (typeof window !== "undefined") {
      try {
        if (window.history.length > 1) {
          router.back()
          return
        }
      } catch (e) { }

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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10" onClick={handleBack} />

      {/* Modal */}
      <div className="mx-auto md:mx-0 w-full md:w-[520px] h-full md:min-h-screen bg-background py-3 relative z-20 overflow-auto border-l md:border-l-0 border-border/50">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between px-2 sm:px-4 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl">
              <LayoutDashboard className="w-8 h-8 text-primary" />
            </span>
            {/* <h2 className="text-lg font-medium text-foreground">Control Deck</h2> */}
          </div>

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
                  <Wallet className="size-4 text-primary" />
                  <p className="text-muted-foreground text-xs whitespace-nowrap">{wallet}</p>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Wallet className="size-4" />
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


        {/* Profile Section */}
        <div className="space-y-6 px-2 sm:px-4">
          {user?.id ? (
            <div className="space-y-4">
              {/* Profile */}
              <div className="flex flex-col gap-3 p-3 bg-muted/50 rounded-xl border border-border/50">

                <div className="flex items-center gap-3 border-b pb-2">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <User className="h-6 w-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {user.name || `${App_Name}-User`}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{user.email || "user@email.com"}</p>
                  </div>
                </div>

                {/* User ID */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex-shrink-0">User ID</span>
                  <button
                    onClick={handleCopyId}
                    className="flex items-center gap-2 bg-background rounded-lg px-2 py-1 hover:bg-muted transition-colors"
                  >
                    <code className="text-xs font-mono text-foreground/80">{user.id.slice(0, 8)}...</code>
                    {copiedId ? (
                      <Check className="h-3 w-3 text-green-500" />
                    ) : (
                      <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    )}
                  </button>
                </div>
              </div>

              {/* Logout Button fixed at bottom */}
              {user?.id && (
                <div className="absolute bottom-0 left-0 w-full bg-background/90 backdrop-blur-sm border-t border-border p-4">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      logout?.()
                      handleBack()
                    }}
                    className="rounded-xl"
                  >
                    Log Out
                  </Button>
                </div>
              )}

            </div>
          ) : (
            <div className="text-center space-y-4 p-4">
              <Avatar className="w-20 h-20 mx-auto">
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <User className="h-10 w-10" />
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Please log in to access your profile.</p>
                <Button onClick={handleLogin} size="sm" className="w-full rounded-xl">
                  Log In
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}