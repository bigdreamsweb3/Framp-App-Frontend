"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Plus, Copy, Check, X, Loader2, Banknote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Account = {
  id: string;
  type: "bank" | "wallet";
  name: string;
  details: string;
  accountName: string;
  isDefault?: boolean;
  walletAddress?: string;
  bankCode?: string;
  accountNumber?: string;
}

interface BankAccountsViewProps {
  onAccountSelect: (account: Account) => void;
  selectedAccount?: Account | null;
  onClose: () => void;
}

export const BankAccountsView: React.FC<BankAccountsViewProps> = ({ 
  onAccountSelect, 
  selectedAccount, 
  onClose 
}) => {
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [newAccount, setNewAccount] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    bankCode: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [addingAccount, setAddingAccount] = useState(false);

  // Mock accounts - replace with real API calls
  const [accounts, setAccounts] = useState<Account[]>([]);

  useEffect(() => {
    // Simulate API loading
    const timer = setTimeout(() => {
      const mockAccounts: Account[] = [
        {
          id: "acct_1",
          type: "bank",
          name: "GTBank",
          details: "GTBank • 0123456789",
          accountName: "John Doe",
          isDefault: true,
          bankCode: "058",
          accountNumber: "0123456789",
        },
        {
          id: "acct_2",
          type: "bank",
          name: "First Bank",
          details: "First Bank • 9876543210",
          accountName: "John Doe",
          isDefault: false,
          bankCode: "011",
          accountNumber: "9876543210",
        },
      ];
      setAccounts(mockAccounts);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleAddAccount = async () => {
    if (!newAccount.bankName || !newAccount.accountNumber || !newAccount.accountName) {
      setError("Bank name, account number, and account name are required");
      return;
    }

    try {
      setError(null);
      setAddingAccount(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newAcct: Account = {
        id: `acct_${Date.now()}`,
        type: "bank",
        name: newAccount.bankName,
        details: `${newAccount.bankName} • ${newAccount.accountNumber}`,
        accountName: newAccount.accountName,
        bankCode: newAccount.bankCode,
        accountNumber: newAccount.accountNumber,
        isDefault: accounts.length === 0
      };

      setAccounts(prev => [...prev, newAcct]);
      setNewAccount({ bankName: "", accountNumber: "", accountName: "", bankCode: "" });
      setShowAddAccount(false);
    } catch (err) {
      console.error("Failed to add account:", err);
      setError("Failed to add bank account. Please try again.");
    } finally {
      setAddingAccount(false);
    }
  };

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
      setError("Failed to copy account number.");
    }
  };

  const handleSelect = (account: Account) => {
    onAccountSelect(account);
    onClose();
  };

  // Loading Skeleton Component
  const AccountSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="p-4 rounded-xl border border-border/50 bg-muted/20 animate-pulse"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
            <div className="h-4 bg-muted-foreground/20 rounded w-3/4" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 bg-muted-foreground/20 rounded w-1/2" />
            <div className="w-6 h-6 rounded-lg bg-muted-foreground/20 ml-auto" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Main Panel - Full screen on mobile, 70% width on desktop */}
      <div className="relative bg-background w-full h-full md:h-auto md:max-h-[85vh] md:w-[70%] md:max-w-4xl md:rounded-2xl border-border/50 md:border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-primary/10">
              <Building className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">Select Bank Account</h2>
              <p className="text-sm text-muted-foreground">Choose receiving bank account</p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-muted"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 h-[calc(100%-80px)] md:max-h-[calc(85vh-80px)] overflow-y-auto">
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-sm">
              {error}
            </div>
          )}

          {showAddAccount ? (
            <div className="space-y-6 max-w-md mx-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Add Bank Account</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddAccount(false)}
                  className="h-8 w-8 rounded-lg"
                  disabled={addingAccount}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Bank Name</Label>
                  <Input
                    placeholder="e.g., GTBank, First Bank"
                    value={newAccount.bankName}
                    onChange={(e) => setNewAccount({ ...newAccount, bankName: e.target.value })}
                    className="rounded-lg"
                    disabled={addingAccount}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Account Number</Label>
                  <Input
                    placeholder="Enter account number"
                    value={newAccount.accountNumber}
                    onChange={(e) => setNewAccount({ ...newAccount, accountNumber: e.target.value })}
                    className="rounded-lg"
                    disabled={addingAccount}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Account Name</Label>
                  <Input
                    placeholder="Enter account holder name"
                    value={newAccount.accountName}
                    onChange={(e) => setNewAccount({ ...newAccount, accountName: e.target.value })}
                    className="rounded-lg"
                    disabled={addingAccount}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Bank Code (Optional)</Label>
                  <Input
                    placeholder="e.g., 058, 011"
                    value={newAccount.bankCode}
                    onChange={(e) => setNewAccount({ ...newAccount, bankCode: e.target.value })}
                    className="rounded-lg"
                    disabled={addingAccount}
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleAddAccount}
                    disabled={addingAccount || !newAccount.bankName || !newAccount.accountNumber || !newAccount.accountName}
                    className="flex-1 rounded-lg bg-primary hover:bg-primary/90"
                  >
                    {addingAccount ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Account"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddAccount(false)}
                    disabled={addingAccount}
                    className="flex-1 rounded-lg"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : isLoading ? (
            <div className="space-y-6">
              {/* Loading State */}
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="relative mb-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Loading Accounts</h3>
                  <p className="text-sm text-muted-foreground">Fetching your bank accounts...</p>
                </div>
              </div>
              <AccountSkeleton />
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-8">
              <Banknote className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                No Bank Accounts
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Get started by adding your first bank account
              </p>
              <Button
                onClick={() => setShowAddAccount(true)}
                className="rounded-lg bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Account
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Accounts Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {accounts.map((account) => (
                  <div
                    key={account.id}
                    onClick={() => handleSelect(account)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedAccount?.id === account.id 
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                        : "border-border/50 hover:border-border hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${
                            selectedAccount?.id === account.id ? "bg-primary" : "bg-muted-foreground/50"
                          }`} />
                          <span className="font-medium text-sm truncate">{account.name}</span>
                          {account.isDefault && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mb-1">
                          {account.accountName}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground font-mono">
                            {account.accountNumber}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 rounded-lg hover:bg-muted"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCopy(account.accountNumber || "", account.id);
                            }}
                          >
                            {copiedId === account.id ? (
                              <Check className="w-3 h-3 text-green-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {copiedId === account.id && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-foreground text-background text-xs px-2 py-1 rounded-lg"
                        >
                          Copied!
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>

              {/* Add Account Button */}
              <Button
                onClick={() => setShowAddAccount(true)}
                variant="outline"
                className="w-full rounded-lg border-border/50 hover:bg-muted/50 py-3"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Bank Account
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BankAccountsView;