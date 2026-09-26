// Latest videos from The Solo Entrepreneur, read from YouTube's public RSS feed
// (no API key). Cached for an hour; falls back to a baked list if the feed is down.

export const YT_CHANNEL_ID = 'UCV_DLB3VW0szIGQnwel1Nsw'
export const YT_CHANNEL_URL = 'https://youtube.com/@thesoloentrepreneur07'

export type YtVideo = { id: string; title: string; published: string }

// Snapshot from 26 Sep 2026, used only when the feed can't be fetched.
const FALLBACK: YtVideo[] = [
  { id: 'osv9t1vANhA', title: 'Why JEV AI Is Going Viral (And What It Actually Does)', published: '2026-09-21' },
  { id: 'OBJwjZd6Es4', title: 'Claude Code, Codex, Antigravity or Lovable: Which One Should You Buy?', published: '2026-09-15' },
  { id: '9z1ntsd3h5I', title: 'Vibe Coding an Idea to Unique AI SaaS App— using Google Antigravity!', published: '2026-09-09' },
  { id: 'VvA72Kly-mU', title: 'How I Generate $1000+ AI Motion Graphics With Google Antigravity (For FREE)', published: '2026-08-28' },
  { id: 'qHD45hRSpzA', title: 'Stop Building Vibe Coded Apps using AI!', published: '2026-08-22' },
  { id: '_fzJQio9et4', title: '5 Vibe-Coded SaaS Apps Making $10,000/Month! (Solo Built)', published: '2026-08-13' },
]

const decode = (s: string) =>
  s.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))

export async function getLatestVideos(limit = 6): Promise<YtVideo[]> {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${YT_CHANNEL_ID}`, { next: { revalidate: 3600 } })
    if (!res.ok) throw new Error(String(res.status))
    const xml = await res.text()
    const entries = xml.match(/<entry>[\s\S]*?<\/entry>/g) ?? []
    const vids: YtVideo[] = []
    for (const e of entries) {
      const id = e.match(/<yt:videoId>([^<]+)/)?.[1]
      const title = e.match(/<title>([^<]+)/)?.[1]
      const published = e.match(/<published>([^<]+)/)?.[1]?.slice(0, 10)
      if (id && title && published) vids.push({ id, title: decode(title), published })
    }
    return vids.length ? vids.slice(0, limit) : FALLBACK.slice(0, limit)
  } catch {
    return FALLBACK.slice(0, limit)
  }
}
