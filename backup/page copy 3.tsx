"use client";

import { useState, useEffect } from "react";
import { Activity, Wallet, ArrowUpCircle, QrCode } from "lucide-react";
import { AppHeader } from "@/components/app_layout/app-header";
import { RampInterface } from "@/components/views/ramp-interface";
import { ActivityView } from "@/components/views/activity-view";
import { ProfileView } from "@/components/views/profile-view";
import { WalletView } from "@/components/views/wallet-view";
import { AuthPage } from "@/components/auth-page";
import { OnboardingTour } from "@/components/onboarding-tour";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAuth } from "@/context/AuthContext";
import { useExchangeRateWithFallback } from "@/lib/hooks/useExchangeRate";
import { BillsView } from "@/components/views/bills-view";
import { Profile } from "@/components/modals/profile-modal";
import { WalletMethod } from "@/types/wallet";
import { SideHeader } from "@/components/app_layout/side-header";

export default function FrampOnRamp() {
  const [activeTab, setActiveTab] = useState("send");
  const { user } = useAuth();
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const [activeView, setActiveView] = useState("onramp");
  const [showAuth, setShowAuth] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [tokenSymbol, setTokenSymbol] = useState("SOL");
  const [fiatCurrency, setFiatCurrency] = useState("NGN");
  const [selectedWallet, setSelectedWallet] = useState<WalletMethod | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  // Get exchange rate
  const { effectiveRate, convertNGNToToken: convertNGNToTokenAmount } =
    useExchangeRateWithFallback(tokenSymbol, 850);

  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem("framp-onboarding-completed");
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

  useEffect(() => {
    if (fromAmount && Number(fromAmount) > 0) {
      const convertedAmount = convertNGNToTokenAmount(Number.parseFloat(fromAmount));
      setToAmount(convertedAmount.toFixed(6));
    }
  }, [tokenSymbol, convertNGNToTokenAmount, fromAmount]);

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
        return null;
    }
  };

  if (showAuth) {
    return <AuthPage onBack={handleHideAuth} />;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row overflow-hidden">
      {/* ===== SIDEBAR (Desktop) ===== */}
      <div className="hidden lg:flex flex-col justify-between h-screen w-80 bg-muted/40 backdrop-blur-md border-r border-border/40 fixed left-0 top-0">
        <div>
          <SideHeader />
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-muted-foreground">
                Framp Gateway
              </h3>
              <p className="text-xs text-muted-foreground/70">
                Your gateway to doing more with crypto.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                variant={activeView === "onramp" ? "default" : "ghost"}
                onClick={() => setActiveView("onramp")}
                className="w-full justify-start gap-2 rounded-xl"
              >
                <ArrowUpCircle className="h-4 w-4" />
                Gate
              </Button>
              <Button
                variant={activeView === "bills" ? "default" : "ghost"}
                onClick={() => setActiveView("bills")}
                className="w-full justify-start gap-2 rounded-xl"
              >
                <QrCode className="h-4 w-4" />
                Bills
              </Button>
              <Button
                variant={activeView === "activity" ? "default" : "ghost"}
                onClick={() => setActiveView("activity")}
                className="w-full justify-start gap-2 rounded-xl"
              >
                <Activity className="h-4 w-4" />
                Activity
              </Button>
              <Button
                variant={activeView === "wallet" ? "default" : "ghost"}
                onClick={() => setActiveView("wallet")}
                className="w-full justify-start gap-2 rounded-xl"
              >
                <Wallet className="h-4 w-4" />
                Wallets
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT (Desktop Only) ===== */}
      <div className="hidden lg:block flex-1 ml-80 overflow-y-auto">
        <AppHeader
          onAuthClick={handleShowAuth}
          chatActive={false}
          onChatToggle={() => {}}
          profileActive={showProfile}
          onProfileToggle={() => setShowProfile((prev) => !prev)}
        />

        <div className="container mx-auto px-6 py-6 mt-[20px] max-w-7xl">
          {renderCurrentView()}
        </div>
      </div>

      {/* ===== MOBILE VIEW ===== */}
      <div className="lg:hidden flex-1">
        <AppHeader
          onAuthClick={handleShowAuth}
          chatActive={false}
          onChatToggle={() => {}}
          profileActive={showProfile}
          onProfileToggle={() => setShowProfile((prev) => !prev)}
        />

        <main className="container mx-auto px-4 py-6 max-w-md">
          <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="onramp" className="text-xs">
                <ArrowUpCircle className="h-4 w-4" />
                Gate
              </TabsTrigger>
              <TabsTrigger value="bills" className="text-xs">
                <QrCode className="w-4 h-4 mr-1" />
                Bills
              </TabsTrigger>
              <TabsTrigger value="activity" className="text-xs">
                <Activity className="w-4 h-4 mr-1" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="wallet" className="text-xs">
                <Wallet className="w-4 h-4 mr-1" />
                Wallet
              </TabsTrigger>
            </TabsList>

            <div className="pb-20">{renderCurrentView()}</div>
          </Tabs>
        </main>
      </div>

      {/* ===== PROFILE OVERLAY ===== */}
      {showProfile && (
        <div className="fixed inset-0 z-[100] flex justify-end items-end bg-black/70">
          <motion.div
            className="bg-background backdrop-blur-md w-full h-full p-4 shadow-xl lg:w-[min(90vw,28rem)] lg:h-full"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2"
              onClick={() => setShowProfile(false)}
              aria-label="Close Profile"
            >
              ✕
            </Button>
            <Profile />
          </motion.div>
        </div>
      )}

      {/* ===== ONBOARDING ===== */}
      {showOnboarding && (
        <OnboardingTour
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingSkip}
        />
      )}
    </div>
  );
}
