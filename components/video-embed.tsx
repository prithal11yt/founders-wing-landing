'use client'

interface VideoEmbedProps {
  videoId: string
  title?: string
}

export function VideoEmbed({ videoId, title = "Founders Wing Overview" }: VideoEmbedProps) {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-black border border-white/10">
      <div className="relative aspect-video">
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    </div>
  )
}
