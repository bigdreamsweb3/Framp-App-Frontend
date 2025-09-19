"use client"

import { useState, useEffect } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { motion } from "framer-motion"
import { Button } from "./ui/button"
import { Bot, User, LogOut } from "lucide-react"
import Image from "next/image"
import { app_logo } from "@/asssets/image"
import { App_Name } from "@/app/appConfig"
import { useAuth } from "@/context/AuthContext"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
// import { DynamicConnectButton, DynamicWidget } from "@dynamic-labs/sdk-react-core"

interface AppHeaderProps {
  onAuthClick?: () => void
  chatActive?: boolean
  onChatToggle?: () => void
  onProfileClick?: () => void
}

export function AppHeader({ onAuthClick, chatActive, onChatToggle, onProfileClick }: AppHeaderProps) {
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
      className={`sticky top-0 z-50 w-full border-b border-border/40 bg-background/90 backdrop-blur-md transition-all duration-300 ease-out
        ${scrolled ? "shadow-lg py-0 h-14" : "shadow-sm py-1 h-14"}`}
      data-tour="security"
    >
      <div className="w-full h-full pl-0 pr-4 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-0">
            <div className="relative flex items-center">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/30 to-primary/5 blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
              <Image
                src={app_logo}
                alt="App Logo"
                className="relative w-[max(2.5rem,5vh)] h-auto object-contain rounded-r-2xl"
              />
            </div>
            {/* Vertical Beta Badge - positioned beside logo */}
            <span className="text-[0.55rem] font-bold px-1 py-2 text-muted-foreground transform -rotate-90 origin-center  ml-0">
              BETA
            </span>
          </div>
          {/* <motion.span
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -6 }}
            transition={{ duration: 0.4 }}
            className="hidden md:inline-flex text-lg font-bold bg-gradient-to-r from-primary to-primary-foreground bg-clip-text text-transparent"
          >
            {App_Name}
          </motion.span> */}
        </div>




        {/* Navigation and Actions */}
        <div className="flex items-center gap-4">
          {/* AI Toggle Button */}
          {/* <Button
            variant={chatActive ? "default" : "outline"}
            size="sm"
            onClick={onChatToggle}
            className="flex items-center gap-1.5 h-9 rounded-xl transition-all duration-200 hover:shadow-md"
            data-tour="chat-button"
            aria-pressed={chatActive}
          >
            <Bot className="h-4 w-4" />
            <span className="text-xs font-medium">AI</span>
          </Button> */}

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
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                    aria-label="User menu"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={(user as any)?.user.user?.name || (user as any)?.email || "User"} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                        {(user as any)?.user?.name ? (user as any).user.name.charAt(0).toUpperCase() : (user as any)?.user?.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{(user as any)?.user?.name || (user as any)?.name || "User"}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {(user as any)?.user?.email || (user as any)?.email || "No email"}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onProfileClick} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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