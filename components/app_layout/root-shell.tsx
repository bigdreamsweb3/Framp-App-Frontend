"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { SideHeader } from "./side-header"
import { Button } from "@/components/ui/button"
import {
    ArrowUpCircle,
    QrCode,
    PiggyBank,
    Wallet as WalletIcon,
    Activity as ActivityIcon,
} from "lucide-react"
import { AppHeader } from "./app-header"
import { motion } from "framer-motion"
import { MessageCircle, X } from "lucide-react"
import { AIChat } from "@/components/ai-chat"
import { AuthPage } from "@/components/auth-page"
import { Profile } from "@/components/modals/profile"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUI } from "@/context/UIContext"

export default function RootShell({ children }: { children: React.ReactNode }) {
    const [showAuth, setShowAuth] = useState(false)
    const [showProfile, setShowProfile] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const [activeView, setActiveView] = useState<string>("onramp")

    const router = useRouter()
    const pathname = usePathname() || "/"

    // Keep active tab synced with current route
    useEffect(() => {
        if (pathname === "/") setActiveView("onramp")
        else if (pathname === "/bills") setActiveView("bills")
        else if (pathname === "/save") setActiveView("save")
        else if (pathname === "/activity") setActiveView("activity")
        else if (pathname.startsWith("/wallets")) setActiveView("wallets")
    }, [pathname])

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
            router.push("/wallet")
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

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Desktop Layout */}
            <div className="hidden md:flex h-screen overflow-hidden bg-muted backdrop-blur-sm">
                {/* Sidebar */}
                <div className="flex flex-col justify-between h-full w-80 border-r bg-muted backdrop-blur-md">
                    <div>
                        <SideHeader
                            onAuthClick={handleShowAuth}
                            profileActive={showProfile}
                            onProfileToggle={() => setShowProfile((p) => !p)}
                        />

                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-muted-foreground">
                                    Framp Gateway
                                </h3>
                                <p className="text-xs text-muted-foreground/70">
                                    Your gateway to doing more with crypto.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <Link href="/">
                                        <Button
                                            className="w-full justify-start gap-2 rounded-xl"
                                            variant={pathname === "/" ? "default" : "ghost"}
                                        >
                                            <ArrowUpCircle className="h-4 w-4" />
                                            Gate
                                        </Button>
                                    </Link>
                                </div>

                                <div>
                                    <Link href="/bills">
                                        <Button
                                            className="w-full justify-start gap-2 rounded-xl"
                                            variant={pathname === "/bills" ? "default" : "ghost"}
                                        >
                                            <QrCode className="h-4 w-4" />
                                            Bills
                                        </Button>
                                    </Link>
                                </div>
                                <div>
                                    <Link href="/save">
                                        <Button
                                            className="w-full justify-start gap-2 rounded-xl"
                                            variant={pathname === "/save" ? "default" : "ghost"}
                                        >
                                            <PiggyBank className="h-4 w-4 text-emerald-500" />
                                            Save
                                        </Button>
                                    </Link>
                                </div>

                                <div>
                                    <Link href="/wallets">
                                        <Button
                                            className="w-full justify-start gap-2 rounded-xl"
                                            variant={pathname?.startsWith("/wallet") ? "default" : "ghost"}
                                        >
                                            <WalletIcon className="h-4 w-4" />
                                            Wallets
                                        </Button>
                                    </Link>
                                </div>

                                <div>
                                    <Link href="/activity">
                                        <Button
                                            className="w-full justify-start gap-2 rounded-xl"
                                            variant={pathname === "/activity" ? "default" : "ghost"}
                                        >
                                            <ActivityIcon className="h-4 w-4" />
                                            Activity
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto bg-background">
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

                <main className="container mx-auto px-4 py-6 max-w-md pb-24">
                    <div className="flex flex-row items-center gap-2 h-fit mb-6">
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
                                    <PiggyBank className="h-4 w-4 text-emerald-500" />
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

                        {/* 
                        <Link
                            href="/activity"
                            onClick={() => setActiveView("activity")}
                            className={`flex flex-col items-center text-xs p-2 hover:bg-muted/20 justify-center rounded-full bg-muted w-7 ${activeView === "activity" ? "text-primary" : "text-muted-foreground text-xs"
                                }`}
                        >
                            <ActivityIcon className="w-4 h-4" />
                        </Link> */}


                    </div>
                    {children}
                </main>



            </div >

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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div
                            className="absolute inset-0 bg-black/40"
                            onClick={() => setShowProfile(false)}
                            aria-hidden
                        />
                        <div className="relative z-10 w-full max-w-2xl p-4">
                            <Profile onQuickAction={() => setShowProfile(false)} />
                        </div>
                    </div>
                )
            }
        </div >
    )
}
