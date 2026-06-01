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

const BASE_URL = 'https://www.founderswing.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Founders Wing | AI-First Founder Community",
    template: "%s | Founders Wing",
  },
  description: "Join aspiring founders who are done watching tutorials and finally shipping something real — with AI as the unfair advantage. India's action-first founder community.",
  keywords: ["founder community india", "ai tools for founders", "entrepreneur community india", "startup community india", "online business india"],
  authors: [{ name: "Prithal Bhardwaj", url: "https://thesoloentrepreneur.in" }],
  creator: "Prithal Bhardwaj",
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: BASE_URL,
    siteName: "Founders Wing",
    title: "Founders Wing | AI-First Founder Community",
    description: "Join aspiring founders who are done watching tutorials and finally shipping something real — with AI as the unfair advantage.",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Founders Wing — Stop overthinking. Start building with AI." }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@Prithal7",
    creator: "@Prithal7",
    title: "Founders Wing | AI-First Founder Community",
    description: "Join aspiring founders who are done watching tutorials and finally shipping something real — with AI as the unfair advantage.",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: {
    canonical: BASE_URL,
  },
  verification: {
    google: "v5saqNNUgGlyoIWpns0iPoamujl4Dz_ZcVkX-BPSA8o",
  },
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Founders Wing",
                url: BASE_URL,
                logo: `${BASE_URL}/logo.png`,
                description: "India's AI-first founder community for aspiring entrepreneurs ready to stop overthinking and start building.",
                founder: { "@type": "Person", name: "Prithal Bhardwaj" },
                sameAs: [
                  "https://www.youtube.com/@PrithalBhardwaj",
                  "https://twitter.com/Prithal7",
                  "https://thesoloentrepreneur.in",
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Founders Wing",
                url: BASE_URL,
                potentialAction: {
                  "@type": "SearchAction",
                  target: { "@type": "EntryPoint", urlTemplate: `${BASE_URL}/guide/{search_term_string}` },
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
        {children}
      </body>
    </html>
  )
}
