"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building, Plus, Copy, Check, X, Loader2, Banknote, Search, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner"; // Assuming you have a toast library for copy feedback

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
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 10;
  const [displayCount, setDisplayCount] = useState(10);

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

  // Reset on search change
  useEffect(() => {
    setExpandedId(null);
    setDisplayCount(10);
  }, [searchTerm]);

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.details.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const paginatedAccounts = filteredAccounts.slice(0, displayCount);

  const loadMore = () => {
    setDisplayCount(prev => prev + ITEMS_PER_PAGE);
  };

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
      toast.success("Copied to clipboard");
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

  const toggleExpanded = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedId(expandedId === id ? null : id);
  };

  const getBankIcon = () => (
    <Building className="h-4 w-4 text-green-600" />
  );

  const getBankBg = () => "bg-green-50 dark:bg-green-900/30";

  const getBankLabel = (account: Account) => account.type === "bank" ? "Bank" : "Wallet";

  const truncateAccountNumber = (number: string, start = 4, end = 4): string => {
    return `${number.slice(0, start)}...${number.slice(-end)}`;
  };

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
            <div className="space-y-2 p-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-md" />
              ))}
            </div>
          ) : filteredAccounts.length === 0 ? (
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
            <div className="space-y-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input
                  placeholder="Search accounts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-7 h-8 text-xs focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none rounded-md"
                />
              </div>

              {/* Accounts List */}
              <div className="space-y-2 max-h-fit overflow-y-auto">
                {paginatedAccounts.map((account) => (
                  <div key={account.id} className="space-y-1 border rounded-md overflow-hidden bg-card">
                    <div
                      className={`flex items-center justify-between p-2 cursor-pointer hover:bg-muted transition-colors ${
                        selectedAccount?.id === account.id ? "bg-primary/5" : ""
                      }`}
                      onClick={() => handleSelect(account)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-shrink-0">
                          <div className={`w-8 h-8 rounded flex items-center justify-center ${getBankBg()}`}>
                            {getBankIcon()}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1 mb-1">
                            <span className="text-xs font-medium truncate">
                              {getBankLabel(account)}
                              {account.name && ` (${account.name})`}
                            </span>
                            {account.isDefault && <Badge variant="secondary" className="text-xs">Default</Badge>}
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {account.accountName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3">
                        <div className="flex flex-col items-end flex-shrink-0 text-xs space-y-1">
                          <span className="font-medium text-xs">{account.details}</span>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span
                                  className="font-mono truncate cursor-pointer text-xs text-muted-foreground"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCopy(account.accountNumber || "", account.id);
                                  }}
                                >
                                  {truncateAccountNumber(account.accountNumber || "")}
                                </span>
                              </TooltipTrigger>
                              <TooltipContent>Click to copy</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <AnimatePresence>
                            {copiedId === account.id && (
                              <motion.span
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-xs text-green-600"
                              >
                                Copied!
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => toggleExpanded(account.id, e)}
                          className="h-6 w-6 p-0 text-xs text-muted-foreground hover:text-foreground"
                        >
                          <ChevronDown className={`h-3 w-3 transition-transform ${expandedId === account.id ? 'rotate-180' : ''}`} />
                        </Button>
                      </div>
                    </div>
                    {expandedId === account.id && (
                      <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 px-2 pb-2">
                        <p className="flex items-center justify-between">
                          <span>Full Account Number:</span>
                          <span className="font-mono truncate">{account.accountNumber}</span>
                        </p>
                        {account.bankCode && (
                          <p className="flex items-center justify-between">
                            <span>Bank Code:</span>
                            <span>{account.bankCode}</span>
                          </p>
                        )}
                        {!account.isDefault && (
                          <p className="flex items-center justify-between">
                            <span>Set as Default:</span>
                            <span>Mock: Set Default</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Load More */}
              {displayCount < filteredAccounts.length && (
                <div className="flex flex-row items-center justify-between gap-2 pt-2">
                  <p className="text-xs text-muted-foreground">
                    Showing {displayCount} of {filteredAccounts.length} accounts
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadMore}
                    className="rounded-md h-8"
                  >
                    Load More
                  </Button>
                </div>
              )}

              {/* Add Account Button */}
              <Button
                onClick={() => setShowAddAccount(true)}
                variant="outline"
                className="w-full rounded-md border-border/50 hover:bg-muted/50 py-3 mt-4"
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