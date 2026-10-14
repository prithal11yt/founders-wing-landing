import type { Metadata, Viewport } from "next"

export const viewport: Viewport = {
  themeColor: "#f5f7fb",
}

export const metadata: Metadata = {
  title: "Team Workspace | Founders Wing",
  description: "Founders Wing team workspace — leads, members, sessions, daily targets",
  robots: { index: false, follow: false },
}

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
