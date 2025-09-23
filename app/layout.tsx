import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Suspense } from "react"
import "./globals.css"
// import {
//   DynamicContextProvider,
//   DynamicWidget,
// } from "@dynamic-labs/sdk-react-core";
// import { SolanaWalletConnectors } from "@dynamic-labs/solana";
import { AuthProvider } from "@/context/AuthContext"

export const metadata: Metadata = {
  title: "FRAMP - Your Gateway to Crypto Ramping",
  description: "FRAMP lets you easily on-ramp to crypto, spend it on everyday bills, and explore the Solana ecosystem—all in one seamless experience.",
  generator: "github.com/bigdreamsweb3",
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        <AuthProvider>
          <Suspense fallback={null}>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>

              {children}

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
      </body>
    </html>
  )
}
