import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import RootShell from "@/components/app_layout/root-shell";
import { Suspense } from "react"
import "./globals.css"
// import {
//   DynamicContextProvider,
//   DynamicWidget,
// } from "@dynamic-labs/sdk-react-core";
// import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import { AuthProvider } from "@/context/AuthContext"
import { UIProvider } from "@/context/UIContext"

export const metadata: Metadata = {
  title: {
    default: "FRAMP - Your Gateway to Crypto Ramping",
    template: "%s | FRAMP",
  },
  description:
    "FRAMP lets you easily on-ramp to crypto, spend it on everyday bills, and explore the Solana ecosystem—all in one seamless experience.",
  generator: "github.com/bigdreamsweb3",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <UIProvider>
          <AuthProvider>
          <Suspense fallback={null}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>

              <RootShell>
                {children}
              </RootShell>

              {/* <DynamicContextProvider
                settings={{
                  environmentId: "94779e7d-5bac-4634-bed1-fdec1ba6da64",
                  walletConnectors: [SolanaWalletConnectors],
                }}
              >
                {children}
                <DynamicWidget />
              </DynamicContextProvider> */}
            </ThemeProvider>
          </Suspense>
          <Analytics />
        </AuthProvider>
        </UIProvider>
      </body>
    </html>
  )
}
