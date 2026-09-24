/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    // Founders Wing doesn't run sprints/challenges; those SEO pages were
    // removed. Send each old URL to its closest real page (topical redirects
    // keep search value — a blanket redirect to "/" reads as a soft 404).
    return [
      { source: '/challenge/first-10k-challenge-india', destination: '/guide/first-10k-online-india', permanent: true },
      { source: '/challenge/online-income-challenge-india', destination: '/guide/how-to-make-first-money-online-india', permanent: true },
      { source: '/challenge/ai-business-challenge-india', destination: '/guide/how-to-use-ai-to-start-a-business', permanent: true },
      { source: '/challenge/30-day-business-challenge-india', destination: '/guide/how-to-start-online-business-india', permanent: true },
      { source: '/challenge/founder-accountability-challenge', destination: '/community/accountability-community-for-founders', permanent: true },
      { source: '/challenge/:path*', destination: '/', permanent: true },
    ]
  },
  async headers() {
    // Conservative, app-wide security headers. We intentionally do NOT set a
    // full script/style CSP here (the app uses inline styles + third-party
    // scripts and a strict policy would break rendering); `frame-ancestors`
    // gives the clickjacking protection that matters most without that risk.
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
        ],
      },
    ]
  },
}

export default nextConfig
