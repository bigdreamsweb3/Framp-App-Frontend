"use client"

import { useState, useEffect } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { Bot } from "lucide-react"
import Image from "next/image"
import { app_logo } from "@/asssets/image"
import { App_Name } from "@/app/appConfig"

interface AppHeaderProps {
  onAuthClick?: () => void
  chatActive?: boolean
  onChatToggle?: () => void
}

export function AppHeader({ onAuthClick, chatActive, onChatToggle }: AppHeaderProps) {
  const [showLogoText, setShowLogoText] = useState(true)
  const [scrolled, setScrolled] = useState(false)

  const toggleLogoText = () => setShowLogoText(!showLogoText)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10) // trigger shadow when scrolled past 10px
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b dark:border-gray-900 border-white/10 bg-gradient-to-r from-background/60 via-background/40 to-background/60 backdrop-blur-xl supports-[backdrop-filter]:backdrop-saturate-150 transition-shadow duration-300
        ${scrolled ? "shadow-[0_2px_10px_rgba(0,0,0,0.12)]" : "shadow-none"}`}
      data-tour="security"
    >
      <div className="flex items-center">
        {/* Logo */}
        <div className="relative group">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/30 to-primary/5 blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
          <Image
            src={app_logo}
            alt="App Logo"
            className="relative w-[max(2.5rem,5vh)] h-full md:h-10 object-contain rounded-r-2xl"
          />
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-[max(1rem,2vw)] h-[max(1.5rem,7vh)] flex items-center justify-between ml-3 pl-0">
          {/* AI Toggle */}
          <motion.div
            className="flex items-center gap-[max(0.75rem,1vw)]"
            whileTap={{ scale: 0.97 }}
            onClick={toggleLogoText}
            role="button"
            tabIndex={0}
            aria-label="Toggle logo display"
            onKeyDown={(e) => e.key === "Enter" && toggleLogoText()}
          >
            {showLogoText && (
              <motion.span
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.4 }}
                className="hidden md:inline-flex text-lg font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent"
              >
                {App_Name}
              </motion.span>
            )}

            {/* AI Button */}
            <Button
              variant={chatActive ? "default" : "ghost"}
              size="sm"
              onClick={onChatToggle}
              className="flex items-center justify-center h-9 w-14 rounded-xl p-0 shadow-inner hover:shadow-lg hover:scale-105 transition-all bg-white/10 backdrop-blur-md"
              data-tour="chat-button"
              aria-pressed={chatActive}
            >
              <Bot className="h-5 w-5 text-primary" />
              <span className="ml-1 text-[0.7rem] font-medium">AI</span>
            </Button>
          </motion.div>

          {/* Right Actions */}
          <div className="flex items-center gap-[max(0.75rem,1.5vw)]">
            <ThemeToggle />

            <button
              onClick={onAuthClick}
              className="inline-flex items-center justify-center h-[max(2rem,4vh)] md:h-9 px-[max(0.75rem,1.5vw)] md:px-4 py-[max(0.5rem,1vh)] md:py-2 bg-muted text-primary dark:text-primary-foreground rounded-xl font-semibold text-[max(0.85rem,1.6vw)] md:text-sm hover:bg-primary/90 focus-visible:ring-[max(0.15rem,0.3vw)] md:focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring outline-none transition-all disabled:opacity-50 disabled:pointer-events-none"
              aria-label="Log in or sign up"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
