"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check, Copy, Settings, User, Wallet, X } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { App_Name } from "@/app/appConfig"
import { useConnectedWallet } from "@/lib/hooks/useConnectedWallet"

interface ProfileModalProps {
  onQuickAction?: (action: string) => void
}

export function ProfileModal({ onQuickAction }: ProfileModalProps) {
  const router = useRouter()
  const [copiedId, setCopiedId] = useState(false)
  const { user, logout } = useAuth()
  const { solanaAddress, connectWallet, formatAddress } = useConnectedWallet()

  // This state controls the mount + animation
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Trigger entrance animation immediately after mount
    const timer = setTimeout(() => setIsMounted(true), 10)
    return () => clearTimeout(timer)
  }, [])

  const handleCopyId = async () => {
    if (user?.id) {
      await navigator.clipboard.writeText(user.id)
      setCopiedId(true)
      setTimeout(() => setCopiedId(false), 2000)
    }
  }

  const handleBack = () => {
    // Trigger exit animation before actually closing
    setIsMounted(false)
    setTimeout(() => {
      if (typeof onQuickAction === "function") {
        onQuickAction("close")
        window.dispatchEvent(new CustomEvent("framp:closeProfile"))
        return
      }
      // ... rest of your navigation logic
      // (keep your existing handleBack logic here, just delayed)
      const navigate = () => {
        // your existing navigation code...
        if (typeof window !== "undefined") {
          try {
            if (window.history.length > 1) return router.back()
          } catch (e) {}
          const prev = sessionStorage.getItem("framp.prevPath")
          if (prev) return router.push(prev)
          if (document.referrer) return (window.location.href = document.referrer)
        }
        router.push("/")
      }
      navigate()
    }, 300) // match this with transition duration below
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center md:justify-end overflow-hidden">
      {/* Backdrop with fade */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
          isMounted ? "opacity-50" : "opacity-0"
        }`}
        onClick={handleBack}
      />

      {/* Modal Panel with slide-in */}
      <div
        className={`absolute inset-y-0 right-0 w-full md:w-[520px] bg-background flex flex-col transition-all duration-200 ease-out transform-gpu ${
          isMounted
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0 md:translate-x-full"
        }`}
      >
        <div className="flex-1 overflow-y-auto py-3">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between px-4 pb-3 border-b border-border">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl">
                <Settings className="w-8 h-8 text-primary" />
              </span>
              <h2 className="text-lg font-medium text-foreground">Hub</h2>
            </div>

            <div className="flex items-center gap-3">
              <Button
                onClick={connectWallet}
                variant="outline_soft_gradient"
                size="sm"
                className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border transition-all"
              >
                <Wallet className="size-4" />
                <span className="text-sm">
                  {solanaAddress ? formatAddress(solanaAddress) : "Connect Wallet"}
                </span>
              </Button>

              <button
                onClick={handleBack}
                className="flex size-8 items-center justify-center rounded-lg hover:text-primary transition text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="space-y-6 px-4">
            {user?.id ? (
              <div className="space-y-4">
                <div className="flex flex-col gap-3 p-3 bg-muted rounded-xl border border-border">
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
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email || "user@email.com"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      User ID
                    </span>
                    <button
                      onClick={handleCopyId}
                      className="flex items-center gap-2 bg-background rounded-lg px-2 py-1 hover:bg-muted transition-colors"
                    >
                      <code className="text-xs font-mono text-foreground/80">
                        {user.id.slice(0, 8)}...
                      </code>
                      {copiedId ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-4 p-8">
                <Avatar className="w-20 h-20 mx-auto">
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Please log in to access your profile.
                  </p>
                  <Button onClick={() => router.push("/login")} size="sm" className="w-full rounded-xl">
                    Log In
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Logout fixed at bottom */}
        {user?.id && (
          <div className="border-t border-border bg-background/90 backdrop-blur-sm p-4">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                logout?.()
                handleBack()
              }}
              className="w-full rounded-xl"
            >
              Log Out
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}