"use client";

import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/button";

import Image from "next/image";
import { app_logo } from "@/asssets/image";

import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

import Link from "next/link";
import { HelpCircle, Menu, User, X } from "lucide-react";

interface AppHeaderProps {
  onAuthClick?: () => void;
  chatActive?: boolean;
  onChatToggle?: () => void;
  profileActive?: boolean;
  onProfileToggle?: () => void;
  // onProfileClick?: () => void
}

export function AppHeader({
  onAuthClick,
  chatActive,
  onChatToggle,
  profileActive,
  onProfileToggle,
}: AppHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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
      className={`sticky top-0 z-50 w-full border-b border-border/20 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-lg transition-all duration-500 ease-out h-14
        ${scrolled ? "shadow-md" : "shadow-sm"}`}
      data-tour="security"
    >
      <div className="w-full h-full pl-0 pr-4 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-0">
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

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>


        <div className="flex items-center gap-4">
          {/* Desktop Navigation and Actions */}
          <nav className="hidden md:flex items-center gap-6">
            {/* <Link
              href="/features"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200"
            >
              Features
            </Link> */}
            {/* <Link
              href="/pricing"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200"
            >
              Pricing
            </Link> */}
            {/* <Link
              href="/about"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200"
            >
              About
            </Link> */}

            <Link
              href="https://wa.me/2348012345678?text=Hello%20I%20need%20help%20with%20my%20on-ramp"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200"
            >
              <span className="flex items-center gap-0.5">
                <HelpCircle size={18} />
                Help</span>
            </Link>
          </nav>

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
              aria-pressed={profileActive}
              aria-label={profileActive ? "Hide Profile" : "Show Profile"}
              onClick={onProfileToggle}
              className={`relative inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 overflow-hidden rounded-full transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 ${profileActive
                ? "bg-gradient-to-br from-primary to-primary/80 shadow-lg ring-2 ring-primary/30"
                : "bg-gradient-to-br from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20 hover:shadow-md border border-primary/20 hover:border-primary/40"
                }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300" />
              <svg
                className={`relative w-6 h-6 md:w-8 md:h-8 transition-colors duration-300 ${profileActive
                  ? "text-white"
                  : "text-primary hover:text-primary/80"
                  }`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              {profileActive && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background"
                />
              )}
            </Button>
          )}


        </div>
      </div>

      {/* Mobile Nav Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden bg-background border-t border-border/20 px-4 py-3 flex flex-col gap-3"
          >
            <Link
              href="https://wa.me/2348012345678?text=Hello%20I%20need%20help%20with%20my%20on-ramp"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-foreground"
              onClick={() => setMobileOpen(false)}
            >
              <HelpCircle size={18} />
              Help
            </Link>
            {!user && (
              <Button
                onClick={() => {
                  setMobileOpen(false);
                  onAuthClick?.();
                }}
                size="sm"
                className="w-full bg-gradient-to-r from-primary to-primary/80"
              >
                Sign in
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
