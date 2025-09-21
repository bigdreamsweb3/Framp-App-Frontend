"use client";
import type React from "react";

import { CreditCard, Building2, Smartphone, Check } from "lucide-react";

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isAvailable: boolean;
  processingTime?: string;
  fees?: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "CARD",
    name: "Credit/Debit Card",
    description: "Visa, Mastercard, Verve",
    icon: <CreditCard className="w-4 h-4" />,
    isAvailable: true,
    processingTime: "Instant",
    fees: "",
  },
  {
    id: "ACCOUNT_TRANSFER",
    name: "Bank Transfer",
    description: "Direct bank account transfer",
    icon: <Building2 className="w-4 h-4" />,
    isAvailable: true,
    processingTime: "Instant",
    fees: "",
  },
  {
    id: "USSD",
    name: "USSD",
    description: "Mobile banking USSD",
    icon: <Smartphone className="w-4 h-4" />,
    isAvailable: false,
    processingTime: "Instant",
    fees: "",
  },
  {
    id: "PHONE_NUMBER",
    name: "Phone Number",
    description: "Pay with phone number",
    icon: <Smartphone className="w-4 h-4" />,
    isAvailable: false,
    processingTime: "Instant",
    fees: "",
  },
];

interface PaymentMethodSelectorProps {
  selectedMethod: string | null;
  onMethodSelect: (methodId: string) => void;
  disabled?: boolean;
}

export function PaymentMethodSelector({
  selectedMethod,
  onMethodSelect,
  disabled = false,
}: PaymentMethodSelectorProps) {
  return (
    <div className="w-full">
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-border hover:scrollbar-thumb-primary/50">
        {PAYMENT_METHODS.map((method) => (
          <button
            key={method.id}
            className={`relative flex-shrink-0 flex flex-col items-center gap-1.5 p-3 min-w-[100px] h-16 rounded-lg border transition-all ${
              method.id === selectedMethod
                ? "border-primary bg-primary/5 text-primary"
                : "border-border bg-background hover:border-primary/50 text-foreground"
            } ${!method.isAvailable ? "opacity-50 cursor-not-allowed" : ""} ${
              disabled ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => {
              if (method.isAvailable && !disabled) {
                onMethodSelect(method.id);
              }
            }}
            disabled={!method.isAvailable || disabled}
          >
            <div
              className={`${
                method.id === selectedMethod
                  ? "text-primary"
                  : "text-muted-foreground"
              }`}
            >
              {method.icon}
            </div>

            <div className="text-center">
              <div className="text-xs font-medium leading-tight">
                {method.name}
              </div>
              <div className="text-xs text-muted-foreground">{method.fees}</div>
            </div>

            {method.id === selectedMethod && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-primary-foreground" />
              </div>
            )}

            {!method.isAvailable && (
              <div className="absolute -top-1 -right-1 text-xs text-muted-foreground bg-muted px-1 py-0.5 rounded text-[10px]">
                Soon
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
