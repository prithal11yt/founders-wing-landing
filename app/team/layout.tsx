import type { Metadata, Viewport } from "next"

export const viewport: Viewport = {
  themeColor: "#06090f",
}

export const metadata: Metadata = {
  title: "Team — Leads | Founders Wing",
  description: "Founders Wing team lead dashboard",
  robots: { index: false, follow: false },
}

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
