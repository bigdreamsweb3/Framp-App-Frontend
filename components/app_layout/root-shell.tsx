"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { SideHeader } from "./side-header"
import { BottomNav } from "./bottom-nav"
import { Button } from "@/components/ui/button"
import {
    ArrowUpCircle,
    QrCode,
    PiggyBank,
    Wallet as WalletIcon,
    Activity as ActivityIcon,
    HelpCircle,
    BookOpen,
    User,
} from "lucide-react"
import { AppHeader } from "./app-header"
import { motion } from "framer-motion"
import { MessageCircle, X } from "lucide-react"
import { AIChat } from "@/components/ai-chat"
import { AuthPage } from "@/components/auth-page"
import { ProfileModal } from "@/components/modals/profile-modal"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUI } from "@/context/UIContext"
import { useAuth } from "@/context/AuthContext"
import { ThemeToggle } from "../theme-toggle"
import { useDynamicContext } from "@dynamic-labs/sdk-react-core"
import AccessCodeModal from "../modals/AccessCodeModal"
import { Card, CardContent } from "../ui/card"

import Image from "next/image"
import useAppLogo from "@/asssets/image"

export default function RootShell({ children }: { children: React.ReactNode }) {
    const [showAuth, setShowAuth] = useState(false)
    const [showProfile, setShowProfile] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const [activeView, setActiveView] = useState<string>("onramp")

    const { setShowAuthFlow, handleLogOut } = useDynamicContext();

    const router = useRouter()
    const pathname = usePathname() || "/"
    const { user, loading, showAccessCodeModal } = useAuth()

    const app_logo = useAppLogo()

    // Keep active tab synced with current route
    useEffect(() => {
        if (pathname === "/") setActiveView("onramp")
        else if (pathname === "/bills") setActiveView("bills")
        else if (pathname === "/save") setActiveView("save")
        else if (pathname === "/activity") setActiveView("activity")
        else if (pathname.startsWith("/wallets")) setActiveView("wallets")
    }, [pathname])

    // Close profile modal on route change
    useEffect(() => {
        setShowProfile(false);
    }, [pathname]);

    const handleTabChange = (value: string) => {
        setActiveView(value)
        switch (value) {
            case "onramp":
                router.push("/")
                break
            case "bills":
                router.push("/bills")
                break
            case "save":
                router.push("/save")
                break
            case "activity":
                router.push("/activity")
                break
            case "wallets":
                router.push("/wallets")
                break
            default:
                router.push("/")
        }
    }

    const handleShowAuth = () => setShowAuthFlow(true)
    const handleHideAuth = () => setShowAuth(false)
    const handleChatQuickAction = (action: string) => {
        // close chat and navigate based on intent if obvious
        setShowChat(false)
        const a = action?.toLowerCase?.() || ""
        if (a.includes("wallet") || a.includes("bank") || a.includes("payment")) {
            router.push("/wallets")
        } else if (a.includes("activity") || a.includes("history")) {
            router.push("/activity")
        } else if (a.includes("buy") || a.includes("ramp") || a.includes("purchase")) {
            router.push("/")
        }
    }

    // Register the openAuth handler with the UI context so other components can trigger the global auth modal
    const { setOpenAuth } = useUI();
    useEffect(() => {
        // Register the handler directly so ui.openAuth() will call it
        setOpenAuth?.(handleShowAuth);
        // cleanup: reset to noop on unmount
        return () => setOpenAuth?.(() => { });
    }, [setOpenAuth]);

    // Listen for cross-component requests to close the profile modal
    useEffect(() => {
        const onClose = () => setShowProfile(false);
        try {
            window.addEventListener('framp:closeProfile', onClose as any);
        } catch (e) {
            // ignore in non-browser
        }
        return () => {
            try {
                window.removeEventListener('framp:closeProfile', onClose as any);
            } catch (e) { }
        };
    }, []);

    if (loading) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-8">
                    {/* Logo with shine effect */}
                    <div className="relative">
                        <Image
                            src={app_logo}
                            alt="App Logo"
                            width={64}
                            height={64}
                            className="w-16 h-16 object-contain rounded-md drop-shadow-2xl"
                            priority
                        />
                        <span className="absolute -top-1 -right-1 text-[0.55rem] font-bold px-1.5 py-0.5 bg-primary text-white rounded-sm rotate-12 shadow-lg">
                            BETA
                        </span>

                        {/* Shining sweep */}
                        <div className="absolute inset-0 overflow-hidden rounded-md">
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shine" />
                        </div>
                    </div>

                    {/* AI Thinking Dots - ChatGPT style */}
                    <div className="flex items-center gap-2">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className="w-3 h-3 bg-primary/80 rounded-full animate-bounce"
                                style={{
                                    animationDelay: `${i * 0.15}s`,
                                    animationDuration: '1.4s',
                                }}
                            />
                        ))}
                    </div>

                    {/* Optional text (uncomment if you want) */}
                    {/* <p className="text-sm text-muted-foreground tracking-wider">Thinking<span className="animate-pulse">...</span></p> */}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-transparent text-foreground">
            {/* Desktop Layout */}
            <div className="hidden md:flex h-screen overflow-hidden">
                {/* Sidebar */}
                <div className="flex flex-col justify-between h-full w-80 border-r bg-sidebar relative z-10">
                    <div>
                        <SideHeader
                            onAuthClick={handleShowAuth}
                            profileActive={showProfile}
                            onProfileToggle={() => setShowProfile((p) => !p)}
                        />

                        <div className="py-6 px-4 space-y-4 overflow-y-auto">
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-foreground">
                                    Framp Gateway
                                </h3>
                                <p className="text-xs text-foreground/70">
                                    Do more with crypto.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <Link href="/" className={`relative flex h-full select-none flex-col items-center justify-center gap-0.5 whitespace-nowrap px-1sition duration-100 ${pathname === "/" ? "text-primary font-bold text-md" : "text-muted-foreground font-medium text-sm"
                                        } hover:text-primary transition`}>
                                        <Button
                                            className="w-full justify-start gap-2 rounded-md"
                                            variant={pathname === "/" ? "soft_gradient" : "ghost"}
                                        >
                                            <ArrowUpCircle className="h-4 w-4" />
                                            Gate
                                        </Button>
                                    </Link>
                                </div>

                                <div>
                                    <Link href="/bills" className={`relative flex h-full select-none flex-col items-center justify-center gap-0.5 whitespace-nowrap transition duration-100 ${pathname === "/bills" ? "text-primary font-bold text-md" : "text-muted-foreground font-medium text-sm"
                                        } hover:text-primary transition`}>
                                        <Button
                                            className="w-full justify-start gap-2 rounded-md"
                                            variant={pathname === "/bills" ? "soft_gradient" : "ghost"}
                                        >
                                            <QrCode className="h-4 w-4" />
                                            Bills
                                        </Button>
                                    </Link>
                                </div>

                                <div>
                                    <Link href="/wallets" className={`relative flex h-full select-none flex-col items-center justify-center gap-0.5 whitespace-nowrap transition duration-100 ${pathname === "/wallets" ? "text-primary font-bold text-md" : "text-muted-foreground font-medium text-sm"
                                        } hover:text-primary transition`}>
                                        <Button
                                            className="w-full justify-start gap-2 rounded-md"
                                            variant={pathname?.startsWith("/wallets") ? "soft_gradient" : "ghost"}
                                        >
                                            <WalletIcon className="h-4 w-4" />
                                            Wallets
                                        </Button>
                                    </Link>
                                </div>

                                <div>
                                    <Link href="/activity" className={`relative flex h-full select-none flex-col items-center justify-center gap-0.5 whitespace-nowrap transition duration-100 ${pathname === "/activity" ? "text-primary font-bold text-md" : "text-muted-foreground font-medium text-sm"
                                        } hover:text-primary transition`}>
                                        <Button
                                            className="w-full justify-start gap-2 rounded-md"
                                            variant={pathname === "/activity" ? "soft_gradient" : "ghost"}
                                        >
                                            <ActivityIcon className="h-4 w-4" />
                                            Activity
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar Footer */}
                        <div className="hidden md:flex flex-col fixed bottom-0 w-80">
                            <nav className="flex items-center justify-between px-4 py-5 border-t border-border/30">
                                <div className="flex items-center gap-4">
                                    <Link
                                        href="https://frampfi.gitbook.io/frampfi/"
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

                                {/* 🔸 Social Media Links (Compact Icons Only) */}
                                <div className="flex justify-end items-center gap-4 mt-1">

                                    <Link
                                        href="https://x.com/FrampFi"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-semibold text-foreground hover:text-primary transition"
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
                                        href="https://t.me/Framp_HQ"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm font-semibold text-foreground hover:text-primary transition"
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
                                </div>
                            </nav>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto">
                    <AppHeader
                        onAuthClick={handleShowAuth}
                        chatActive={showChat}
                        onChatToggle={() => setShowChat((p) => !p)}
                        profileActive={showProfile}
                        onProfileToggle={() => setShowProfile((p) => !p)}
                    />
                    <div className="container mx-auto px-6 py-6 mt-[35px] max-w-7xl">
                        {children}
                    </div>
                </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden min-h-screen ">
                <AppHeader
                    onAuthClick={handleShowAuth}
                    chatActive={false}
                    onChatToggle={() => { }}
                    profileActive={showProfile}
                    onProfileToggle={() => setShowProfile((p) => !p)}
                />

                <main className="container mx-auto px-4 py-6 max-w-md pb-28 mt-[6px]">
                    {children}
                </main>
            </div >

            {/* Mobile Bottom Navigation */}
            <BottomNav />

            {/* Access Code Modal - will show automatically when needed */}
            <AccessCodeModal />

            {!user && !showAccessCodeModal && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />

                    {/* Modal Card */}
                    <Card className="relative z-10 w-full max-w-md bg-background border border-border/10 shadow-2xl">
                        <CardContent className="p-8 md:p-12 text-center">
                            {/* Logo + BETA */}
                            <div className="flex flex-col items-center mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <Image
                                            src={app_logo}
                                            alt="FRAMP Logo"
                                            width={46}
                                            height={46}
                                            className="w-12 h-12 object-contain rounded-xl drop-shadow-xl"
                                            priority
                                        />
                                        <span className="absolute -top-1 -right-1 text-[0.55rem] font-bold px-1.5 py-0.5 bg-primary text-white rounded-sm rotate-12 shadow-lg">
                                            BETA
                                        </span>
                                    </div>

                                    {/* Crypto-first headline */}
                                    <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter bg-gradient-to-r from-primary via-primary to-primary/70 bg-clip-text text-transparent">
                                        FRAMP
                                    </h1>
                                </div>
                                <p className="text-muted-foreground mt-4 max-w-xs leading-relaxed">
                                    On/Off-Ramp • Pay Bills • Earn Yields and Explore Solana — all in one place
                                </p>
                            </div>

                            {/* Button – big, bold, crypto energy */}
                            <div className="flex justify-center">
                                <Button
                                    onClick={handleShowAuth}
                                    size="lg"
                                    className="w-full max-w-sm shadow-md"
                                >
                                    Get Started
                                </Button>
                            </div>

                            {/* Subtle footer */}
                            <p className="text-center text-xs text-muted-foreground/70 mt-8">
                                Powered by Solana • Built for speed
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Chat overlay */}
            {showChat && (
                <div className="fixed inset-0 z-[100] flex justify-end items-end bg-black/70">
                    <motion.div
                        className="bg-card/95 backdrop-blur-md w-full h-full p-4 shadow-xl lg:w-[min(90vw,28rem)] lg:h-full"
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-2 right-2"
                            onClick={() => setShowChat(false)}
                            aria-label="Close AI Assistant"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                        <AIChat onQuickAction={handleChatQuickAction} />
                    </motion.div>
                </div>
            )}

            {/* Auth Modal */}
            {
                showAuth && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80">
                        <div className="relative z-10 w-full max-w-md">
                            <AuthPage onBack={handleHideAuth} />
                        </div>
                    </div>
                )
            }

            {/* Profile Modal */}
            {
                showProfile && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center md:justify-end bg-black/80">
                        <div className="relative z-10 w-full">
                            <ProfileModal onQuickAction={() => setShowProfile(false)} />
                        </div>
                    </div>
                )
            }
        </div >
    )
}