"use client";

import { useState, useEffect } from "react";
import { Activity, Home, User, Wallet, MessageCircle } from "lucide-react";
import { AppHeader } from "@/components/app_layout/app-header";
import { AIChat } from "@/components/ai-chat";
import { RampInterface } from "@/components/ramp-interface";
import { ActivityView } from "@/components/views/activity-view";
import { ProfileView } from "@/components/views/profile-view";
import { WalletView } from "@/components/views/wallet-view";
import { AuthPage } from "@/components/auth-page";
import { OnboardingTour } from "@/components/onboarding-tour";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useExchangeRateWithFallback } from "@/lib/hooks/useExchangeRate";

import BottomNavbar from "@/components/app_layout/bottom-nav";

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
  const { user } = useAuth();
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [activeView, setActiveView] = useState("onramp");
  const [showAuth, setShowAuth] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [tokenSymbol, setTokenSymbol] = useState("SOL"); // Start with SOL instead of NGN
  const [fiatCurrency, setFiatCurrency] = useState("NGN"); // Start with NGN
  const [selectedWallet, setSelectedWallet] = useState<PaymentMethod | null>(
    null
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    string | null
  >(null);

  // Get exchange rate for the selected token
  const { effectiveRate, convertNGNToToken: convertNGNToTokenAmount } =
    useExchangeRateWithFallback(tokenSymbol, 850);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem(
      "framp-onboarding-completed"
    );
    if (!hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, []);

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
      const convertedAmount = convertNGNToTokenAmount(
        Number.parseFloat(fromAmount)
      );
      setToAmount(convertedAmount.toFixed(6));
    }
  }, [tokenSymbol, convertNGNToTokenAmount, fromAmount]);

  const handleChatQuickAction = (action: string) => {
    if (action.includes("buy") || action.includes("purchase")) {
      setActiveView("onramp");
      setShowChat(false);
    } else if (action.includes("bank") || action.includes("payment")) {
      setActiveView("wallet");
      setShowChat(false);
    }
  };

  const handleShowAuth = () => setShowAuth(true);
  const handleHideAuth = () => setShowAuth(false);

  const handleOnboardingComplete = () => {
    localStorage.setItem("framp-onboarding-completed", "true");
    setShowOnboarding(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem("framp-onboarding-completed", "true");
    setShowOnboarding(false);
  };

  const renderCurrentView = () => {
    switch (activeView) {
      case "onramp":
        return (
          <RampInterface
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
        return (
          <RampInterface
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
        onProfileClick={() => setActiveView("profile")} // ✅ enable Profile from header
      />

      {/* Optionally, hide main content when chat is active */}
      {!showChat && (
        <>
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
            {/* <motion.button
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
            </motion.button> */}
          </div>

          {/* Mobile Layout */}
          <div className="lg:hidden">
            <div className="container mx-auto px-4 py-6 max-w-md pb-20">
              {renderCurrentView()}
            </div>
            <BottomNavbar
              activeView={activeView}
              onChangeView={setActiveView}
            />
          </div>
        </>
      )}

      {/* Chat overlay, always on top */}
      {showChat && (
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
