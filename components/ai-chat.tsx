"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Bot, User } from "lucide-react"

interface Message {
  id: number
  type: "user" | "assistant"
  content: string
  timestamp: Date
}

interface AIChatProps {
  onQuickAction?: (action: string) => void
}

export function AIChat({ onQuickAction }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      type: "assistant",
      content:
        "Hi! I'm your FRAMP AI assistant. I can help you with on-ramp processes, explain fees, and guide you through buying SOL with Naira. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const getAIResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase()

    if (lowerInput.includes("fee") || lowerInput.includes("cost") || lowerInput.includes("charge")) {
      return "FRAMP charges a competitive 1.5% fee for on-ramp transactions. This includes network fees and processing costs. For example, if you buy ₦10,000 worth of SOL, the fee would be ₦150. There are no hidden charges!"
    }

    if (
      (lowerInput.includes("how") || lowerInput.includes("steps")) &&
      (lowerInput.includes("buy") || lowerInput.includes("purchase"))
    ) {
      return "To buy SOL with Naira:\n\n1. Enter the amount you want to spend in NGN\n2. Review the SOL amount you'll receive\n3. Click 'Buy SOL'\n4. Complete payment using your linked bank account\n\nThe process typically takes 2-5 minutes!"
    }

    if (lowerInput.includes("safe") || lowerInput.includes("secure") || lowerInput.includes("trust")) {
      return "FRAMP is built on Solana blockchain with bank-level security. We use encrypted connections, never store your private keys, and all transactions are verified on-chain. Your funds are protected by multi-signature wallets and we're fully compliant with Nigerian financial regulations."
    }

    if (
      lowerInput.includes("time") ||
      lowerInput.includes("fast") ||
      lowerInput.includes("speed") ||
      lowerInput.includes("long")
    ) {
      return "FRAMP transactions are typically completed within 2-5 minutes thanks to Solana's fast blockchain. Bank transfers may take slightly longer depending on your bank, but crypto delivery is almost instant once payment is confirmed."
    }

    if (lowerInput.includes("minimum") || lowerInput.includes("maximum") || lowerInput.includes("limit")) {
      return "Transaction limits:\n\n• Minimum purchase: ₦1,000 NGN\n• Maximum daily limit: ₦500,000 NGN (verified accounts)\n• Weekly limits: ₦2,000,000 NGN\n\nYou can increase limits by completing additional verification steps in your profile."
    }

    if (lowerInput.includes("bank") || lowerInput.includes("payment") || lowerInput.includes("account")) {
      return "FRAMP supports all major Nigerian banks including GTBank, Access Bank, First Bank, UBA, Zenith, Kuda, and OPay. You can add multiple payment methods in the Wallets & Banks section. We also support instant transfers and USSD payments."
    }

    if (lowerInput.includes("hello") || lowerInput.includes("hi") || lowerInput.includes("hey")) {
      return "Hello! Welcome to FRAMP. I'm here to help you with anything related to buying SOL with Naira. What would you like to know?"
    }

    return "I'm here to help with FRAMP on-ramp questions! You can ask me about:\n\n• Fees and pricing\n• How to buy SOL step-by-step\n• Security and safety\n• Transaction times\n• Limits and verification\n• Supported banks\n• Auto-savings feature\n\nWhat would you like to know?"
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now(),
      type: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsTyping(true)

    setTimeout(
      () => {
        const assistantMessage: Message = {
          id: Date.now() + 1,
          type: "assistant",
          content: getAIResponse(input),
          timestamp: new Date(),
        }
        setMessages((prev) => [...prev, assistantMessage])
        setIsTyping(false)
      },
      1000 + Math.random() * 1000,
    )
  }

  const handleQuickAction = (action: string) => {
    setInput(action)
    if (onQuickAction) {
      onQuickAction(action)
    }
  }

  const quickActions = [
    "What are the fees?",
    "How do I buy SOL?",
    "Is FRAMP secure?",
    "Transaction limits?",
    "Supported banks?",
  ]

  return (
    <div className="flex flex-col h-full min-h-[calc(100vh-140px)] lg:min-h-[calc(100vh-100px)]">
      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.map((message) => (
          <div key={message.id} className="flex gap-4 max-w-4xl mx-auto">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted border border-border"
                }`}
              >
                {message.type === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
            </div>

            {/* Message Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{message.type === "user" ? "You" : "FRAMP Assistant"}</span>
                <span className="text-xs text-muted-foreground">
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="prose prose-sm max-w-none">
                <p className="text-sm leading-relaxed whitespace-pre-line text-foreground m-0">{message.content}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="flex gap-4 max-w-4xl mx-auto">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted border border-border">
                <Bot className="h-4 w-4" />
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">FRAMP Assistant</span>
                <span className="text-xs text-muted-foreground">typing...</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto p-4">
          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickAction(action)}
                  className="text-xs rounded-full bg-background hover:bg-muted"
                  disabled={isTyping}
                >
                  {action}
                </Button>
              ))}
            </div>
          )}

          {/* Input Field */}
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <Input
                placeholder="Message FRAMP Assistant..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                className="min-h-[44px] rounded-2xl border-border bg-background resize-none pr-12"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!input.trim() || isTyping}
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 rounded-lg"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center mt-3">
            FRAMP AI can make mistakes. Consider checking important information.
          </p>
        </div>
      </div>
    </div>
  )
}
