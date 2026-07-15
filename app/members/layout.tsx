import type { Metadata, Viewport } from "next"

// Member portal stays dark — override the light site-wide theme color
export const viewport: Viewport = {
  themeColor: "#06090f",
}

export const metadata: Metadata = {
  title: "Members | Founders Wing",
  description: "Founders Wing member area",
  robots: { index: false, follow: false },
}

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
