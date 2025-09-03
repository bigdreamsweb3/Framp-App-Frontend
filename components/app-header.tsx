"use client"

import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { MessageCircle, Bot } from "lucide-react"
import Image from "next/image"
import { app_logo } from "@/asssets/image"

interface AppHeaderProps {
  onAuthClick?: () => void
  chatActive?: boolean
  onChatToggle?: () => void
}

export function AppHeader({ onAuthClick, chatActive, onChatToggle }: AppHeaderProps) {
  const [showLogoText, setShowLogoText] = useState(true)

  const toggleLogoText = () => {
    setShowLogoText(!showLogoText)
  }

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md"
      data-tour="security"
    >
      <div className="container mx-auto px-[max(1rem,2vw)] h-[max(3.5rem,7vh)] flex items-center justify-between">
        {/* Logo Section */}
        <motion.div
          className="flex items-center gap-[max(0.5rem,1vw)] "
          whileTap={{ scale: 0.98 }}
          onClick={toggleLogoText}
          role="button"
          tabIndex={0}
          aria-label="Toggle logo display"
          onKeyDown={(e) => e.key === "Enter" && toggleLogoText()}
        >
          <div >
            <Image src={app_logo} alt="App Logo" className="w-[max(2rem,4.5vh)] h-[max(2rem,4vh)] md:h-9 bg-primary rounded-lg flex items-center justify-center" />
          </div>
          <div className="ml-[max(0.5rem,1vw)] flex items-center gap-2 bg-muted/100 rounded-xl hover:bg-muted/60 transition-colors duration-300">
            <Button
              variant={chatActive ? "default" : "ghost"}
              size="sm"
              onClick={onChatToggle}
              className="flex items-center justify-center h-8 w-12 rounded-2xl p-0"
              data-tour="chat-button"
              aria-pressed={chatActive}
            >
              <Bot className="h-5 w-5" /> <span className="text-[0.7rem]">AI</span>
            </Button>
          </div>
        </motion.div>

        {/* Actions */}
        <div className="flex items-center gap-[max(0.75rem,1.5vw)]">
          <ThemeToggle />
          <button
            onClick={onAuthClick}
            className="inline-flex items-center justify-center h-[max(2rem,4vh)] md:h-9 px-[max(0.75rem,1.5vw)] md:px-4 py-[max(0.5rem,1vh)] md:py-2 bg-muted/100 text-primary-foreground rounded-xl font-semibold text-[max(0.85rem,1.6vw)] md:text-sm hover:bg-primary/90 focus-visible:ring-[max(0.15rem,0.3vw)] md:focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring outline-none transition-all disabled:opacity-50 disabled:pointer-events-none shadow-sm"
            aria-label="Log in or sign up"
          >
            Sign in
          </button>
        </div>
      </div>
    </header>
  )
}