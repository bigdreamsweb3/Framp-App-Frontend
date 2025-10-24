"use client";

import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { Suspense } from "react";

import { ThemeProvider } from "@/components/theme-provider";
import RootShell from "@/components/app_layout/root-shell";
import "./globals.css";

import dynamic from "next/dynamic";
import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";

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
  other: {
    "theme-color": "#7C5ABF",
    "apple-mobile-web-app-status-bar-style": "light-content",
    "apple-mobile-web-app-capable": "yes",
  },
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

// Prevent SSR DynamicProvider initialization by forcing client-only
const DynamicContextProvider = dynamic(
  () =>
    import("@dynamic-labs/sdk-react-core").then(
      (mod) => mod.DynamicContextProvider
    ),
  {
    ssr: false,
    loading: () => null,
  }
);

import { SolanaWalletConnectors } from "@dynamic-labs/solana";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID;

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans antialiased ${inter.variable} ${GeistMono.variable}`}
      >
        <UIProvider>
          <AuthProvider>
            <Suspense fallback={null}>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {environmentId ? (
                  <DynamicContextProvider
                    settings={{
                      environmentId,
                      walletConnectors: [SolanaWalletConnectors],
                    }}
                  >
                    <RootShell>{children}</RootShell>
                  </DynamicContextProvider>
                ) : (
                  <RootShell>{children}</RootShell>
                )}
              </ThemeProvider>
            </Suspense>
          </AuthProvider>
        </UIProvider>
      </body>
    </html>
  );
}
