import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { absolute: "Founders Wing | Preview" },
  robots: { index: false, follow: false },
}

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
