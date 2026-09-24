'use client'

import { useRef, useState } from 'react'
import { Play } from 'lucide-react'
import { ScrollReveal } from '@/components/scroll-reveal'

type Testimonial = {
  name: string
  /** e.g. "Founder" or "Accountant, 20+ years' experience". Leave empty if unknown. */
  role?: string
  company?: string
  companyUrl?: string
  since: string
  video: string
  poster: string
  duration: string
  /** A line lifted verbatim from the video. Leave empty rather than paraphrase. */
  quote?: string
  /** Shown unquoted when there's no verbatim quote — our description, not their words. */
  context?: string
}

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Harjot Singh',
    role: 'Founder',
    company: 'DoLoyal',
    companyUrl: 'https://www.doloyal.com/',
    since: 'June 2026',
    video: '/testimonials/harjot.mp4',
    poster: '/testimonials/harjot.jpg',
    duration: '0:47',
    // Spoken in Hindi; "best decision of my life" is his own phrasing.
    quote: 'I consider joining Founders Wing the best decision of my life.',
  },
  {
    name: 'Aniruddha Das',
    since: 'June 2026',
    video: '/testimonials/aniruddha.mp4',
    poster: '/testimonials/aniruddha.jpg',
    duration: '1:14',
    quote: 'We just share the ideas what we are building… helping each other. The impact is enormous for me.',
  },
  {
    name: 'Sanjay Sharma',
    role: "Accountant, 20+ years' experience",
    since: 'July 2026',
    video: '/testimonials/sanjay.mp4',
    poster: '/testimonials/sanjay.jpg',
    duration: '1:24',
    // Audio too noisy to transcribe reliably — no quote until we have his exact words.
    quote: '',
    context: 'New to AI — learning to make money with it.',
  },
]

export function MemberTestimonials() {
  const videos = useRef<(HTMLVideoElement | null)[]>([])
  const [playing, setPlaying] = useState<number | null>(null)

  function play(i: number) {
    // Only one testimonial talks at a time.
    videos.current.forEach((v, j) => { if (v && j !== i) v.pause() })
    setPlaying(i)
    videos.current[i]?.play().catch(() => {})
  }

  return (
    <section id="testimonials" className="py-16 md:py-24 relative">
      <div className="container mx-auto px-4">
        <ScrollReveal variant="fade-up" duration={800}>
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-14 space-y-3 md:space-y-4">
            <p className="text-sm font-medium tracking-widest uppercase text-sky-600">From the community</p>
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Hear it from our members</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">
              In their own words — founders building inside Founders Wing.
            </p>
          </div>
        </ScrollReveal>

        {/* Phones: swipeable row with the next card peeking in. sm+: a 3-column grid.
            The whole row reveals together so an off-screen card never stays hidden. */}
        <ScrollReveal variant="fade-up" delay={150} duration={800} className="max-w-4xl mx-auto">
          <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-px-4 -mx-4 px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0 sm:pb-0 sm:grid sm:grid-cols-3 sm:gap-6 sm:overflow-visible">
            {TESTIMONIALS.map((t, i) => (
              <figure
                key={t.name}
                className="neu-flat p-1.5 sm:p-2 rounded-[1.5rem] sm:rounded-[1.75rem] flex flex-col shrink-0 w-[72%] snap-start sm:w-auto"
              >
                <div
                  className="relative rounded-[1.1rem] sm:rounded-[1.3rem] overflow-hidden bg-slate-900"
                  style={{ aspectRatio: '9 / 16' }}
                >
                  <video
                    ref={el => { videos.current[i] = el }}
                    src={t.video}
                    poster={t.poster}
                    preload="none"
                    playsInline
                    controls={playing === i}
                    onPause={() => setPlaying(p => (p === i ? null : p))}
                    onPlay={() => setPlaying(i)}
                    onEnded={e => { setPlaying(null); e.currentTarget.load() }}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  {playing !== i && (
                    <button
                      type="button"
                      onClick={() => play(i)}
                      aria-label={`Play ${t.name}'s testimonial`}
                      className="group absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/45 via-transparent to-transparent"
                    >
                      <span className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/95 shadow-xl transition-transform duration-300 group-hover:scale-110">
                        <Play className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 ml-0.5" fill="currentColor" />
                      </span>
                      <span className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 rounded-full bg-black/60 px-2 py-0.5 text-[10px] sm:text-xs font-medium text-white tabular-nums">
                        {t.duration}
                      </span>
                    </button>
                  )}
                </div>

                <figcaption className="px-1.5 sm:px-2 pt-3 pb-1.5 flex-1 flex flex-col">
                  {t.quote ? (
                    <blockquote className="text-xs sm:text-sm text-foreground/90 leading-relaxed mb-3">
                      &ldquo;{t.quote}&rdquo;
                    </blockquote>
                  ) : t.context ? (
                    <p className="text-xs sm:text-sm text-muted-foreground italic leading-relaxed mb-3">{t.context}</p>
                  ) : null}
                  <div className="mt-auto">
                    <p className="text-sm sm:text-base font-semibold text-foreground">{t.name}</p>
                    {t.role && (
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {t.role}
                        {t.company && (
                          <>
                            ,{' '}
                            {t.companyUrl ? (
                              <a href={t.companyUrl} target="_blank" rel="noopener noreferrer" className="text-sky-600 hover:underline">
                                {t.company}
                              </a>
                            ) : t.company}
                          </>
                        )}
                      </p>
                    )}
                    <p className="text-[11px] sm:text-xs text-muted-foreground/80 mt-0.5">Member since {t.since}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  )
}
