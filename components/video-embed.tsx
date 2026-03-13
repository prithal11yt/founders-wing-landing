'use client'

interface VideoEmbedProps {
  videoId: string
  title?: string
}

export function VideoEmbed({ videoId, title = "Founders Wing Overview" }: VideoEmbedProps) {
  return (
    <div className="relative group">
      {/* Outer glow ring */}
      <div className="absolute -inset-1 rounded-3xl blur-xl opacity-50 group-hover:opacity-80 transition-opacity duration-500" />

      {/* Main card */}
      <div className="relative rounded-2xl overflow-hidden neu-flat">
        {/* Top bar — browser-style */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-foreground/5 bg-background">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
          </div>
          <div className="flex-1 mx-4">
            <div className="neu-pressed rounded-md px-3 py-1 text-xs text-muted-foreground max-w-xs mx-auto text-center truncate">
              founderswing.com/welcome
            </div>
          </div>
        </div>

        {/* Video */}
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
    </div>
  )
}
