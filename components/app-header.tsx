"use client";

import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Bot, User, LogOut, Wallet, History } from "lucide-react";
import Image from "next/image";
import { app_logo } from "@/asssets/image";
import { App_Name } from "@/app/appConfig";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";

interface AppHeaderProps {
  onAuthClick?: () => void
  chatActive?: boolean
  onChatToggle?: () => void
  profileActive?: boolean
  onProfileToggle?: () => void
  // onProfileClick?: () => void
}

export function AppHeader({ onAuthClick, chatActive, onChatToggle, profileActive, onProfileToggle }: AppHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 ease-out
        ${scrolled ? "shadow-md py-0 h-14" : "shadow-sm py-0 h-14"}`}
      data-tour="security"
    >

      <div className="w-full h-full pl-0 pr-4 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-3 h-full">
          <div className="flex items-center gap-0 h-full">
            <Link href="/" className="flex items-center gap-2 h-full" aria-label="Home">
              <div className="relative flex items-center h-full w-[max(2.5rem,5vh)]">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/30 to-primary/5 blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
                <Image
                  src={app_logo}
                  alt="App Logo"
                  fill
                  className="absolute inset-0 rounded-r-2xl object-cover"
                />
              </div>
            </Link>
            {/* Vertical Beta Badge - positioned beside logo */}
            <span className="text-[0.55rem] font-bold px-1 py-2 text-muted-foreground transform -rotate-90 origin-center ml-0">
              BETA
            </span>
          </div>
        </div>


        {/* Navigation and Actions */}
        <div className="flex items-center gap-3">
          {/* AI Toggle Button */}
          {/* {onChatToggle && (
            <Button
              variant={chatActive ? "default" : "outline"}
              size="sm"
              onClick={onChatToggle}
              className="flex items-center gap-1.5 h-8 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all duration-200"
              aria-pressed={chatActive}
              aria-label={chatActive ? "Hide AI chat" : "Show AI chat"}
            >
              <Bot className="h-4 w-4" />
              <span className="text-xs font-medium hidden sm:inline">AI</span>
            </Button>
          )} */}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Actions */}
          {!user ? (


            <Button
              onClick={onAuthClick}
              variant="default"
              size="sm"
              className="h-8 px-4 rounded-xl font-medium text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
              aria-label="Sign in or sign up"
            >
              Sign in
            </Button>
          ) : (

            <Button
              variant="ghost"
              className="relative h-8 w-8 rounded-full"
              aria-pressed={profileActive}
              aria-label={profileActive ? "Hide Profile" : "Show Profile"}
              onClick={onProfileToggle}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={user?.name || user?.name || "User"} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase() || user?.name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>

          )}
        </div>
      </div>
    </header>
  );
}