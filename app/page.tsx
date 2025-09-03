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
import Navbar from "@/components/Navbar"



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
    <div className="min-h-screen bg-background">
      <AppHeader
        onAuthClick={handleShowAuth}
        chatActive={showChat}
        onChatToggle={() => setShowChat((prev) => !prev)}
      />

      {/* Optionally, hide main content when chat is active */}
      {!showChat && (
        <>
          {/* Desktop Layout */}
          <div className="hidden lg:flex h-[calc(100vh-4rem)]">
            <div className="flex-1 container mx-auto px-4 py-6  mt-[35px] max-w-md">{renderCurrentView()}</div>

            <div className="w-80 bg-card/30 backdrop-blur-sm border-l border-border/50 p-6">
              <div className="space-y-4">
                <Button
                  variant={activeView === "onramp" ? "default" : "ghost"}
                  onClick={() => setActiveView("onramp")}
                  className="w-full justify-start gap-2 rounded-xl"
                >
                  <Home className="h-4 w-4" />
                  Home
                </Button>
                <Button
                  variant={activeView === "activity" ? "default" : "ghost"}
                  onClick={() => setActiveView("activity")}
                  className="w-full justify-start gap-2 rounded-xl"
                >
                  <Activity className="h-4 w-4" />
                  Activity
                </Button>

                {/* <Button
                  variant={activeView === "chat" ? "default" : "ghost"}
                  onClick={() => setActiveView("chat")}
                  className="w-full justify-start gap-2 rounded-xl"
                  data-tour="chat-sidebar"
                >
                  <MessageCircle className="h-4 w-4" />
                  AI Assistant
                </Button> */}

                {/* 
                <Button
                  variant={activeView === "profile" ? "default" : "ghost"}
                  onClick={() => setActiveView("profile")}
                  className="w-full justify-start gap-2 rounded-xl"
                >
                  <User className="h-4 w-4" />
                  Profile
                </Button> */}
                <Button
                  variant={activeView === "wallet" ? "default" : "ghost"}
                  onClick={() => setActiveView("wallet")}
                  className="w-full justify-start gap-2 rounded-xl"
                >
                  <Wallet className="h-4 w-4" />
                  Wallets & Banks
                </Button>

              </div>
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
          </div>


          {/* Mobile Layout */}
          <div className="lg:hidden">
            <div className="container mx-auto px-4 py-6 max-w-md pb-20">{renderCurrentView()}</div>
            <Navbar activeView={activeView} onChangeView={setActiveView} />
            {/* <div className="fixed bottom-0 left-0 right-0 bg-card/80 backdrop-blur-sm border-t border-border/50 px-4 py-3">
              <div className="flex items-center justify-around max-w-md mx-auto">
                <Button
                  variant={activeView === "onramp" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveView("onramp")}
                  className="flex items-center justify-center h-12 w-12 rounded-2xl p-0"
                >
                  <Home className="h-5 w-5" />
                </Button>
                <Button
                  variant={activeView === "activity" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setActiveView("activity")}
                  className="flex items-center justify-center h-12 w-12 rounded-2xl p-0"
                >
                  <Activity className="h-5 w-5" />
                </Button>
          

            <Button
              variant={activeView === "wallet" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveView("wallet")}
              className="flex items-center justify-center h-12 w-12 rounded-2xl p-0"
            >
              <Wallet className="h-5 w-5" />
            </Button>

          </div>
        </div> */}
    </div>
        </>
      )
}

{/* Chat overlay, always on top */ }
{
  showChat && (
    <div className="fixed inset-0 z-[100] flex justify-end items-end bg-black/70">
      <motion.div
        className="bg-card/95 backdrop-blur-md w-full h-full p-4 shadow-xl
        lg:w-[min(90vw,28rem)] lg:h-full"
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
  )
}

{ showOnboarding && <OnboardingTour onComplete={handleOnboardingComplete} onSkip={handleOnboardingSkip} /> }
    </div >
  )
}
