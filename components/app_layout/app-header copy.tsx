"use client";

import { useState, useEffect } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/button";
import Image from "next/image";
import { app_logo } from "@/asssets/image";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { HelpCircle, Menu, X } from "lucide-react";

interface AppHeaderProps {
  onAuthClick?: () => void;
  chatActive?: boolean;
  onChatToggle?: () => void;
  profileActive?: boolean;
  onProfileToggle?: () => void;
}

export function AppHeader({
  onAuthClick,
  profileActive,
  onProfileToggle,
}: AppHeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-border/20 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-lg transition-all duration-500 ease-out h-14
      ${scrolled ? "shadow-md" : "shadow-sm"}`}
    >
      <div className="w-full h-full px-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-primary/30 to-primary/5 blur-md opacity-50" />
            <Image
              src={app_logo}
              alt="App Logo"
              className="relative w-[max(2.5rem,5vh)] h-auto object-contain rounded-r-2xl"
            />
          </div>
          <span className="text-[0.55rem] font-bold px-1 py-2 text-muted-foreground transform -rotate-90 origin-center ml-0">
            BETA
          </span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="https://wa.me/2348012345678?text=Hello%20I%20need%20help%20with%20my%20on-ramp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors duration-200"
          >
            <span className="flex items-center gap-1">
              <HelpCircle size={18} /> Help
            </span>
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {!user ? (
            <Button
              onClick={onAuthClick}
              size="sm"
              className="h-8 px-4 rounded-xl text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              Sign in
            </Button>
          ) : (
            <Button
              variant="ghost"
              aria-pressed={profileActive}
              onClick={onProfileToggle}
              className={`relative w-8 h-8 md:w-10 md:h-10 rounded-full transition ${
                profileActive
                  ? "bg-gradient-to-br from-primary to-primary/80 ring-2 ring-primary/30"
                  : "bg-gradient-to-br from-primary/20 to-primary/10 hover:from-primary/30 hover:to-primary/20"
              }`}
            >
              {/* Simple user icon */}
              <svg
                className={`w-6 h-6 md:w-8 md:h-8 ${
                  profileActive ? "text-white" : "text-primary"
                }`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            </Button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileOpen((p) => !p)}
            className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
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
