"use client";

import { useState, useEffect } from "react";
import { Activity, Wallet, ArrowUpCircle, QrCode, PiggyBank } from "lucide-react";
import { AppHeader } from "@/components/app_layout/app-header";
import { RampInterface } from "@/components/views/ramp-interface";
import { ActivityView } from "@/components/views/activity-view";
import { ProfileView } from "@/components/views/profile-view";
import { WalletView } from "@/components/views/selectors/wallet-selector-view";
import BankAccountsView from "@/components/views/selectors/bank-accounts-selector-view";
import { AuthPage } from "@/components/auth-page";
import { OnboardingTour } from "@/components/onboarding-tour";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAuth } from "@/context/AuthContext";
import { useExchangeRateWithFallback } from "@/lib/hooks/useExchangeRate";
import { BillsView } from "@/components/views/bills-view";
// import { Profile } from "@/components/modals/profile-modal";
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
  const [showChat, setShowChat] = useState(false)

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
            selectedWallet={selectedWallet as any}
            onWalletSelect={() => setActiveView("wallet")}
            onAccountSelect={() => setActiveView("bank")}
            selectedPaymentMethod={selectedPaymentMethod}
            onPaymentMethodSelect={setSelectedPaymentMethod}
          />
        );
      case "bills":
        return <BillsView />;
      case "save":
        return <SaveView />;
      case "activity":
        return <ActivityView />;
      case "profile":
        return <ProfileView isLoggedIn={!!user} onLogin={handleShowAuth} />;
      case "wallet":
        return (
          <WalletView
            // onLogin={handleShowAuth}
            onWalletSelect={setSelectedWallet}
            selectedWallet={selectedWallet}
            onClose={() => setActiveView("onramp")}
          />
        );
      case "bank":
        return (
          <BankAccountsView
            onAccountSelect={(acct: any) => {
              setSelectedWallet(acct)
              setActiveView("onramp")
            }}
            selectedAccount={selectedWallet as any}
            onClose={() => setActiveView("onramp")}
          />
        )
      default:
        return null;
    }
  };


  return <>{renderCurrentView()}</>;
}

/* -------------------------------
   SAVE VIEW COMPONENT
--------------------------------*/
const SaveView = () => (
  <div className="space-y-2">
    <h2 className="text-lg font-semibold">Save with Framp</h2>
    <p className="text-muted-foreground">
      Grow your assets securely and access your crypto savings anytime.
    </p>
    <div className="mt-4 p-4 border border-border/40 rounded-xl bg-muted/40">
      <p className="text-sm text-muted-foreground">
        Saving feature coming soon — earn rewards while holding your crypto.
      </p>
    </div>
  </div>
)
