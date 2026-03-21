import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Founders Wing — Lead Manager",
  description: "Internal lead management dashboard",
  robots: "noindex, nofollow",
}

export default function LeadsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
