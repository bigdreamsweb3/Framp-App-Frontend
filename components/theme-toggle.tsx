"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative flex items-center justify-center w-9 h-9 rounded-2xl border border-border bg-muted/50 backdrop-blur-sm hover:bg-card/50 transition-all duration-300 hover:shadow-[0_0_8px_rgba(var(--primary-rgb),0.25)] group"
          aria-label="Toggle theme"
        >
          {/* Animated icons */}
          <Sun
            className="h-[1.3rem] w-[1.3rem] rotate-0 scale-100 transition-all duration-500 ease-out dark:-rotate-90 dark:scale-0 text-foreground/90"
          />
          <Moon
            className="absolute h-[1.3rem] w-[1.3rem] rotate-90 scale-0 transition-all duration-500 ease-out dark:rotate-0 dark:scale-100 text-foreground/90"
          />

          {/* Glow ring on hover */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none shadow-[0_0_12px_rgba(var(--primary-rgb),0.25)]" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="rounded-xl border border-border bg-card/70 backdrop-blur-md shadow-lg"
      >
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 ${
            theme === "light" ? "bg-primary/10 text-primary font-semibold" : ""
          }`}
        >
          <Sun className="h-5 w-5" />
          <span>Light</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 ${
            theme === "dark" ? "bg-primary/10 text-primary font-semibold" : ""
          }`}
        >
          <Moon className="h-5 w-5" />
          <span>Dark</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-200 ${
            theme === "system" ? "bg-primary/10 text-primary font-semibold" : ""
          }`}
        >
          <Monitor className="h-5 w-5" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
