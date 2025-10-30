
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

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background backdrop-blur-sm sm:hidden">
      <div className="mb-[env(safe-area-inset-bottom)] flex h-14 items-center text-sm">
        <div className="grid size-full grid-cols-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex h-full select-none flex-col items-center justify-center gap-0.5 whitespace-nowrap px-1 duration-100 transition ${
                  isActive
                    ? "text-primary font-bold text-base"
                    : "text-muted-foreground font-medium text-sm hover:text-primary"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "text-primary" : ""}`} />
                <span className="w-full text-center">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
