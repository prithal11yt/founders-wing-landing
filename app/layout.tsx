import React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google'
import Script from "next/script"
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Founders Wing | AI-First Founder Community",
  description: "An invite-only community for founders who want to learn, network, and build with AI. Stay ahead with real strategies, not hype.",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-X1QTL8HQ6M"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-X1QTL8HQ6M');
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} ${spaceGrotesk.variable} antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
