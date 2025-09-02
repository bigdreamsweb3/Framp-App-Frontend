"use client"

import { useState, useEffect } from "react"
import { Activity, Home, User, Wallet, MessageCircle } from "lucide-react"
import { AppHeader } from "@/components/app-header"
import { AIChat } from "@/components/ai-chat"
import { OnRampInterface } from "@/components/on-ramp-interface"
import { ActivityView } from "@/components/activity-view"
import { ProfileView } from "@/components/profile-view"
import { WalletView } from "@/components/wallet-view"
import { AuthPage } from "@/components/auth-page"
import { OnboardingTour } from "@/components/onboarding-tour"
import { Sidebar, SidebarContent, SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"



export default function FrampOnRamp() {
  const [fromAmount, setFromAmount] = useState("")
  const [toAmount, setToAmount] = useState("")
  const [activeView, setActiveView] = useState("onramp")
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [showChat, setShowChat] = useState(false)

  const ngnToSolRate = 850

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("framp-onboarding-completed")
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true)
    }
  }, [])

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value)
    if (value) {
      const convertedAmount = Number.parseFloat(value) / ngnToSolRate
      setToAmount(convertedAmount.toFixed(6))
    } else {
      setToAmount("")
    }
  }

  const handleChatQuickAction = (action: string) => {
    if (action.includes("buy") || action.includes("purchase")) {
      setActiveView("onramp")
      setShowChat(false)
    } else if (action.includes("bank") || action.includes("payment")) {
      setActiveView("wallet")
      setShowChat(false)
    }
  }

  const handleShowAuth = () => setShowAuth(true)
  const handleHideAuth = () => setShowAuth(false)
  const handleLogin = () => {
    setIsLoggedIn(true)
    setShowAuth(false)
  }

  const handleOnboardingComplete = () => {
    localStorage.setItem("framp-onboarding-completed", "true")
    setShowOnboarding(false)
  }

  const handleOnboardingSkip = () => {
    localStorage.setItem("framp-onboarding-completed", "true")
    setShowOnboarding(false)
  }

  const renderCurrentView = () => {
    switch (activeView) {
      case "onramp":
        return (
          <OnRampInterface
            fromAmount={fromAmount}
            toAmount={toAmount}
            onFromAmountChange={handleFromAmountChange}
            ngnToSolRate={ngnToSolRate}
          />
        )
      case "activity":
        return <ActivityView />
      case "profile":
        return <ProfileView isLoggedIn={isLoggedIn} onLogin={handleShowAuth} />
      case "wallet":
        return <WalletView isLoggedIn={isLoggedIn} onLogin={handleShowAuth} />
      default:
        return (
          <OnRampInterface
            fromAmount={fromAmount}
            toAmount={toAmount}
            onFromAmountChange={handleFromAmountChange}
            ngnToSolRate={ngnToSolRate}
          />
        )
    }
  }

  if (showAuth) {
    return <AuthPage onBack={handleHideAuth} />
  }

  return (
    <>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <AppHeader onAuthClick={handleShowAuth} />

        {/* Desktop Layout */}
        <div className="hidden lg:flex h-[calc(100vh-4rem)]">
          <SidebarProvider>
            <Sidebar side="left" variant="floating" collapsible="icon" className="bg-card/95 backdrop-blur-md border-r border-border/30 shadow-sm">
              <SidebarContent>
                <SidebarGroup>
                  <SidebarMenu>
                    <SidebarMenuButton
                      isActive={activeView === "onramp"}
                      onClick={() => setActiveView("onramp")}
                      tooltip="Home"
                      className="rounded-xl"
                    >
                      <Home className="h-4 w-4" />
                      <span>Home</span>
                    </SidebarMenuButton>
                    <SidebarMenuButton
                      isActive={activeView === "activity"}
                      onClick={() => setActiveView("activity")}
                      tooltip="Activity"
                      className="rounded-xl"
                    >
                      <Activity className="h-4 w-4" />
                      <span>Activity</span>
                    </SidebarMenuButton>
                    <SidebarMenuButton
                      isActive={activeView === "wallet"}
                      onClick={() => setActiveView("wallet")}
                      tooltip="Wallets & Banks"
                      className="rounded-xl"
                    >
                      <Wallet className="h-4 w-4" />
                      <span>Wallets & Banks</span>
                    </SidebarMenuButton>
                    <SidebarMenuButton
                      isActive={activeView === "profile"}
                      onClick={() => setActiveView("profile")}
                      tooltip="Profile"
                      className="rounded-xl"
                    >
                      <User className="h-4 w-4" />
                      <span>Profile</span>
                    </SidebarMenuButton>
                  </SidebarMenu>
                </SidebarGroup>
              </SidebarContent>
            </Sidebar>
          </SidebarProvider>
          <main className="flex-1 flex justify-center py-6 px-[max(1rem,2vw)]">
            <div className="w-full max-w-2xl">{renderCurrentView()}</div>
          </main>
        </div>

        {/* Floating AI Chat Button */}
        <motion.button
          className="fixed bottom-[max(1rem,2vh)] right-[max(1rem,2vw)] bg-primary text-primary-foreground rounded-full h-[max(2.5rem,5vh)] w-[max(2.5rem,5vh)] flex items-center justify-center shadow-lg hover:bg-primary/90 focus-visible:ring-[max(0.15rem,0.3vw)] focus-visible:ring-ring/50 focus-visible:border-ring outline-none transition-all"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          onClick={() => setShowChat(!showChat)}
          aria-label="Open AI Assistant"
          data-tour="chat-button6"
        >
          <MessageCircle className="h-[max(1rem,2vw)] w-[max(1rem,2vw)]" />
        </motion.button>

        {/* AI Chat Overlay */}
        {showChat && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/50">
            <motion.div
              className="bg-card/95 backdrop-blur-md w-full max-w-[min(90vw,28rem)] h-full p-4 shadow-xl"
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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>
              <AIChat onQuickAction={handleChatQuickAction} />
            </motion.div>
          </div>
        )}


        {/* Mobile Layout */}
        <div className="lg:hidden">
          <div className="container mx-auto px-[max(1rem,2vw)] py-6 max-w-md pb-[max(5rem,10vh)]">
            {renderCurrentView()}
          </div>
          <div className="fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-md border-t border-border/50 px-[max(1rem,2vw)] py-3 shadow-sm">
            <div className="flex items-center justify-around max-w-md mx-auto">
              <Button
                variant={activeView === "onramp" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView("onramp")}
                className="flex items-center justify-center h-[max(2.5rem,5vh)] w-[max(2.5rem,5vw)] rounded-2xl p-0"
              >
                <Home className="h-[max(1rem,2vw)] w-[max(1rem,2vw)]" />
              </Button>
              <Button
                variant={activeView === "activity" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView("activity")}
                className="flex items-center justify-center h-[max(2.5rem,5vh)] w-[max(2.5rem,5vw)] rounded-2xl p-0"
              >
                <Activity className="h-[max(1rem,2vw)] w-[max(1rem,2vw)]" />
              </Button>
              <Button
                variant={activeView === "wallet" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView("wallet")}
                className="flex items-center justify-center h-[max(2.5rem,5vh)] w-[max(2.5rem,5vw)] rounded-2xl p-0"
              >
                <Wallet className="h-[max(1rem,2vw)] w-[max(1rem,2vw)]" />
              </Button>
              <Button
                variant={activeView === "profile" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveView("profile")}
                className="flex items-center justify-center h-[max(2.5rem,5vh)] w-[max(2.5rem,5vw)] rounded-2xl p-0"
              >
                <User className="h-[max(1rem,2vw)] w-[max(1rem,2vw)]" />
              </Button>
            </div>
          </div>
        </div>


        {showOnboarding && <OnboardingTour onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} />}
      </div >
    </>
  )
}