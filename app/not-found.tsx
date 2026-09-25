import { SiteNav } from '@/components/site/nav'
import { SiteFooter } from '@/components/site/footer'
import { PrimaryCTA } from '@/components/site/ui'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white text-neutral-950 flex flex-col">
      <SiteNav />
      <main className="flex-1 pt-44 pb-24 px-5 text-center">
        <p className="font-mono text-sm text-sky-600">404</p>
        <h1 className="mt-3 text-4xl md:text-6xl font-medium tracking-[-0.045em]">This page doesn’t exist.</h1>
        <p className="mt-4 text-neutral-600">The link may be old. Everything you need is on the homepage.</p>
        <div className="mt-8">
          <PrimaryCTA href="/">Back to Founders Wing</PrimaryCTA>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
