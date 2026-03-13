import React from "react"
import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from 'next/font/google'
import "./globals.css"

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Founders Wing | AI-First Founder Community",
  description: "An invite-only community for founders who want to learn, network, and build with AI. Stay ahead with real strategies, not hype.",
  generator: 'v0.app',
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
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
