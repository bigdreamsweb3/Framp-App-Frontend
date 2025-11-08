"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "../ui/button"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useDynamicContext } from "@dynamic-labs/sdk-react-core"
import { User } from "lucide-react"
import { ThemeToggle } from "../theme-toggle"
import useAppLogo from "@/asssets/image"

interface SideHeaderProps {
  onAuthClick?: () => void
  chatActive?: boolean
  onChatToggle?: () => void
  profileActive?: boolean
  onProfileToggle?: () => void
}

export function SideHeader({
  onAuthClick,
  chatActive,
  onChatToggle,
  profileActive,
  onProfileToggle,
}: SideHeaderProps) {
  const { user, loading, logout } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)
  const app_logo = useAppLogo()
  const { setShowAuthFlow, handleLogOut } = useDynamicContext()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (mobileOpen && headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setMobileOpen(false)
      }
    }

    if (mobileOpen) {
      document.addEventListener("mousedown", handleClickOutside as EventListener)
      document.addEventListener("touchstart", handleClickOutside as EventListener)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside as EventListener)
      document.removeEventListener("touchstart", handleClickOutside as EventListener)
    }
  }, [mobileOpen])

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && mobileOpen) setMobileOpen(false)
    }

    if (mobileOpen) document.addEventListener("keydown", handleEscapeKey)
    return () => document.removeEventListener("keydown", handleEscapeKey)
  }, [mobileOpen])

  return (
    <header ref={headerRef} className="h-14 relative z-10">
      <div className="w-full h-full px-4 flex items-center justify-between">
        {/* ✅ Left side - Logo */}
        <Link href="/">
          <div className="flex items-center w-fit h-9 flex-shrink-0 pr-1.5 relative">
            <div className="relative flex items-center h-9 w-9">
              <Image
                src={app_logo}
                alt="App Logo"
                width={36}
                height={36}
                className="object-contain rounded-md"
              />
              <span className="absolute -top-1 -right-1 text-[0.5rem] font-bold px-[2px] py-[1px] bg-primary text-white rounded-sm rotate-12">
                BETA
              </span>
            </div>
          </div>
        </Link>

        {/* ✅ Right side - Theme & Actions */}
        <div className="flex items-center gap-3">
          {/* <ThemeToggle /> */}
          {/* You can re-enable your user buttons here later */}
        </div>
      </div>
    </header>
  )
}
