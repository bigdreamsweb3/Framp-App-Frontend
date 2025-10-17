"use client"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative inline-flex h-6 w-11 my-auto items-center rounded-full bg-gradient-to-br from-primary/20 to-primary/10 transition-colors focus:outline-none"
      aria-label="Toggle theme"
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full transition-transform ${theme === "dark" ? "translate-x-6" : "translate-x-1"
          }`}
      />
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 dark:-rotate-90 dark:scale-0 absolute left-1 text-primary opacity-100 transition-opacity dark:opacity-0 px-0.5 bg-card rounded-full" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 dark:rotate-0 dark:scale-100 right-1 text-primary-foreground opacity-0 transition-opacity dark:opacity-100 px-0.5 bg-card rounded-full" />
    </button>
  )
}
