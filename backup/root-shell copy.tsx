"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SideHeader } from "../components/app_layout/side-header";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, QrCode, PiggyBank, Wallet as WalletIcon, Activity as ActivityIcon } from "lucide-react";
import { AppHeader } from "../components/app_layout/app-header";
import { AuthPage } from "@/components/auth-page";
import { Profile } from "@/components/modals/profile-modal";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function RootShell({ children }: { children: React.ReactNode }) {
    const [showAuth, setShowAuth] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [activeView, setActiveView] = useState<string>("onramp");

    const handleShowAuth = () => setShowAuth(true);
    const handleHideAuth = () => setShowAuth(false);
    const pathname = usePathname() || "/";

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Desktop Layout */}
            <div className="hidden md:flex h-screen overflow-hidden bg-muted backdrop-blur-sm">
                <div className="flex flex-col justify-between h-full w-80 border-r bg-muted backdrop-blur-md">
                    <div>
                        <SideHeader
                            onAuthClick={handleShowAuth}
                            profileActive={showProfile}
                            onProfileToggle={() => setShowProfile((p) => !p)}
                        />

                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-muted-foreground">Framp Gateway</h3>
                                <p className="text-xs text-muted-foreground/70">Your gateway to doing more with crypto.</p>
                            </div>

                            <Link href="/">
                                <Button
                                    className="w-full justify-start gap-2 rounded-xl"
                                    variant={pathname === "/" ? "default" : "ghost"}
                                >
                                    <ArrowUpCircle className="h-4 w-4" />
                                    Ramp
                                </Button>
                            </Link>

                            <Link href="/bills">
                                <Button
                                    className="w-full justify-start gap-2 rounded-xl"
                                    variant={pathname === "/bills" ? "default" : "ghost"}
                                >
                                    <QrCode className="h-4 w-4" />
                                    Pay
                                </Button>
                            </Link>

                            <Link href="/save">
                                <Button
                                    className="w-full justify-start gap-2 rounded-xl"
                                    variant={pathname === "/save" ? "default" : "ghost"}
                                >
                                    <PiggyBank className="h-4 w-4 text-emerald-500" />
                                    Save
                                </Button>
                            </Link>

                            <Link href="/activity">
                                <Button
                                    className="w-full justify-start gap-2 rounded-xl"
                                    variant={pathname === "/activity" ? "default" : "ghost"}
                                >
                                    <ActivityIcon className="h-4 w-4" />
                                    Activity
                                </Button>
                            </Link>

                            <Link href="/wallet">
                                <Button
                                    className="w-full justify-start gap-2 rounded-xl"
                                    variant={pathname?.startsWith("/wallet") ? "default" : "ghost"}
                                >
                                    <WalletIcon className="h-4 w-4" />
                                    Wallets
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

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
            <div className="lg:hidden">
                <AppHeader
                    onAuthClick={handleShowAuth}
                    chatActive={false}
                    onChatToggle={() => {}}
                    profileActive={showProfile}
                    onProfileToggle={() => setShowProfile((p) => !p)}
                />

                <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
                    <TabsList className="grid w-full grid-cols-4 mb-6">
                        <TabsTrigger value="onramp" className="text-xs">
                            <ArrowUpCircle className="h-4 w-4" />
                            Ramp
                        </TabsTrigger>
                        <TabsTrigger value="bills" className="text-xs">
                            <QrCode className="w-4 h-4 mr-1" />
                            Pay
                        </TabsTrigger>
                        <TabsTrigger value="save" className="text-xs">
                            <PiggyBank className="h-4 w-4 text-emerald-500" />
                            Save
                        </TabsTrigger>
                        <TabsTrigger value="activity" className="text-xs">
                            <ActivityIcon className="w-4 h-4 mr-1" />
                            Activity
                        </TabsTrigger>
                    </TabsList>

                    <main className="container mx-auto px-4 py-6 max-w-md pb-24">
                        {children}
                    </main>
                </Tabs>

                {/* Mobile bottom nav (4 columns) */}
                <nav className="fixed bottom-4 left-1/2 transform -translate-x-1/2 w-[min(96%,640px)] bg-card/80 backdrop-blur-md border border-border/30 rounded-xl px-3 py-2 shadow-lg md:hidden">
                    <div className="grid grid-cols-4 gap-2">
                        <Link href="/" className="flex flex-col items-center text-xs py-2 hover:bg-muted/20 rounded-lg justify-center">
                            <ArrowUpCircle className="w-5 h-5" />
                            <span>Ramp</span>
                        </Link>
                        <Link href="/bills" className="flex flex-col items-center text-xs py-2 hover:bg-muted/20 rounded-lg justify-center">
                            <QrCode className="w-5 h-5" />
                            <span>Pay</span>
                        </Link>
                        <Link href="/save" className="flex flex-col items-center text-xs py-2 hover:bg-muted/20 rounded-lg justify-center">
                            <PiggyBank className="w-5 h-5 text-emerald-500" />
                            <span>Save</span>
                        </Link>
                        <Link href="/wallet" className="flex flex-col items-center text-xs py-2 hover:bg-muted/20 rounded-lg justify-center">
                            <WalletIcon className="w-5 h-5" />
                            <span>Wallet</span>
                        </Link>
                    </div>
                </nav>
            </div>

            {/* Auth Modal */}
            {showAuth && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40" onClick={handleHideAuth} aria-hidden />
                    <div className="relative z-10 w-full max-w-md">
                        <AuthPage onBack={handleHideAuth} />
                    </div>
                </div>
            )}

            {/* Profile Modal */}
            {showProfile && (
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
            )}
        </div>
    );
}
