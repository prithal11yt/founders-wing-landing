import type { Metadata, Viewport } from "next"
import { Bricolage_Grotesque } from "next/font/google"

// Heavy display face for the path board headings.
const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["700", "800"], variable: "--font-path-display" })

// Member portal uses its own light-grey background
export const viewport: Viewport = {
  themeColor: "#f5f6fa",
}

export const metadata: Metadata = {
  title: "Members",
  description: "Founders Wing member area",
  robots: { index: false, follow: false },
}

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return <div className={display.variable}>{children}</div>
}
