"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wallet, Plus, Building2, Trash2, Copy, Check } from "lucide-react"
import { useAuth } from "@/context/AuthContext"

interface WalletViewProps {
  isLoggedIn: boolean
  onLogin: () => void
  onWalletSelect?: (wallet: PaymentMethod) => void
  selectedWallet?: PaymentMethod | null
  onClose?: () => void
}

interface PaymentMethod {
  id: string
  type: "bank" | "wallet"
  name: string
  details: string
  accountName: string
  isDefault: boolean
  walletAddress?: string
  bankCode?: string
  accountNumber?: string
}

export function WalletView({ isLoggedIn, onLogin, onWalletSelect, selectedWallet, onClose }: WalletViewProps) {
  const { user } = useAuth()
  const [showAddPayment, setShowAddPayment] = useState(false)
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
    walletAddress: "",
    walletName: "",
  })

  // Load payment methods from localStorage on component mount
  useEffect(() => {
    if (user) {
      const savedMethods = localStorage.getItem(`paymentMethods_${user.id}`)
      if (savedMethods) {
        setPaymentMethods(JSON.parse(savedMethods))
      }
    }
  }, [user])

  // Save payment methods to localStorage whenever they change
  useEffect(() => {
    if (user && paymentMethods.length > 0) {
      localStorage.setItem(`paymentMethods_${user.id}`, JSON.stringify(paymentMethods))
    }
  }, [paymentMethods, user])

  const handleAddPaymentMethod = () => {
    if (
      newPaymentMethod.type === "bank" &&
      newPaymentMethod.bankName &&
      newPaymentMethod.accountNumber &&
      newPaymentMethod.accountName
    ) {
      const newMethod: PaymentMethod = {
        id: `bank_${Date.now()}`,
        type: "bank",
        name: newPaymentMethod.bankName,
        details: `****${newPaymentMethod.accountNumber.slice(-4)}`,
        accountName: newPaymentMethod.accountName,
        isDefault: paymentMethods.length === 0, // First method is default
        accountNumber: newPaymentMethod.accountNumber,
        bankCode: newPaymentMethod.bankName,
      }
      
      setPaymentMethods([...paymentMethods, newMethod])
      setNewPaymentMethod({
        type: "",
        bankName: "",
        accountNumber: "",
        accountName: "",
        walletAddress: "",
        walletName: "",
      })
      setShowAddPayment(false)
    } else if (newPaymentMethod.type === "wallet" && newPaymentMethod.walletAddress && newPaymentMethod.walletName) {
      const newMethod: PaymentMethod = {
        id: `wallet_${Date.now()}`,
        type: "wallet",
        name: newPaymentMethod.walletName,
        details: `${newPaymentMethod.walletAddress.slice(0, 4)}...${newPaymentMethod.walletAddress.slice(-4)}`,
        accountName: newPaymentMethod.walletName,
        isDefault: paymentMethods.length === 0, // First method is default
        walletAddress: newPaymentMethod.walletAddress,
      }
      
      setPaymentMethods([...paymentMethods, newMethod])
      setNewPaymentMethod({
        type: "",
        bankName: "",
        accountNumber: "",
        accountName: "",
        walletAddress: "",
        walletName: "",
      })
      setShowAddPayment(false)
    }
  }

  const handleRemovePaymentMethod = (id: string) => {
    const updatedMethods = paymentMethods.filter((method) => method.id !== id)
    // If we removed the default, make the first remaining method default
    if (updatedMethods.length > 0 && !updatedMethods.some(m => m.isDefault)) {
      updatedMethods[0].isDefault = true
    }
    setPaymentMethods(updatedMethods)
  }

  const handleSetDefault = (id: string) => {
    setPaymentMethods(
      paymentMethods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      })),
    )
  }

  const handleCopyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleWalletSelect = (wallet: PaymentMethod) => {
    if (onWalletSelect) {
      onWalletSelect(wallet)
    }
    // Close the wallet view after selection
    if (onClose) {
      onClose()
    }
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <h3 className="text-lg font-semibold">Wallets & Banks</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAddPayment(true)}
            className="h-8 w-8 p-0 rounded-full"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {!user ? (
          <div className="text-center py-8">
            <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground mb-4">Please log in to manage payment methods</p>
            <Button onClick={onLogin} className="rounded-xl">
              Log in or sign up
            </Button>
          </div>
        ) : showAddPayment ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Add Payment Method</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAddPayment(false)}
                className="h-8 w-8 p-0 rounded-full"
              >
                ×
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Type</Label>
                <Select
                  value={newPaymentMethod.type}
                  onValueChange={(value) => setNewPaymentMethod({ ...newPaymentMethod, type: value })}
                >
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select payment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bank">Bank Account</SelectItem>
                    <SelectItem value="wallet">Crypto Wallet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {newPaymentMethod.type === "bank" && (
                <>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Select
                      value={newPaymentMethod.bankName}
                      onValueChange={(value) => setNewPaymentMethod({ ...newPaymentMethod, bankName: value })}
                    >
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select bank" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GTBank">GTBank</SelectItem>
                        <SelectItem value="Access Bank">Access Bank</SelectItem>
                        <SelectItem value="First Bank">First Bank</SelectItem>
                        <SelectItem value="UBA">UBA</SelectItem>
                        <SelectItem value="Zenith Bank">Zenith Bank</SelectItem>
                        <SelectItem value="Kuda Bank">Kuda Bank</SelectItem>
                        <SelectItem value="Opay">Opay</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input
                      placeholder="Enter account number"
                      value={newPaymentMethod.accountNumber}
                      onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, accountNumber: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Account Name</Label>
                    <Input
                      placeholder="Enter account name"
                      value={newPaymentMethod.accountName}
                      onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, accountName: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </>
              )}

              {newPaymentMethod.type === "wallet" && (
                <>
                  <div className="space-y-2">
                    <Label>Wallet Name</Label>
                    <Input
                      placeholder="e.g., Main Wallet"
                      value={newPaymentMethod.walletName}
                      onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, walletName: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Wallet Address</Label>
                    <Input
                      placeholder="Enter Solana wallet address"
                      value={newPaymentMethod.walletAddress}
                      onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, walletAddress: e.target.value })}
                      className="rounded-xl"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddPaymentMethod} className="flex-1 rounded-xl">
                  Add Payment Method
                </Button>
                <Button variant="outline" onClick={() => setShowAddPayment(false)} className="flex-1 rounded-xl">
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.length === 0 ? (
              <div className="text-center py-8">
                <Wallet className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground mb-4">No payment methods added</p>
                <Button onClick={() => setShowAddPayment(true)} variant="outline" className="rounded-xl bg-transparent">
                  Add Payment Method
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div 
                      key={method.id} 
                      className={`p-4 bg-muted/30 rounded-xl border border-border/50 cursor-pointer transition-all hover:bg-muted/50 ${
                        selectedWallet?.id === method.id ? 'ring-2 ring-primary bg-primary/5' : ''
                      }`}
                      onClick={() => handleWalletSelect(method)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            {method.type === "bank" ? (
                              <Building2 className="h-5 w-5 text-primary" />
                            ) : (
                              <Wallet className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{method.name}</span>
                              {method.isDefault && (
                                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                                  Default
                                </span>
                              )}
                              {selectedWallet?.id === method.id && (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                  Selected
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{method.details}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-4 w-4 p-0"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  const textToCopy = method.type === "wallet" && method.walletAddress 
                                    ? method.walletAddress 
                                    : method.details
                                  handleCopyToClipboard(textToCopy, method.id)
                                }}
                              >
                                {copiedId === method.id ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                            <span className="text-xs text-muted-foreground">{method.accountName}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {!method.isDefault && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSetDefault(method.id)
                              }}
                              className="text-xs px-2 py-1 h-auto rounded-lg"
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleRemovePaymentMethod(method.id)
                            }}
                            className="h-8 w-8 p-0 rounded-full text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => setShowAddPayment(true)}
                  variant="outline"
                  className="w-full rounded-xl bg-transparent"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Payment Method
                </Button>
              </>
            )}

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-muted/20 rounded-xl border border-border/30">
              <h5 className="font-medium text-sm mb-2">Security Notice</h5>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your payment information is encrypted and stored securely. We never store your full account details or
                private keys.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
