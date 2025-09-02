// File: components/onboarding-tour.tsx

"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { X, ArrowRight, ArrowLeft, MessageCircle } from "lucide-react"

interface OnboardingTourProps {
  onComplete: () => void
  onSkip: () => void
}

type OnboardingStep = {
  title: string
  description: string
  icon: React.ReactNode
  highlight: null | string | { desktop?: string; mobile?: string }
}

const onboardingSteps: OnboardingStep[] = [
  {
    title: "Welcome to FRAMP",
    description:
      "Your gateway to seamless crypto on-ramping. Convert Nigerian Naira to Solana (SOL) instantly and securely.",
    icon: (
      <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center mx-auto">
        <span className="text-primary-foreground font-bold text-xl">F</span>
      </div>
    ),
    highlight: null,
  },
  {
    title: "Buy SOL with Naira",
    description:
      "Enter the amount in NGN you want to convert. We'll show you exactly how much SOL you'll receive at current rates.",
    icon: (
      <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center mx-auto">
        <span className="text-white font-bold text-xl">₦</span>
      </div>
    ),
    highlight: {
      desktop: "onramp-card",
      mobile: "onramp-card",
    },
  },
  {
    title: "AI Assistant",
    description: "Need help? Our AI assistant is here 24/7 to guide you through the process and answer any questions.",
    icon: <MessageCircle className="w-12 h-12 p-3 bg-orange-500 text-white rounded-2xl mx-auto" />,
    highlight: {
      desktop: "chat-sidebar",
      mobile: "chat-button",
    },
  },
]

export function OnboardingTour({ onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [highlightPosition, setHighlightPosition] = useState<{
    top: number
    left: number
    width: number
    height: number
  } | null>(null)

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  useEffect(() => {
    const currentStepData = onboardingSteps[currentStep]

    let highlightKey: string | null = null
    if (typeof window !== "undefined") {
      const isMobile = window.innerWidth < 768
      highlightKey =
        typeof currentStepData.highlight === "string"
          ? currentStepData.highlight
          : isMobile
            ? currentStepData.highlight?.mobile ?? null
            : currentStepData.highlight?.desktop ?? null
    }

    if (highlightKey) {
      const findAndPositionElement = () => {
        // find only visible elements (ignore hidden desktop layout)
        const candidates = Array.from(document.querySelectorAll(`[data-tour="${highlightKey}"]`)) as HTMLElement[]

        const element = candidates.find(
          (el) => el.offsetParent !== null && el.getBoundingClientRect().width > 0 && el.getBoundingClientRect().height > 0
        )

        if (element) {
          const rect = element.getBoundingClientRect()
          const top = rect.top + window.scrollY
          const left = rect.left + window.scrollX

          setHighlightPosition({
            top,
            left,
            width: rect.width,
            height: rect.height,
          })
        } else {
          setHighlightPosition(null)
        }
      }

      findAndPositionElement()
      window.addEventListener("resize", findAndPositionElement)
      return () => window.removeEventListener("resize", findAndPositionElement)
    } else {
      setHighlightPosition(null)
    }
  }, [currentStep])

  const currentStepData = onboardingSteps[currentStep]

  const getModalPosition = () => {
    const modalWidth = 280
    const modalHeight = 220
    const padding = 16

    if (currentStep === 0) {
      return {
        left: window.innerWidth / 2 - modalWidth / 2,
        top: window.innerHeight / 2 - modalHeight / 2,
      }
    }

    if (!highlightPosition) {
      return {
        left: window.innerWidth - modalWidth - padding,
        top: window.innerHeight - modalHeight - padding,
      }
    }

    const spaceAbove = highlightPosition.top - window.scrollY
    const spaceBelow =
      window.innerHeight - (highlightPosition.top - window.scrollY + highlightPosition.height)
    const spaceLeft = highlightPosition.left
    const spaceRight = window.innerWidth - (highlightPosition.left + highlightPosition.width)

    let left = window.innerWidth - modalWidth - padding
    let top = window.innerHeight - modalHeight - padding

    const isMobile = window.innerWidth < 768
    const stepHighlight =
      typeof onboardingSteps[currentStep].highlight === "string"
        ? onboardingSteps[currentStep].highlight
        : isMobile
          ? onboardingSteps[currentStep].highlight?.mobile
          : onboardingSteps[currentStep].highlight?.desktop

    if (isMobile && stepHighlight === "chat-button") {
      const navEl = document.querySelector("[data-tour='chat-button']") as HTMLElement | null
      const navHeight = navEl ? navEl.getBoundingClientRect().height + 140 : 120

      left = window.innerWidth / 2 - modalWidth / 2
      top = window.innerHeight - navHeight - modalHeight - padding

      return { left, top }
    }

    if (spaceBelow > modalHeight + padding) {
      left = Math.min(highlightPosition.left, window.innerWidth - modalWidth - padding)
      top = highlightPosition.top + highlightPosition.height + padding
    } else if (spaceAbove > modalHeight + padding) {
      left = Math.min(highlightPosition.left, window.innerWidth - modalWidth - padding)
      top = highlightPosition.top - modalHeight - padding
    } else if (spaceRight > modalWidth + padding) {
      left = highlightPosition.left + highlightPosition.width + padding
      top = highlightPosition.top
    } else if (spaceLeft > modalWidth + padding) {
      left = highlightPosition.left - modalWidth - padding
      top = highlightPosition.top
    }

    left = Math.max(padding, Math.min(left, window.innerWidth - modalWidth - padding))
    top = Math.max(padding, Math.min(top, window.innerHeight - modalHeight - padding))

    return { left, top }
  }

  const modalPosition = getModalPosition()

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-60 pointer-events-none">
        {highlightPosition ? (
          <div
            className="absolute inset-0 bg-black/50"
            style={{
              WebkitMask: `url(#highlight-mask)`,
              mask: `url(#highlight-mask)`,
            }}
          >
            {/* SVG mask for rectangular highlight */}
            <svg width="0" height="0">
              <defs>
                <mask id="highlight-mask">
                  <rect x="0" y="0" width="100%" height="100%" fill="black" />
                  <rect
                    x={highlightPosition.left - window.scrollX}
                    y={highlightPosition.top - window.scrollY}
                    width={highlightPosition.width}
                    height={highlightPosition.height}
                    fill="transparent"
                  />
                </mask>
              </defs>
            </svg>
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/30" />
        )}

        {highlightPosition && (
          <>
            <div
              className="absolute border-2 border-primary rounded-lg pointer-events-none z-50"
              style={{
                top: highlightPosition.top - window.scrollY - 2,
                left: highlightPosition.left - window.scrollX - 2,
                width: highlightPosition.width + 4,
                height: highlightPosition.height + 4,
                boxShadow: "0 0 20px rgba(139, 92, 246, 0.5)",
              }}
            />
            <div
              className="absolute border-2 border-primary/30 rounded-lg animate-ping pointer-events-none z-40"
              style={{
                top: highlightPosition.top - window.scrollY - 8,
                left: highlightPosition.left - window.scrollX - 8,
                width: highlightPosition.width + 16,
                height: highlightPosition.height + 16,
              }}
            />
          </>
        )}
      </div>
      {/* Floating Card */}
      <div
        className="fixed z-70 pointer-events-auto transition-all duration-300 ease-out"
        style={{
          top: modalPosition.top,
          left: modalPosition.left,
          width: "280px",
        }}
      >
        <Card className="bg-card/95 backdrop-blur-sm border border-border/50 shadow-2xl rounded-2xl">
          <CardContent className="px-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">
                {currentStep + 1} of {onboardingSteps.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                className="text-muted-foreground hover:text-foreground text-xs h-5 bg-muted/35 rounded-md"
              >
                Skip tour
              </Button>
            </div>

            <div className="w-full bg-muted/30 rounded-full h-1 mb-3">
              <div
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / onboardingSteps.length) * 100}%` }}
              />
            </div>

            <div className="text-center space-y-2 mb-3">
              <div className="scale-75">{currentStepData.icon}</div>
              <h3 className="text-sm font-bold">{currentStepData.title}</h3>
              <p className="text-muted-foreground text-xs leading-relaxed">
                {currentStepData.description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="flex items-center gap-1 text-xs px-2 h-6"
              >
                <ArrowLeft className="w-3 h-3" />
                Prev
              </Button>

              <div className="flex items-center gap-1">
                {onboardingSteps.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${index === currentStep ? "bg-primary" : "bg-muted/50"
                      }`}
                  />
                ))}
              </div>

              <Button
                onClick={handleNext}
                size="sm"
                className="flex items-center gap-1 rounded-lg text-xs px-2 h-6"
              >
                {currentStep === onboardingSteps.length - 1 ? "Start" : "Next"}
                <ArrowRight className="w-3 h-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
