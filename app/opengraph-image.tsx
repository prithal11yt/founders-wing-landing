import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'Founders Wing — Stop overthinking. Start building with AI.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#080c14',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14,165,233,0.15) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        {/* Badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(14,165,233,0.1)',
            border: '1px solid rgba(14,165,233,0.3)',
            borderRadius: 100,
            padding: '8px 20px',
            marginBottom: 32,
          }}
        >
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#0ea5e9' }} />
          <span style={{ color: '#0ea5e9', fontSize: 18, fontWeight: 600, letterSpacing: 2 }}>
            FOUNDERS WING
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 68,
            fontWeight: 800,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.1,
            maxWidth: 900,
            marginBottom: 24,
          }}
        >
          Stop overthinking.{'\n'}
          <span style={{ color: '#0ea5e9' }}>Start building with AI.</span>
        </div>

        {/* Subtext */}
        <div
          style={{
            fontSize: 24,
            color: 'rgba(255,255,255,0.6)',
            textAlign: 'center',
            maxWidth: 700,
            lineHeight: 1.5,
          }}
        >
          India's action-first founder community. From ₹2,999.
        </div>
      </div>
    ),
    { ...size },
  )
}
