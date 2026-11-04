import { SiteNav } from '@/components/site/nav'
import { SiteFooter } from '@/components/site/footer'

export default function EventsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-neutral-950">
      <SiteNav />
      <main>{children}</main>
      <SiteFooter />
    </div>
  )
}
