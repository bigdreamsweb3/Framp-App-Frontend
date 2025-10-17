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
      {/* HEADER */}
      <header
        ref={headerRef}
        className={`sticky top-0 z-[100] w-full h-14 transition-all duration-500 ease-out
          ${scrolled || mobileOpen ? "bg-sidebar shadow border-b border-border" : "bg-transparent"}
          ${scrolled ? "border-b border-border/40" : ""}`}
      >
        <div className="w-full h-full px-4 flex items-center justify-between">
          {/* Left side - Logo and menu button */}
          <div className="flex items-center gap-0">
            <div className="flex items-center md:hidden w-fit">
              <div className="relative flex items-center h-8 w-8">
                <Image
                  src={app_logo}
                  alt="App Logo"
                  className="relative w-[max(2rem,5vh)] h-auto object-contain rounded-r-2xl"
                />
              </div>
              <span className="text-[0.55rem] font-bold px-1 mx-auto text-muted-foreground transform -rotate-90 origin-center">
                BETA
              </span>
            </div>

            <button
              onClick={() => setMobileOpen((p) => !p)}
              className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition"
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex h-full items-center">
              <ThemeToggle />
            </div>

            <div className="mr-2 hidden md:block">
              <nav className="flex items-center gap-4">
                <Link
                  href="/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm font-semibold ${pathname === "/docs" ? "text-primary" : "text-foreground"
                    } hover:text-primary transition`}
                >
                  <BookOpen size={18} className="inline mr-1" />
                  Docs
                </Link>
                <Link
                  href="https://wa.me/2348012345678?text=Hello%20I%20need%20help%20with%20my%20on-ramp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-foreground hover:text-primary transition"
                >
                  <HelpCircle size={18} className="inline mr-1" />
                  Help
                </Link>
              </nav>
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
            className="fixed inset-0 z-[99] md:hidden"
            onClick={() => setMobileOpen(false)} // click outside closes menu
          >
            <div
              className="relative flex flex-col h-screen w-[75%] max-w-[320px]"
              onClick={(e) => e.stopPropagation()} // prevent inside click from closing
            >
              {/* Scrollable content */}
              <div className="flex-1 flex flex-col px-6 py-4 overflow-y-auto mt-16 bg-sidebar border-r border-border shadow-xl rounded-tr-2xl gap-3">
                <Link
                  href="/"
                  className={`flex items-center gap-2 py-2 text-sm font-medium ${pathname === "/"
                    ? "text-primary font-semibold"
                    : "text-foreground/80"
                    } hover:text-primary`}
                >
                  <ArrowUpCircle size={18} /> Gate
                </Link>

                <Link
                  href="/bills"
                  className={`flex items-center gap-2 py-2 text-sm font-medium ${pathname.startsWith("/bills")
                    ? "text-primary font-semibold"
                    : "text-foreground/80"
                    } hover:text-primary`}
                >
                  <QrCode size={18} /> Bills
                </Link>

                <Link
                  href="/wallets"
                  className={`flex items-center gap-2 py-2 text-sm font-medium ${pathname.startsWith("/wallets")
                    ? "text-primary font-semibold"
                    : "text-foreground/80"
                    } hover:text-primary`}
                >
                  <User size={18} /> Wallets
                </Link>

                <Link
                  href="/activity"
                  className={`flex items-center gap-2 py-2 text-sm font-medium ${pathname.startsWith("/activity")
                    ? "text-primary font-semibold"
                    : "text-foreground/80"
                    } hover:text-primary`}
                >
                  <ActivityIcon size={18} /> Activity
                </Link>
              </div>

              {/* Fixed Footer */}
              <div className="p-4 border-t border-border/30 bg-sidebar flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <ThemeToggle />
                  <div className="flex gap-3">
                    <Link
                      href="/docs"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-foreground/80 hover:text-primary"
                    >
                      <BookOpen size={16} /> Docs
                    </Link>
                    <Link
                      href="https://wa.me/2348012345678?text=Hello%20I%20need%20help%20with%20my%20on-ramp"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-foreground/80 hover:text-primary"
                    >
                      <HelpCircle size={16} /> Help
                    </Link>
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
      </AnimatePresence>
    </>
  )
}
