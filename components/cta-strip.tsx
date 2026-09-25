import { JOIN, PrimaryCTA } from '@/components/site/ui'

export function CTAStrip({ text = 'Ready to build?', buttonText = 'Get Membership', href = JOIN }: { text?: string; buttonText?: string; href?: string }) {
  return (
    <div className="mx-auto max-w-5xl px-5">
      <div className="rounded-[28px] bg-neutral-950 text-white px-6 py-8 md:px-10 md:py-10 flex flex-col sm:flex-row items-center justify-between gap-5">
        <p className="text-xl md:text-2xl font-medium tracking-[-0.02em] text-center sm:text-left">{text}</p>
        <PrimaryCTA href={href} className="shrink-0">{buttonText}</PrimaryCTA>
      </div>
    </div>
  )
}
