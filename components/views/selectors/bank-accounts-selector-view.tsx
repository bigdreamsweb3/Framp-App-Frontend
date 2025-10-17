"use client"

import React from "react"
import { Button } from "@/components/ui/button"

type Account = {
  id: string
  type: "bank" | "wallet"
  name: string
  details: string
  accountName: string
  isDefault?: boolean
  walletAddress?: string
  bankCode?: string
  accountNumber?: string
}

interface BankAccountsViewProps {
  onAccountSelect: (account: Account) => void
  selectedAccount?: Account | null
  onClose: () => void
}

export const BankAccountsView: React.FC<BankAccountsViewProps> = ({ onAccountSelect, selectedAccount, onClose }) => {
  // mock accounts; replace with real data or fetch from parent when available
  const accounts: Account[] = [
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
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Select bank account</h2>
        {/* <Button variant="ghost" size="sm" onClick={onClose}>Close</Button> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((a) => (
          <div key={a.id} onClick={() => { onAccountSelect(a); onClose(); }} className={`p-3 rounded-xl border bg-card ${selectedAccount?.id === a.id ? 'ring-2 ring-primary bg-primary/5' : 'border-border'}`}>
            <div className="flex items-center justify-between h-full max-h-16">
              <div>
                <div className="text-sm font-medium">{a.name}</div>
                <div className="text-xs text-muted-foreground">{a.details}</div>
              </div>
              {/* <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => { onAccountSelect(a); onClose(); }}>
                  Use
                </Button>
              </div> */}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default BankAccountsView
