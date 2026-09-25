import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Founders Wing — Build it with AI. Get paying customers.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// Same traced W mark as components/site/brand.tsx.
const WING =
  'M 0.2,0.2 L 29.6,88.5 L 50.0,49.3 L 70.1,88.6 L 99.7,0.3 L 60.1,28.0 L 64.4,36.1 L 82.2,24.0 L 68.3,64.9 L 50.0,29.1 L 31.5,64.8 L 17.7,24.0 L 35.6,36.1 L 39.9,28.2 Z'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'linear-gradient(135deg, #111c33 0%, #0b1224 45%, #05091a 100%)',
          color: '#ffffff',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* watermark */}
        <svg width="620" height="550" viewBox="0 0 100 88.8" style={{ position: 'absolute', right: -80, bottom: -120, opacity: 0.06 }}>
          <path d={WING} fill="#ffffff" fillRule="evenodd" />
        </svg>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <svg width="44" height="39" viewBox="0 0 100 88.8">
            <path d={WING} fill="#38bdf8" fillRule="evenodd" />
          </svg>
          <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.5 }}>Founders Wing</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3 }}>Build it with AI.</div>
          <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.02, letterSpacing: -3, color: '#7c8698' }}>Get paying customers.</div>
          <div style={{ marginTop: 28, fontSize: 28, color: 'rgba(255,255,255,0.65)', maxWidth: 900, lineHeight: 1.4 }}>
            India’s community for people building SaaS, AI automations and AI businesses. From ₹833/month.
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
