"use client"

import { useState, useEffect, useRef } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "../ui/button"
import Image from "next/image"
import useAppLogo from "@/asssets/image"
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
import { useDynamicContext } from "@dynamic-labs/sdk-react-core"





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

  const app_logo = useAppLogo()

  const { setShowAuthFlow, handleLogOut } = useDynamicContext();



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
        <div className="w-full h-full px-4 flex items-center justify-between">
          {/* Left side - Logo and menu button */}
          <div className="flex items-center gap-2">
            <Link href="/">
              <div className="flex items-center md:hidden w-fit h-9 flex-shrink-0 pr-1.5 xs:pr-2 sm:pr-2.5 mr-2">
                <div className="relative flex items-center h-9 w-9">
                  <Image
                    src={app_logo}
                    alt="App Logo"
                    className="relative w-[max(1.4rem,5vh)] h-auto object-contain rounded-md"
                  />

                  <span className="text-[0.5rem] font-bold mx-auto text-muted-foreground dark:text-foreground transform -rotate-90 origin-center">
                    BETA
                  </span>
                </div>
              </div>
            </Link>


            <button
              className="md:hidden transition text-muted-foreground dark:text-foreground flex size-9 items-center justify-center rounded-lg hover:text-primary focus:outline-primary"
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((p) => !p)}
            >
              {mobileOpen ? "" : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-3">

            {/* <nav className="hidden md:flex items-center justify-between ">
              <div className="flex items-center gap-4">

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
                  href="https://wa.me/2348168799622?text=Hello%20I%20need%20help%20with%20my%20on-ramp"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm font-semibold ${pathname === "/docs" ? "text-primary" : "text-foreground"
                    } hover:text-primary transition`}
                >
                  <HelpCircle size={18} className="inline mr-1" />
                  Help
                </Link>


              </div>
            </nav> */}

            {/* 🔹 Desktop Connect Wallet */}
            {/* <div className="hidden md:block">
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
            </div> */}

            <div className="md:hidden my-auto flex items-center">
              <ThemeToggle />
            </div>
            {/* 
            <button onClick={() => setShowAuthFlow(true)}>
              Connect Wallet
            </button> */}

            {/* <button onClick={handleLogOut}>Disconnect Wallet</button> */}
            {/* 
            <button
              className="md:hidden p-2 rounded-lg hover:bg-primary/10 transition text-muted-foreground"
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen((p) => !p)}
            >
              {mobileOpen ? <Menu size={26} /> : <Menu size={26} />}
            </button> */}

            {/* User button or Sign in */}
            <div className="">
  {loading ? (
    <div className="h-[24px] px-4 w-[110px] bg-muted/50 border border-border rounded-xl backdrop-blur-sm animate-pulse" />
  ) : !user ? (
    <Button
      onClick={() => setShowAuthFlow(true)}
      variant="soft_gradient"
      size="sm"
      className="rounded-xl px-4 py-2 bg-muted/50 border border-border backdrop-blur-sm hover:bg-card/50 transition-all duration-300"
      aria-label="Sign in or sign up"
    >
      <span className="font-medium text-foreground">Get Started</span>
    </Button>
  ) : (
    <Button
      onClick={onProfileToggle}
      variant="soft_gradient"
      size="sm"
      className={`rounded-xl px-3 pr-1 flex items-center gap-2 bg-muted/50 border border-border backdrop-blur-sm transition-all duration-300 ${
        profileActive
          ? "shadow-[0_0_10px_rgba(var(--primary-rgb),0.25)]"
          : "hover:bg-card/50"
      }`}
    >
      {/*
      <p className="text-xs text-muted-foreground dark:text-foreground font-semibold truncate max-w-[90px]">
        {(() => {
          const [local, domain] = user.email.split("@")
          const maskedLocal =
            local.length > 3 ? `${local.slice(0, 3)}***` : `${local}***`
          const maskedDomain = domain ? `***` : ""
          return `${maskedLocal}@${maskedDomain}`
        })()}
      </p> */}

      <div
        aria-pressed={profileActive}
        className={`w-7 h-7 flex items-center justify-center rounded-full transition-all duration-300 ${
          profileActive
            ? "bg-gradient-to-br from-primary to-primary/80 shadow-md ring-1 ring-primary/30"
            : "bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20"
        }`}
      >
        <User className="size-4 text-primary" />
      </div>
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
            className="fixed inset-0 z-[999] md:hidden bg-background/5 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)} // click outside closes menu
          >
            <div
              className="relative flex flex-col h-[100dvh] max-w-xs bg-sidebar border-r border-border"
              onClick={(e) => e.stopPropagation()} // prevent inside click from closing
            >
              {/* 🟢 Mobile Menu Header (Smart + Minimal Polished) */}
              <div className="flex items-center justify-between border-b border-border/40 px-4">

                <div className="sticky top-0 z-[100] w-full h-14 transition-all duration-500 ease-out flex items-center justify-between">
                  {/* Left side - Logo and menu button */}
                  <div className="flex items-center md:hidden w-fit h-9 flex-shrink-0 pr-1.5 xs:pr-2 sm:pr-2.5">
                    <div className="relative flex items-center h-9 w-9">
                      <Image
                        src={app_logo}
                        alt="App Logo"
                        className="relative w-[max(1.4rem,5vh)] h-auto object-contain rounded-md"
                      />

                      <span className="text-[0.5rem] font-bold mx-auto text-muted-foreground transform -rotate-90 origin-center">
                        BETA
                      </span>
                    </div>
                  </div>

                  {/* Right side actions */}
                  <div className="flex items-center gap-3">

                    <button
                      onClick={() => setMobileOpen(false)}
                      className="transition text-muted-foreground dark:text-foreground flex size-8 items-center justify-center rounded-lg hover:text-primary focus:outline-primary"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

              </div>


              {/* Scrollable content */}
              <div className="flex-1 flex flex-col px-4 py-4 overflow-y-auto gap-3">
                {/* <div className="mb-3 flex items-center justify-between">
                  <div className="">
                    <h3 className="text-sm font-semibold text-muted-foreground">
                      Framp Gateway
                    </h3>
                    <p className="text-xs text-muted-foreground/70">
                      Do more with crypto.
                    </p>
                  </div>
                </div> */}

                <Link
                  href="/" className={`relative flex h-fit select-none flex-col items-center justify-center gap-0.5 whitespace-nowrap px-1 transition duration-100 ${pathname === "/" ? "text-primary font-bold text-md" : "text-muted-foreground font-medium text-sm"
                    } hover:text-primary transition`}
                >
                  <Button
                    className="w-full justify-start gap-2 rounded-md" variant={pathname === "/" ? "default" : "ghost"}
                  >
                    <ArrowUpCircle size={18} /> Gate
                  </Button>
                </Link>

                <Link
                  href="/bills" className={`relative flex h-fit select-none flex-col items-center justify-center gap-0.5 whitespace-nowrap px-1 transition duration-100 ${pathname === "/bills" ? "text-primary font-bold text-md" : "text-muted-foreground font-medium text-sm"
                    } hover:text-primary transition`}
                >
                  <Button
                    className="w-full justify-start gap-2 rounded-md" variant={pathname === "/bills" ? "default" : "ghost"}
                  >
                    <QrCode size={18} /> Bills
                  </Button>
                </Link>

                <Link
                  href="/wallets" className={`relative flex h-fit select-none flex-col items-center justify-center gap-0.5 whitespace-nowrap px-1 transition duration-100 ${pathname === "/wallets" ? "text-primary font-bold text-md" : "text-muted-foreground font-medium text-sm"
                    } hover:text-primary transition`}
                >
                  <Button
                    className="w-full justify-start gap-2 rounded-md" variant={pathname === "/wallets" ? "default" : "ghost"}
                  >
                    <Wallet size={18} /> Wallets
                  </Button>
                </Link>

                <Link
                  href="/activity" className={`relative flex h-fit select-none flex-col items-center justify-center gap-0.5 whitespace-nowrap px-1 transition duration-100 ${pathname === "/activity" ? "text-primary font-bold text-md" : "text-muted-foreground font-medium text-sm"
                    } hover:text-primary transition`}
                >
                  <Button
                    className="w-full justify-start gap-2 rounded-md" variant={pathname === "/activity" ? "default" : "ghost"}
                  >
                    <ActivityIcon size={18} /> Activity
                  </Button>
                </Link>
              </div>

              {/* Fixed Footer */}
              <div className="bg-sidebar flex flex-col">
                {/* <div className="flex items-center justify-between p-4 border-t border-border/30">
                  <div className="">
                    <ThemeToggle />
                  </div>

                  {loading ? (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="w-24 h-4 bg-muted animate-pulse rounded" />
                        <div className="w-32 h-3 bg-muted animate-pulse rounded" />
                      </div>
                      <div className="w-8 h-8 bg-muted animate-pulse rounded-full" />
                    </div>
                  ) : !user ? (
                    <Button
                      onClick={() => setShowAuthFlow(true)}
                      variant="soft_gradient"
                      size="sm"
                      className="px-4 rounded-xl"
                      aria-label="Get Started"
                    >
                      Get Started
                    </Button>
                  ) : (
                    <Button
                      onClick={onProfileToggle}
                      variant="soft_gradient"
                      size="sm"
                      className="pr-0 rounded-xl">
                      <div className="flex-1 space-y-1">
                        <p className="text-xs text-muted-foreground font-bold mb-0">
                          {(() => {
                            const [local, domain] = user.email.split("@");
                            const maskedLocal = local.length > 3 ? `${local.slice(0, 3)}***` : `${local}***`;
                            const maskedDomain = domain ? `***` : "";
                            return `${maskedLocal}@${maskedDomain}`;
                          })()}
                        </p>
                         <span className="text-xs text-muted-foreground capitalize">
                          UID: {user.id.slice(0, 8)}
                        </span>  
                      </div>
                      <Button
                        variant="ghost"
                        aria-pressed={profileActive}
                        onClick={onProfileToggle}
                        className={`relative inline-flex items-center justify-center w-8 h-8 overflow-hidden rounded-full transition-all duration-300 ease-out transform hover:scale-105 ${profileActive
                          ? "bg-gradient-to-br from-primary to-primary/80 shadow-lg ring-2 ring-primary/30"
                          : "bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20"
                          }`}
                      >
                        <User className="text-primary" />
                      </Button>
                    </Button>
                  )}
                </div> */}

                <div className="flex justify-between items-center p-4 border-t border-border/30">
                  <div className="flex gap-3">
                    <Link
                      href="https://frampfi.gitbook.io/frampfi/"
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



                {/* {!loading && !user && (
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
                )} */}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence >
    </>
  )
}
