"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Home, Activity, Wallet } from "lucide-react" // lucide icons

interface NavbarProps {
  activeView: string
  onChangeView: (view: string) => void
}

const navItems = [
  { icon: Home, label: "Home", view: "onramp" },
  { icon: Activity, label: "Activity", view: "activity" },
  { icon: Wallet, label: "Wallet", view: "wallet" },
]

const BottomNavbar = ({ activeView, onChangeView }: NavbarProps) => {
  const pathname = usePathname()
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) return null // prevent hydration mismatch

  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-background border-t border-border px-0 py-2 transition-colors z-50">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const active = activeView === item.view
          const Icon = item.icon
          return (
            <button
              key={item.label}
              onClick={() => onChangeView(item.view)}
              aria-pressed={active}
              className={`flex flex-col items-center justify-center gap-1 w-full py-1 transition-all 
                ${active ? "text-primary" : "text-muted-foreground hover:text-foreground/80"}`}
            >
              <Icon
                className={`h-6 w-6 transition-colors 
                  ${active ? "text-primary" : "text-muted-foreground"}`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={`text-xs font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground"
                  }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

export default BottomNavbar
