"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy, Wallet, X, User } from "lucide-react"
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

  if (!user && !wallet) return null

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-2">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleBack} />

      {/* Modal */}
      <div className="relative w-full max-w-sm mx-auto bg-card border border-border rounded-xl shadow-xl animate-in fade-in-0 zoom-in-95 duration-200 sm:max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-medium text-foreground">Profile</h2>
          <Button variant="ghost" size="sm" onClick={handleBack} className="h-7 w-7 p-0">
            <X className="h-3 w-3" />
          </Button>
        </div>

        {/* Profile Section */}
        <div className="p-4 space-y-4">
          {user?.id ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    <User className="h-6 w-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {App_Name}-{user.name || "User"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user.email || "user@email.com"}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                <span className="text-xs text-muted-foreground flex-shrink-0">ID:</span>
                <button
                  onClick={handleCopyId}
                  className="flex items-center gap-1 flex-1 text-left p-0 hover:bg-muted/30 rounded-md transition-colors"
                >
                  <code className="text-xs font-mono text-foreground/70 truncate">{user.id.slice(0, 8)}...</code>
                  {copiedId ? (
                    <Check className="h-3 w-3 text-green-500 ml-1" />
                  ) : (
                    <Copy className="h-3 w-3 text-muted-foreground ml-1" />
                  )}
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  logout?.()
                  handleBack()
                }}
                className="w-full"
              >
                Log Out
              </Button>
            </div>
          ) : (
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">Please log in to view your profile.</p>
              <Button onClick={handleLogin} size="sm" className="w-full">
                Log In
              </Button>
            </div>
          )}
        </div>

        {/* Wallet Section */}
        <div className="p-4 pt-0 space-y-3 border-t border-border">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Wallet</h3>
          {wallet ? (
            <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
              <Wallet className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <code className="text-xs font-mono text-foreground/70 truncate flex-1">{wallet}</code>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleConnectWallet}
              variant="outline"
              size="sm"
              className="w-full justify-start gap-2"
            >
              <Wallet className="h-4 w-4" />
              Connect Wallet
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}