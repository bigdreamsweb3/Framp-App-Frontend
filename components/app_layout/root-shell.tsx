"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { SideHeader } from "./side-header"
import { BottomNav} from "./bottom-nav"
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
import { Profile } from "@/components/modals/profile-modal"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUI } from "@/context/UIContext"
import { useAuth } from "@/context/AuthContext"
import { ThemeToggle } from "../theme-toggle"
import { useDynamicContext } from "@dynamic-labs/sdk-react-core"
import ScrollMaskLayout from "@/components/app_layout/ScrollMaskLayout"

export default function RootShell({ children }: { children: React.ReactNode }) {
    const [showAuth, setShowAuth] = useState(false)
    const [showProfile, setShowProfile] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const [activeView, setActiveView] = useState<string>("onramp")

    const { setShowAuthFlow, handleLogOut } = useDynamicContext();

    const router = useRouter()
    const pathname = usePathname() || "/"
    const { user, loading } = useAuth()

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

    const handleShowAuth = () => setShowAuth(true)
    const handleHideAuth = () => setShowAuth(false)
    const handleChatQuickAction = (action: string) => {
        // close chat and navigate based on intent if obvious
        setShowChat(false)
        const a = action?.toLowerCase?.() || ""
        if (a.includes("wallet") || a.includes("bank") || a.includes("payment")) {
            router.push("/wallets") // Fixed: changed from "/wallet" to "/wallets"
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
                                {/* <div>
                                    <Link href="/save">
                                        <Button
                                            className="w-full justify-start gap-2 rounded-md"
                                            variant={pathname === "/save" ? "default" : "ghost"}
                                        >
                                            <PiggyBank className="h-4 w-4" />
                                            Save
                                        </Button>
                                    </Link>
                                </div> */}

                                <div>
                                    <Link href="/wallets" className={`relative flex h-full select-none flex-col items-center justify-center gap-0.5 whitespace-nowrap transition duration-100 ${pathname === "/wallets" ? "text-primary font-bold text-md" : "text-muted-foreground font-medium text-sm"
                                        } hover:text-primary transition`}>
                                        <Button
                                            className="w-full justify-start gap-2 rounded-md"
                                            variant={pathname?.startsWith("/wallets") ? "soft_gradient" : "ghost"} // Fixed: changed from "/wallet" to "/wallets"
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
                            {/* <div className="flex items-center justify-between px-4 py-3 border-t border-border/30 h-12">
                                <div className="">
                                    <ThemeToggle />
                                </div>
                            </div> */}
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
                <div className="flex-1 max-h-screen">
                    <AppHeader
                        onAuthClick={handleShowAuth}
                        chatActive={showChat}
                        onChatToggle={() => setShowChat((p) => !p)}
                        profileActive={showProfile}
                        onProfileToggle={() => setShowProfile((p) => !p)}
                    />
                    <ScrollMaskLayout topMaskHeight={56}>
                    <div className="container mx-auto px-6 py-6 mt-[35px] max-w-7xl">
                        {children}
                    </div>
                    </ScrollMaskLayout>
                </div>
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden flex flex-col h-screen max-h-screen">
                <AppHeader
                    onAuthClick={handleShowAuth}
                    chatActive={false}
                    onChatToggle={() => { }}
                    profileActive={showProfile}
                    onProfileToggle={() => setShowProfile((p) => !p)}
                />
                <ScrollMaskLayout topMaskHeight={56}>

                <div className="flex-1 overflow-auto container mx-auto px-4 py-6 pb-28">
                    {/* <div className="flex flex-row items-center gap-2 h-fit mb-6">
                         <Tabs
                            value={activeView}
                            onValueChange={handleTabChange}
                            className="w-full flex flex-row"
                        >
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger
                                    value="onramp"
                                    className={activeView === "onramp" ? "text-primary" : "text-muted-foreground text-xs"}
                                >
                                    <ArrowUpCircle className="h-4 w-4" />
                                    Gate
                                </TabsTrigger>
                                <TabsTrigger
                                    value="bills"
                                    className={activeView === "bills" ? "text-primary" : "text-muted-foreground text-xs"}
                                >
                                    <QrCode className="h-4 w-4" />
                                    Bills
                                </TabsTrigger>
                                <TabsTrigger
                                    value="save"
                                    className={activeView === "save" ? "text-primary" : "text-muted-foreground text-xs"}
                                >
                                    <PiggyBank className="h-4 w-4" />
                                    Save
                                </TabsTrigger>

                                <TabsTrigger
                                    value="wallets"
                                    className={activeView === "wallets" ? "text-primary" : "text-muted-foreground text-xs"}
                                >
                                    <WalletIcon className="h-4 w-4" />
                                    Wallets
                                </TabsTrigger>
                            </TabsList>


                            <TabsList>
                                <TabsTrigger
                                    value="activity"
                                    className={activeView === "activity" ? "text-primary" : "text-muted-foreground text-xs"}
                                >
                                    <ActivityIcon className="h-4 w-4 font-bold" />
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        
                        <Link
                            href="/activity"
                            onClick={() => setActiveView("activity")}
                            className={`flex flex-col items-center text-xs p-2 hover:bg-muted/20 justify-center rounded-full bg-muted w-7 ${activeView === "activity" ? "text-primary" : "text-muted-foreground text-xs"
                                }`}
                        >
                            <ActivityIcon className="w-4 h-4" />
                        </Link>


                    </div> */}
                    {children}
                </div>
            </ScrollMaskLayout>


            </div >

            {/* Mobile Bottom Navigation */}
            <BottomNav />

            {/*

            <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-sidebar sm:hidden">
                <div className="mb-[env(safe-area-inset-bottom)] flex h-14 items-center text-sm">
                    <div className="grid size-full grid-cols-4">
                        <Link className={`relative flex h-full select-none flex-col items-center justify-center gap-0.5 whitespace-nowrap px-1 duration-100 ${pathname === "/" ? "text-primary dark:text-foreground font-bold text-md" : "text-muted-foreground font-medium text-sm"
                            } hover:text-primary transition`} href="/">
                            <ArrowUpCircle className="h-4 w-4" />
                            <span className="w-full text-center">Gate</span>
                        </Link>


                        <Link className={`relative flex h-full select-none flex-col items-center justify-center gap-0.5 whitespace-nowrap px-1 duration-100 ${pathname === "/bills" ? "text-primary dark:text-foreground font-bold text-md" : "text-muted-foreground font-medium text-sm"
                            } hover:text-primary transition`} href="/bills">
                            <QrCode className="h-4 w-4" />
                            <span className="w-full text-center">Bills</span>
                        </Link>


                        <Link className={`relative flex h-full select-none flex-col items-center justify-center gap-0.5 whitespace-nowrap px-1 duration-100 ${pathname === "/wallets" ? "text-primary dark:text-foreground font-bold text-md" : "text-muted-foreground font-medium text-sm"
                            } hover:text-primary transition`} href="/wallets">
                            <WalletIcon className="h-4 w-4" />
                            <span className="w-full text-center">Wallets</span>
                        </Link>

                        <Link className={`relative flex h-full select-none flex-col items-center justify-center gap-0.5 whitespace-nowrap px-1 duration-100 ${pathname === "/activity" ? "text-primary dark:text-foreground font-bold text-md" : "text-muted-foreground font-medium text-sm"
                            } hover:text-primary transition`} href="/activity">
                            <ActivityIcon className="h-4 w-4" />
                            <span className="w-full text-center">Activity</span>
                        </Link>
                    </div>
                </div>
            </nav> */}


            {/* Floating AI Chat Button */}
            {/* <motion.button
                className="fixed bottom-4 right-4 bg-primary text-primary-foreground rounded-full h-10 w-10 flex items-center justify-center shadow-lg hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring outline-none transition-all lg:bottom-6 lg:right-6"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                onClick={() => setShowChat((s) => !s)}
                aria-label="Toggle AI Assistant"
                data-tour="chat-button"
            >
                <MessageCircle className="h-5 w-5" />
            </motion.button> */}

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
                    <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/40"
                            onClick={handleHideAuth}
                            aria-hidden
                        />
                        <div className="relative z-10 w-full max-w-md">
                            <AuthPage onBack={handleHideAuth} />
                        </div>
                    </div>
                )
            }

            {/* Profile Modal */}
            {
                showProfile && (
                    <div className="fixed inset-0 z-999 flex items-center justify-center md:justify-end">
                        <div
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setShowProfile(false)}
                            aria-hidden
                        />
                        <div className="relative z-10 w-full">
                            <Profile onQuickAction={() => setShowProfile(false)} />
                        </div>
                    </div>
                )
            }
        </div >
    )
}
