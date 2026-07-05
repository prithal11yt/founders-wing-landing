import type { MetadataRoute } from "next"

// PWA manifest — lets members add founderswing.com/members to their
// home screen and use it like an app.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Founders Wing",
    short_name: "Founders Wing",
    description: "The Founders Wing member portal — goals, Wings, help board and community.",
    start_url: "/members",
    display: "standalone",
    background_color: "#06090f",
    theme_color: "#06090f",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  }
}
