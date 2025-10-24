"use client";

import { useState, useEffect, useRef } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/button";

import Image from "next/image";
import useAppLogo from "@/asssets/image";

import { useAuth } from "@/context/AuthContext";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core"

import Link from "next/link";
import { HelpCircle, Menu, User, X, BookOpen } from "lucide-react";

interface SideHeaderProps {
    onAuthClick?: () => void;
    chatActive?: boolean;
    onChatToggle?: () => void;
    profileActive?: boolean;
    onProfileToggle?: () => void;
}

export function SideHeader({
    onAuthClick,
    chatActive,
    onChatToggle,
    profileActive,
    onProfileToggle,
}: SideHeaderProps) {


    const { user, loading, logout } = useAuth();

    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const headerRef = useRef<HTMLElement>(null);

    const app_logo = useAppLogo()

    const { setShowAuthFlow, handleLogOut } = useDynamicContext();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent | TouchEvent) => {
            if (mobileOpen && headerRef.current && !headerRef.current.contains(event.target as Node)) {
                setMobileOpen(false);
            }
        };

        // Add event listener when mobile menu is open
        if (mobileOpen) {
            document.addEventListener("mousedown", handleClickOutside as EventListener);
            document.addEventListener("touchstart", handleClickOutside as EventListener);
        }

        // Cleanup function
        return () => {
            document.removeEventListener("mousedown", handleClickOutside as EventListener);
            document.removeEventListener("touchstart", handleClickOutside as EventListener);
        };
    }, [mobileOpen]);

    // Close mobile menu when pressing Escape key
    useEffect(() => {
        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && mobileOpen) {
                setMobileOpen(false);
            }
        };

        if (mobileOpen) {
            document.addEventListener('keydown', handleEscapeKey);
        }

        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [mobileOpen]);


    return (
        <header className={`h-14 relative z-10 border-b border-border/40`}>
            <div className="w-full h-full px-4 flex items-center justify-between">
                {/* Left side - Logo and menu button */}
                <div className="flex items-center w-fit h-9 flex-shrink-0 pr-1.5 xs:pr-2 sm:pr-2.5">
                    <div className="relative flex items-center h-9 w-9">
                        <Image
                            src={app_logo}
                            alt="App Logo"
                            className="relative w-[max(1.4rem,5vh)] h-auto object-contain rounded-r-2xl rounded-l-md"
                        />

                        <span className="text-[0.4rem] font-bold mx-auto text-muted-foreground transform -rotate-90 origin-center">
                            BETA
                        </span>
                    </div>
                </div>


                {/* Desktop navigation */}
                <div className="flex items-center gap-3">
                    {/* <ThemeToggle /> */}


                    {/* User Actions */}
                    {loading ? (
                        <div className="w-6 h-6 md:w-8 md:h-8 bg-muted animate-pulse rounded-xl" />
                    ) : !user ? (
                        <Button
                            onClick={() => setShowAuthFlow(true)}
                            variant="soft_gradient"
                            size="sm"
                            className="rounded-xl"
                            aria-label="Sign in or sign up"
                        >
                            Get Started
                        </Button>
                    ) : (
                        <Button
                            onClick={onProfileToggle}
                            variant="soft_gradient"
                            size="sm"
                            className="pr-0 md:pr-0 rounded-xl">
                            <div className="flex-1 space-y-1">
                                <p className="text-xs text-muted-foreground font-bold mb-0">
                                    {(() => {
                                        const [local, domain] = user.email.split("@");
                                        const maskedLocal = local.length > 3 ? `${local.slice(0, 3)}***` : `${local}***`;
                                        const maskedDomain = domain ? `***` : "";
                                        return `${maskedLocal}@${maskedDomain}`;
                                    })()}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                aria-pressed={profileActive}
                                onClick={onProfileToggle}
                                className={`relative inline-flex items-center justify-center w-9 h-9 overflow-hidden rounded-full transition-all duration-300 ease-out transform hover:scale-105 ${profileActive
                                    ? "bg-gradient-to-br from-primary to-primary/80 shadow-lg ring-2 ring-primary/30"
                                    : "bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20"
                                    }`}
                            >
                                <User className="text-primary" />
                            </Button>
                        </Button>
                    )}
                </div>
            </div>
        </header>
    );
}