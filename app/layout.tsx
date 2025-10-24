import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import { ThemeProvider } from "@/components/theme-provider";
import RootShell from "@/components/app_layout/root-shell";
import { Suspense, useEffect, useState } from "react";
import "./globals.css";

import { AuthProvider } from "@/context/AuthContext";
import { UIProvider } from "@/context/UIContext";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { SolanaWalletConnectors } from "@dynamic-labs/solana";

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
  viewport: "width=device-width, initial-scale=1, viewport-fit=cover",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const environmentId = process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID;

  if (!environmentId) {
    throw new Error(
      "Missing NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID environment variable"
    );
  }

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

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
