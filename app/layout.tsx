"use client";

import type React from "react";
import { Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import RootShell from "@/components/app_layout/root-shell";
import { Suspense } from "react";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID;

  if (!environmentId) {
    throw new Error("Missing NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID environment variable");
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased ${inter.variable} ${GeistMono.variable}`}>
        <UIProvider>
          <AuthProvider>
            <Suspense fallback={null}>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                <DynamicContextProvider
                  settings={{
                    environmentId,
                    walletConnectors: [SolanaWalletConnectors],
                  }}
                >
                  <RootShell>{children}</RootShell>
                </DynamicContextProvider>
              </ThemeProvider>
            </Suspense>
            <Analytics />
          </AuthProvider>
        </UIProvider>
      </body>
    </html>
  );
}
