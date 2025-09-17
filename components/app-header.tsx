"use client"

import { useState, useEffect } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { Bot } from "lucide-react"
import Image from "next/image"
import { app_logo } from "@/asssets/image"
import { App_Name } from "@/app/appConfig"
import { useAuth } from "@/context/AuthContext"
// import { DynamicConnectButton, DynamicWidget } from "@dynamic-labs/sdk-react-core"

interface AppHeaderProps {
  onAuthClick?: () => void
  chatActive?: boolean
  onChatToggle?: () => void
}

export function AppHeader({ onAuthClick, chatActive, onChatToggle }: AppHeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  const { user, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl transition-all duration-300 ease-out
        ${scrolled ? "shadow-lg py-0 h-14" : "shadow-sm py-1 h-14"}`}
      data-tour="security"
    >
      <div className="container mx-auto h-full px-4 pl-0 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/30 to-primary/5 blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
            <Image
              src={app_logo}
              alt="App Logo"
              className="relative w-[max(2.5rem,5vh)] h-auto object-contain rounded-r-2xl"
            />
          </div>
          <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.4 }}
            className="hidden md:inline-flex text-lg font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent"
          >
            {App_Name}
          </motion.span>

          {/* Vertical Beta Badge - positioned beside logo */}
          <span className="text-[0.55rem] font-bold px-1 py-2 ext-muted-foreground transform -rotate-0 origin-center  ml-0">
            BETA
          </span>
        </div>


        {/* Navigation and Actions */}
        <div className="flex items-center gap-4">
          {/* AI Toggle Button */}
          <Button
            variant={chatActive ? "default" : "outline"}
            size="sm"
            onClick={onChatToggle}
            className="flex items-center gap-1.5 h-9 rounded-xl transition-all duration-200 hover:shadow-md"
            data-tour="chat-button"
            aria-pressed={chatActive}
          >
            <Bot className="h-4 w-4" />
            <span className="text-xs font-medium">AI</span>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />



          {!user ? (
            <>
              <Button
                onClick={onAuthClick}
                variant="default"
                size="sm"
                className="h-9 px-4 rounded-xl font-medium text-sm bg-primary hover:bg-primary/90 transition-colors"
                aria-label="Log in or sign up"
              >
                Sign in
              </Button>
            </>
          ) : (
            <>
              {/* <p className="mb-4">Welcome back, {user.email}!</p> */}
              <Button
                onClick={logout}
                size="sm"
                className="h-9 px-4 rounded-xl font-medium text-sm bg- hover:bg-primary/90 transition-colors"
              >
                Logout
              </Button>
            </>
          )}


          {/* <DynamicConnectButton>{<Button
            // onClick={onAuthClick}
            variant="default"
            size="sm"
            className="h-9 px-4 rounded-xl font-medium text-sm bg-primary hover:bg-primary/90 transition-colors"
            aria-label="Log in or sign up"
          >
            Sign in
          </Button>}</DynamicConnectButton> */}
          {/* 
          <DynamicWidget
            innerButtonComponent={<> <Button
              // onClick={onAuthClick}
              variant="default"
              size="sm"
              className="h-9 px-4 rounded-xl font-medium text-sm bg-primary hover:bg-primary/90 transition-colors"
              aria-label="Log in or sign up"
            >
              Sign in
            </Button></>}
          /> */}

          {/* Sign In Button */}
          {/* <Button
            onClick={onAuthClick}
            variant="default"
            size="sm"
            className="h-9 px-4 rounded-xl font-medium text-sm bg-primary hover:bg-primary/90 transition-colors"
            aria-label="Log in or sign up"
          >
            Sign in
          </Button> */}
        </div>
      </div>
    </header>
  )
}