"use client"

import { useState, useEffect, useRef } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "../ui/button"
import Image from "next/image"
import { app_logo } from "@/asssets/image"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import {
  HelpCircle,
  Menu,
  User,
  X,
  ActivityIcon,
  BookOpen,
  ArrowUpCircle,
  QrCode,
  Wallet2Icon,
  Wallet,
} from "lucide-react"

interface AppHeaderProps {
  onAuthClick?: () => void
  chatActive?: boolean
  onChatToggle?: () => void
  profileActive?: boolean
  onProfileToggle?: () => void
}

export function AppHeader({
  onAuthClick,
  chatActive,
  onChatToggle,
  profileActive,
  onProfileToggle,
}: AppHeaderProps) {
  const router = useRouter()
  const pathname = usePathname() || ""
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const { user, loading } = useAuth()

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY || document.documentElement.scrollTop
      setScrolled(scrollPosition > 10)
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when route/path changes
  useEffect(() => {
    if (mobileOpen) setMobileOpen(false)
  }, [pathname])

  return (
    <>
      {/* MAIN HEADER */}
      <header
        ref={headerRef}
        className={`sticky top-0 z-[100] w-full h-14 transition-all duration-500 ease-out
          ${scrolled || mobileOpen ? "" : "bg-transparent"}
          ${scrolled ? "border-b border-border/40 bg-sidebar" : ""}`}
      >
        <div className="w-full h-full pr-4 flex items-center justify-between">
          {/* Left side - Logo and menu button */}
          <div onClick={() => setMobileOpen((p) => !p)} className="flex items-center gap-0">
            <div className="flex items-center md:hidden w-fit">
              <span className="text-[0.55rem] font-bold mx-auto text-muted-foreground transform -rotate-90 origin-center">
                BETA
              </span>
              <div className="relative flex items-center h-9 w-9">
                <Image
                  src={app_logo}
                  alt="App Logo"
                  className="relative w-[max(2rem,5vh)] h-auto object-contain rounded-r-2xl"
                />
              </div>
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition"
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? "" : <Menu size={26} />}
            </button>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex h-full items-center">
              <ThemeToggle />
            </div>

            {/* 🔹 Desktop Connect Wallet */}
            <div className="hidden md:block">
              <Button
                variant="secondary"
                size="sm"
                className="flex items-center gap-1.5 h-8 px-3 rounded-md bg-transparent border hover:bg-accent/60 transition-all duration-200"
              >
                <Wallet2Icon size={14} className="text-primary" />
                <span className="text-xs font-mono text-foreground/80 tracking-tight">
                  Connect
                </span>
              </Button>
            </div>

            {/* User button or Sign in */}
            <div className="md:hidden">
              {loading ? (
                <div className="w-6 h-6 bg-muted animate-pulse rounded-xl" />
              ) : !user ? (
                <Button
                  onClick={onAuthClick}
                  variant="default"
                  size="sm"
                  className="px-4 rounded-xl font-medium text-sm bg-gradient-to-r from-primary to-primary/80"
                >
                  Sign in
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  aria-pressed={profileActive}
                  onClick={onProfileToggle}
                  className={`relative inline-flex items-center justify-center w-8 h-8 overflow-hidden rounded-full
                    transition-all duration-300 ease-out transform hover:scale-105
                    ${profileActive
                      ? "bg-gradient-to-br from-primary to-primary/80 shadow-lg ring-2 ring-primary/30"
                      : "bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20"
                    }`}
                >
                  <User className="text-primary" />
                </Button>
              )}
            </div>
          </div>

        </div>
      </header>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[999] md:hidden bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)} // click outside closes menu
          >
            <div
              className="relative flex flex-col h-[100dvh] w-[75%] max-w-[320px] bg-sidebar border-r border-border shadow-xl"
              onClick={(e) => e.stopPropagation()} // prevent inside click from closing
            >
              {/* 🟢 Mobile Menu Header (Smart + Minimal Polished) */}
              <div className="flex items-center justify-between">

                <div className="sticky top-0 z-[100] w-full h-14 transition-all duration-500 ease-out flex items-center justify-between">
                  {/* Left side - Logo and menu button */}
                  <div className="flex items-center gap-0">
                    <div className="flex items-center md:hidden w-fit">
                      <span className="text-[0.55rem] font-bold mx-auto text-muted-foreground transform -rotate-90 origin-center">
                        BETA
                      </span>
                      <div className="relative flex items-center h-9 w-9">
                        <Image
                          src={app_logo}
                          alt="App Logo"
                          className="relative w-[max(2rem,5vh)] h-auto object-contain rounded-r-2xl"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right side actions */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-transparent border hover:bg-accent/60 transition-all duration-200"
                    >
                      <Wallet2Icon size={12} className="text-primary" />
                      <span className="text-[11px] font-mono text-foreground/80 tracking-tight">Connect</span>
                    </Button>

                    <button
                      onClick={() => setMobileOpen(false)}
                      className="p-3.5 rounded-lg hover:bg-primary/10 transition"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-between px-3 py-2 border-y border-border/40 bg-sidebar/80 backdrop-blur-sm">
                <ThemeToggle />

                {/* 🔹 Right: Wallet + Close */}
                <div className="flex items-center gap-1.5">
                  {/* <Button
                    variant="secondary"
                    size="sm"
                    className="flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-transparent border hover:bg-accent/60 transition-all duration-200"
                  >
                    <Wallet2Icon size={12} className="text-primary" />
                    <span className="text-[11px] font-mono text-foreground/80 tracking-tight">Connect</span>
                  </Button> */}
                </div>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 flex flex-col px-6 py-4 overflow-y-auto gap-3">
                <Link
                  href="/"
                  className={`flex items-center gap-2 py-2 text-sm font-medium ${pathname === "/"
                    ? "text-primary font-semibold"
                    : "text-foreground"
                    } hover:text-primary`}
                >
                  <ArrowUpCircle size={18} /> Gate
                </Link>

                <Link
                  href="/bills"
                  className={`flex items-center gap-2 py-2 text-sm font-medium ${pathname.startsWith("/bills")
                    ? "text-primary font-semibold"
                    : "text-foreground"
                    } hover:text-primary`}
                >
                  <QrCode size={18} /> Bills
                </Link>

                <Link
                  href="/wallets"
                  className={`flex items-center gap-2 py-2 text-sm font-medium ${pathname.startsWith("/wallets")
                    ? "text-primary font-semibold"
                    : "text-foreground"
                    } hover:text-primary`}
                >
                  <Wallet size={18} /> Wallets
                </Link>

                <Link
                  href="/activity"
                  className={`flex items-center gap-2 py-2 text-sm font-medium ${pathname.startsWith("/activity")
                    ? "text-primary font-semibold"
                    : "text-foreground"
                    } hover:text-primary`}
                >
                  <ActivityIcon size={18} /> Activity
                </Link>
              </div>

              {/* Fixed Footer */}
              <div className="p-4 border-t border-border/30 bg-sidebar flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex gap-3">
                    <Link
                      href="/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-1 text-sm font-semibold ${pathname === "/docs" ? "text-primary" : "text-foreground"
                        } hover:text-primary transition`}
                    >
                      <BookOpen size={16} /> Docs
                    </Link>
                    <Link
                      href="https://wa.me/2348012345678?text=Hello%20I%20need%20help%20with%20my%20on-ramp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm font-semibold text-foreground hover:text-primary transition"
                    >
                      <HelpCircle size={16} /> Help
                    </Link>
                  </div>

                  {/* 🔸 Social Media Links (Compact Icons Only) */}
                  <div className="flex justify-end items-center gap-4 mt-1">
                    <Link
                      href="https://x.com/yourhandle"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:text-primary transition"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                      >
                        <path d="M18.244 2H21l-6.74 7.69L21.625 22h-4.6l-4.238-6.182L8.05 22H3.5l7.224-8.248L2.5 2h4.7l3.834 5.643L18.244 2z" />
                      </svg>
                    </Link>

                    <Link
                      href="https://t.me/yourhandle"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-foreground hover:text-primary transition"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        className="w-4 h-4"
                      >
                        <path d="M9.04 16.65 8.8 20a.6.6 0 0 0 .46-.23l2.2-2.1 4.56 3.35c.84.47 1.44.22 1.67-.77l3.02-14.18c.27-1.27-.46-1.78-1.27-1.48L2.65 9.12c-1.23.48-1.21 1.18-.22 1.49l4.98 1.56 11.56-7.28-9.94 7.9z" />
                      </svg>
                    </Link>

                    {/* <Link
                    href="https://discord.gg/yourserver"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-primary transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="w-4 h-4"
                    >
                      <path d="M20 0a4 4 0 0 1 4 4v16a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4h16zm-3.6 6.4a10.3 10.3 0 0 0-2.4.8.3.3 0 0 1-.3-.1 7.2 7.2 0 0 0-3.5 0 .3.3 0 0 1-.3.1 10.3 10.3 0 0 0-2.4-.8 10 10 0 0 0-1.8 4.2 9.3 9.3 0 0 0 2.8 6.3 9.5 9.5 0 0 0 5.7 2.4h.2a9.5 9.5 0 0 0 5.7-2.4 9.3 9.3 0 0 0 2.8-6.3 10 10 0 0 0-1.8-4.2zM9.6 13.5c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5-.6 1.5-1.3 1.5zm4.8 0c-.7 0-1.3-.7-1.3-1.5s.6-1.5 1.3-1.5 1.3.7 1.3 1.5-.6 1.5-1.3 1.5z" />
                    </svg>
                  </Link> */}
                  </div>
                </div>



                {!loading && !user && (
                  <Button
                    onClick={() => {
                      setMobileOpen(false)
                      onAuthClick?.()
                    }}
                    size="sm"
                    className="w-full bg-gradient-to-r from-primary to-primary/80"
                  >
                    Sign in
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence >
    </>
  )
}
