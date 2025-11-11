"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowUpCircle, QrCode, WalletIcon, ActivityIcon } from "lucide-react"

const navItems = [
  { href: "/", label: "Gate", icon: ArrowUpCircle },
  { href: "/bills", label: "Bills", icon: QrCode },
  { href: "/wallets", label: "Wallets", icon: WalletIcon },
  { href: "/activity", label: "Activity", icon: ActivityIcon },
]

export function BottomNav() {
  const pathname = usePathname()
  const activeIndex = navItems.findIndex((item) => pathname === item.href)

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-sidebar border-t border-border/50 sm:hidden">
      <div className="relative mb-[env(safe-area-inset-bottom)] flex h-14 items-center justify-center text-sm mt-1">

        {/* === Navigation links === */}
        <div className="grid w-full grid-cols-4 relative z-10">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex h-full flex-col items-center justify-center gap-0.5 select-none transition-all duration-200 
                  ${isActive ? "text-foreground font-semibold" : "text-muted-foreground hover:text-primary"}`}
              >
                {/* === Icon wrapper with background only on active icon === */}
                <div
                  className={`w-3/5 flex items-center justify-center py-1 rounded-lg transition-all duration-200 ${isActive
                    ? "bg-gradient-to-r from-primary/15 to-primary/10 text-foreground/90 dark:text-foreground"
                    : "text-muted-foreground"
                    }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                {/* === Label text === */}
                <span
                  className={`text-sm font-medium ${isActive ? "text-foreground" : "text-muted-foreground"
                    }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
