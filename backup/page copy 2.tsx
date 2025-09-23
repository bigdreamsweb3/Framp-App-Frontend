"use client";

import { useState, useEffect } from "react";
import { Activity, Home, User, Wallet, MessageCircle, ArrowUpCircle, QrCode, History, X } from "lucide-react";
import { AppHeader } from "@/components/app_layout/app-header";
import { AIChat } from "@/components/ai-chat";
import { OnRampInterface } from "@/components/views/on-ramp-interface";
import { ActivityView } from "@/components/views/activity-view";
import { ProfileView } from "@/components/views/profile-view";
import { WalletView } from "@/components/views/wallet-view";
import { AuthPage } from "@/components/auth-page";
import { OnboardingTour } from "@/components/onboarding-tour";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";
import { useExchangeRateWithFallback } from "@/lib/hooks/useExchangeRate";
import { BillsView } from "@/components/views/bills-view";

interface PaymentMethod {
  id: string;
  type: "bank" | "wallet";
  name: string;
  details: string;
  accountName: string;
  isDefault: boolean;
  walletAddress?: string;
  bankCode?: string;
  accountNumber?: string;
}

export default function FrampOnRamp() {
  const [activeTab, setActiveTab] = useState("onramp");
  const { user } = useAuth();
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [activeView, setActiveView] = useState("onramp");
  const [showAuth, setShowAuth] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [tokenSymbol, setTokenSymbol] = useState("SOL");
  const [fiatCurrency, setFiatCurrency] = useState("NGN");
  const [selectedWallet, setSelectedWallet] = useState<PaymentMethod | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  // Exchange rate for the selected token (fallback rate of 850 for SOL/NGN)
  const { effectiveRate, convertNGNToToken: convertNGNToTokenAmount } =
    useExchangeRateWithFallback(tokenSymbol, 850);

  // Check for onboarding completion
  useEffect(() => {
    try {
      const hasCompletedOnboarding = localStorage.getItem("framp-onboarding-completed");
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }
    } catch (e) {
      console.warn("localStorage access failed, skipping onboarding check", e);
    }
  }, []);

  // Handle fiat amount input and convert to crypto
  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value) {
      const convertedAmount = convertNGNToTokenAmount(Number.parseFloat(value));
      setToAmount(convertedAmount.toFixed(6));
    } else {
      setToAmount("");
    }
  };

  // Recalculate conversion when token changes
  useEffect(() => {
    if (fromAmount && Number(fromAmount) > 0) {
      const convertedAmount = convertNGNToTokenAmount(Number.parseFloat(fromAmount));
      setToAmount(convertedAmount.toFixed(6));
    }
  }, [tokenSymbol, convertNGNToTokenAmount, fromAmount]);

  // Handle AI chat quick actions
  const handleChatQuickAction = (action: string) => {
    if (action.includes("buy") || action.includes("purchase")) {
      setActiveView("onramp");
      setShowChat(false);
    } else if (action.includes("bank") || action.includes("payment")) {
      setActiveView("wallet");
      setShowChat(false);
    }
  };

  // Auth handling
  const handleShowAuth = () => {
    if (!user) setShowAuth(true);
  };
  const handleHideAuth = () => setShowAuth(false);

  // Onboarding handling
  const handleOnboardingComplete = () => {
    try {
      localStorage.setItem("framp-onboarding-completed", "true");
    } catch (e) {
      console.warn("Failed to set onboarding completion in localStorage", e);
    }
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    try {
      localStorage.setItem("framp-onboarding-completed", "true");
    } catch (e) {
      console.warn("Failed to set onboarding skip in localStorage", e);
    }
    setShowOnboarding(false);
  };

  // Render the active view based on the current tab
  const renderCurrentView = () => {
    switch (activeView) {
      case "onramp":
        return (
          <OnRampInterface
            fromAmount={fromAmount}
            toAmount={toAmount}
            onFromAmountChange={handleFromAmountChange}
            tokenSymbol={tokenSymbol}
            fiatCurrency={fiatCurrency}
            onCurrencyChange={setTokenSymbol}
            receiving={toAmount ? Number(toAmount) : 0}
            selectedWallet={selectedWallet}
            onWalletSelect={() => setActiveView("wallet")}
            selectedPaymentMethod={selectedPaymentMethod}
            onPaymentMethodSelect={setSelectedPaymentMethod}
          />
        );
      case "bills":
        return <BillsView />;
      case "activity":
        return <ActivityView />;
      case "profile":
        return <ProfileView isLoggedIn={!!user} onLogin={handleShowAuth} />;
      case "wallet":
        return (
          <WalletView
            isLoggedIn={!!user}
            onLogin={handleShowAuth}
            onWalletSelect={setSelectedWallet}
            selectedWallet={selectedWallet}
            onClose={() => setActiveView("onramp")}
          />
        );
      default:
        return null; // Avoid rendering anything for unknown views
    }
  };

  if (showAuth) {
    return <AuthPage onBack={handleHideAuth} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        onAuthClick={handleShowAuth}
        chatActive={showChat}
        onChatToggle={() => setShowChat((prev) => !prev)}
        onProfileClick={() => setActiveView("profile")}
      />

      {/* Desktop Layout */}
      <div className="hidden lg:flex h-[calc(100vh-4rem)]">
        <div className="flex-1 container mx-auto px-6 py-6 mt-[35px] max-w-7xl">
          {renderCurrentView()}
        </div>
        <div className="w-80 bg-card/30 backdrop-blur-sm border-l border-border/50 p-6">
          <div className="space-y-4">
            <Button
              variant={activeView === "onramp" ? "default" : "ghost"}
              onClick={() => setActiveView("onramp")}
              className="w-full justify-start gap-2 rounded-xl"
              aria-label="Go to Gate (On-Ramp)"
            >
              <ArrowUpCircle className="h-4 w-4" />
              Gate
            </Button>
            <Button
              variant={activeView === "bills" ? "default" : "ghost"}
              onClick={() => setActiveView("bills")}
              className="w-full justify-start gap-2 rounded-xl"
              aria-label="Go to Bills"
            >
              <QrCode className="h-4 w-4" />
              Bills
            </Button>
            <Button
              variant={activeView === "activity" ? "default" : "ghost"}
              onClick={() => setActiveView("activity")}
              className="w-full justify-start gap-2 rounded-xl"
              aria-label="Go to Activity"
            >
              <Activity className="h-4 w-4" />
              Activity
            </Button>
            <Button
              variant={activeView === "wallet" ? "default" : "ghost"}
              onClick={() => setActiveView("wallet")}
              className="w-full justify-start gap-2 rounded-xl"
              aria-label="Go to Wallets & Banks"
            >
              <Wallet className="h-4 w-4" />
              Wallets & Banks
            </Button>
            <Button
              variant={activeView === "profile" ? "default" : "ghost"}
              onClick={() => setActiveView("profile")}
              className="w-full justify-start gap-2 rounded-xl"
              aria-label="Go to Profile"
            >
              <User className="h-4 w-4" />
              Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        <main className="container mx-auto px-4 py-6 max-w-lg">
          <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
            <TabsList className="grid w-full grid-cols-5 mb-6">
              <TabsTrigger value="onramp" className="text-xs" aria-label="Gate (On-Ramp)">
                <ArrowUpCircle className="w-4 h-4 mr-1" />
                Gate
              </TabsTrigger>
              <TabsTrigger value="bills" className="text-xs" aria-label="Bills">
                <QrCode className="w-4 h-4 mr-1" />
                Bills
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-xs" aria-label="Activity">
                <History className="w-4 h-4 mr-1" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="wallet" className="text-xs" aria-label="Wallet">
                <Wallet className="w-4 h-4 mr-1" />
                Wallet
              </TabsTrigger>
              <TabsTrigger value="profile" className="text-xs" aria-label="Profile">
                <User className="w-4 h-4 mr-1" />
                Profile
              </TabsTrigger>
            </TabsList>

            <div className="container mx-auto max-w-lg pb-20">
              {renderCurrentView()}
            </div>
          </Tabs>
        </main>
      </div>

      {/* Floating AI Chat Button */}
      <motion.button
        className="fixed bottom-4 right-4 bg-primary text-primary-foreground rounded-full h-10 w-10 flex items-center justify-center shadow-lg hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-ring outline-none transition-all lg:bottom-6 lg:right-6"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        onClick={() => setShowChat(!showChat)}
        aria-label="Toggle AI Assistant"
        data-tour="chat-button"
      >
        <MessageCircle className="h-5 w-5" />
      </motion.button>

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

      {showOnboarding && (
        <OnboardingTour
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </div>
  );
}