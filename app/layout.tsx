import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { GeistMono } from "geist/font/mono"

import { ThemeProvider } from "@/components/theme-provider"
import RootShell from "@/components/app_layout/root-shell"
import { Suspense } from "react"
import "./globals.css"

import DynamicWrapper from "@/lib/providers"
import { AuthProvider } from "@/context/AuthContext"
import { UIProvider } from "@/context/UIContext"

// ✅ Initialize Inter font here
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })

export const metadata: Metadata = {
  title: { default: "FRAMP - Your Gateway To Do More With Crypto", template: "%s | FRAMP" },
  description: "FRAMP lets you on-ramp/off-ramp to crypto, pay bills, and explore the Solana ecosystem seamlessly in one place.",
  generator: "github.com/bigdreamsweb3",
  authors: [{ name: "Agbaka Daniel Ugonna Matthew", url: "https://framp.xyz" }],
  icons: { icon: "/favicon.ico" },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${GeistMono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="antialiased bg-background text-foreground font-sans min-h-[100dvh] ">
        <div className="gradient-container">
          <DynamicWrapper>
            <UIProvider>
              <AuthProvider>
                <Suspense fallback={null}>
                  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                    <RootShell>
                      {children}
                    </RootShell>
                  </ThemeProvider>
                </Suspense>
              </AuthProvider>
            </UIProvider>
          </DynamicWrapper>
        </div>
      </body>
    </html>
  )
}
