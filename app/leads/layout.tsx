import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Founders Wing — Lead Manager",
  description: "Internal lead management dashboard",
  robots: { index: false, follow: false },
}

export default function LeadsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
