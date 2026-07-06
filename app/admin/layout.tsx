import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Founders Wing — Admin",
  description: "Internal admin dashboard",
  robots: { index: false, follow: false },
  // Own installable app identity, separate from the member portal:
  // installing from /admin gives an amber "FW Admin" app scoped to /admin.
  manifest: "/admin-manifest.webmanifest",
  icons: {
    apple: "/icons/admin-icon-180.png",
  },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
