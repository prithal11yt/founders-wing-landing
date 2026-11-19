import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Secure Your Spot",
  robots: { index: false, follow: false },
}

export default function SecureSpotLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
