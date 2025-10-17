"use client";

import { useState, useEffect, useRef } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "../ui/button";

import Image from "next/image";
import { app_logo } from "@/asssets/image";

import { useAuth } from "@/context/AuthContext";


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
        <header className={`h-14 relative z-10`}>
            <div className="w-full h-full pr-4 flex items-center justify-between">
                {/* Left side - Logo and menu button */}
                <div className="flex items-center h-fit">
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


                {/* Desktop navigation */}


                {/* User Actions */}
                {loading ? (
                    <div className="w-6 h-6 md:w-8 md:h-8 bg-muted animate-pulse rounded-xl" />
                ) : !user ? (
                    <Button
                        onClick={onAuthClick}
                        variant="default"
                        size="sm"
                        className="px-4 rounded-xl font-medium text-sm bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all duration-200"
                        aria-label="Sign in or sign up"
                    >
                        Sign in
                    </Button>
                ) : (
                    <Button
                        variant="ghost"
                        aria-pressed={profileActive}
                        onClick={onProfileToggle}
                        className={`relative inline-flex items-center justify-center w-9 h-9 overflow-hidden rounded-full
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
        </header>
    );
}