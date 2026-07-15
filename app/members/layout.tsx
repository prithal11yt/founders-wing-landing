import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Members | Founders Wing",
  description: "Founders Wing member area",
  robots: { index: false, follow: false },
}

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
