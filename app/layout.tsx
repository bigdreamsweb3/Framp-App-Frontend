import type React from "react"
import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import RootShell from "@/components/app_layout/root-shell"
import { Suspense } from "react"
import "./globals.css"

import DynamicWrapper from "@/lib/providers"
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
  other: {
    "apple-mobile-web-app-status-bar-style": "light-content",
    "apple-mobile-web-app-capable": "yes",
  },
}

/* ---------- FONTS ---------- */
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* ---- 100vh fallback for very old browsers (optional) ---- */}
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                function setVH(){document.documentElement.style.setProperty('--vh',window.innerHeight*.01+'px');}
                setVH();
                window.addEventListener('resize',setVH);
                window.addEventListener('orientationchange',setVH);
              })();
            `,
          }}
        />
      </head>

      <body className={`font-sans ${inter.variable} ${GeistMono.variable} antialiased`}>
        <DynamicWrapper>
          <UIProvider>
            <AuthProvider>
              <Suspense fallback={null}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
                  <RootShell>
                    {/* The actual page content */}
                    {children}
                  </RootShell>
                </ThemeProvider>
              </Suspense>
              <Analytics />
            </AuthProvider>
          </UIProvider>
        </DynamicWrapper>
      </body>
    </html>
  )
}
