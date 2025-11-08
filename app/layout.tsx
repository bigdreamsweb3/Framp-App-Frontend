import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import RootShell from "@/components/app_layout/root-shell"
import { Suspense } from "react"
import "./globals.css"

import DynamicWrapper from "@/lib/providers"
import { AuthProvider } from "@/context/AuthContext"
import { UIProvider } from "@/context/UIContext"

/* ------------------ FONT CONFIG ------------------ */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

/* ------------------ APP METADATA ------------------ */
export const metadata: Metadata = {
  title: {
    default: "FRAMP - Your Gateway To Do More With Crypto",
    template: "%s | FRAMP",
  },
  description:
    "FRAMP lets you on-ramp/off-ramp to crypto, pay bills, and explore the Solana ecosystem seamlessly in one place.",
  generator: "github.com/bigdreamsweb3",
  keywords: [
    "FRAMP",
    "crypto",
    "onramp",
    "Solana",
    "DeFi",
    "Web3 payments",
    "BigDreams Web3",
  ],
  authors: [{ name: "Agbaka Daniel Ugonna Matthew", url: "https://framp.xyz" }],
  openGraph: {
    title: "FRAMP – Your Gateway to Crypto Ramping",
    description:
      "Convert fiat to crypto, manage bills, and explore Solana in one seamless experience.",
    url: "https://framp.xyz",
    siteName: "FRAMP",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FRAMP Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FRAMP – Your Gateway to Crypto Ramping",
    description:
      "Simplify crypto on-ramping, payments, and Solana discovery with FRAMP.",
    creator: "@0xbigdream",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  themeColor: "#0A0A0A",
  other: {
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-capable": "yes",
  },
}

/* ------------------ ROOT LAYOUT ------------------ */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${GeistMono.variable}`}
    >
      <head>
        {/* Responsive scaling and PWA setup */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-title" content="FRAMP" />
        <link rel="apple-touch-startup-image" href="/splash.png" />
        <meta name="application-name" content="FRAMP" />

        {/* Safe viewport height (for mobile chrome/safari) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                const setVH = () => {
                  document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
                };
                setVH();
                window.addEventListener('resize', setVH);
                window.addEventListener('orientationchange', setVH);
              })();
            `,
          }}
        />
      </head>

      <body className="antialiased bg-background text-foreground font-sans min-h-[100dvh]">
        <DynamicWrapper>
          <UIProvider>
            <AuthProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">Loading FRAMP...</div>}>
                  <RootShell>{children}</RootShell>
                </Suspense>
                <Analytics />
              </ThemeProvider>
            </AuthProvider>
          </UIProvider>
        </DynamicWrapper>
      </body>
    </html>
  )
    }
          
