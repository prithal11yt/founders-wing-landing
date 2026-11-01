import type { Metadata, Viewport } from "next"

// Member portal uses its own light-grey background
export const viewport: Viewport = {
  themeColor: "#f7f8fa",
}

export const metadata: Metadata = {
  title: "Members | Founders Wing",
  description: "Founders Wing member area",
  robots: { index: false, follow: false },
}

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
