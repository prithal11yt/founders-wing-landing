/**
 * Generates AI content for all programmatic SEO pages.
 * Run: node scripts/generate-seo-content.mjs
 * Requires: ANTHROPIC_API_KEY in environment
 *
 * Output: lib/generated-content.json (commit this file)
 */

import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const OUTPUT_PATH = join(ROOT, 'lib', 'generated-content.json')

// Load existing content to enable incremental updates (skip already-generated pages)
const existing = existsSync(OUTPUT_PATH)
  ? JSON.parse(readFileSync(OUTPUT_PATH, 'utf8'))
  : {}

// Inline the page configs (mirrors lib/seo-pages.ts — avoids ts-node dependency)
const SEO_PAGES = [
  // COMMUNITY
  { category: 'community', slug: 'founder-community-india', h1: 'Find Your Founder Community in India', keywords: ['founder community india', 'founder community', 'entrepreneur community india'], toneHint: 'warm, motivating, India-focused, action-oriented' },
  { category: 'community', slug: 'entrepreneur-community-india', h1: "Join India's Most Action-Oriented Entrepreneur Community", keywords: ['entrepreneur community india', 'entrepreneur community', 'startup community india'], toneHint: 'bold, differentiated, anti-lurker, India-focused' },
  { category: 'community', slug: 'ai-founder-community', h1: 'The AI Founder Community Built for Action-Takers', keywords: ['ai founder community', 'ai startup community india', 'ai entrepreneur community'], toneHint: 'tech-savvy, exciting, forward-looking, practical' },
  { category: 'community', slug: 'startup-community-india', h1: "India's Startup Community for First-Time Founders", keywords: ['startup community india', 'startup community', 'india startup ecosystem'], toneHint: 'inclusive, beginner-friendly, community-driven, India-focused' },
  { category: 'community', slug: 'online-business-community-india', h1: "Join India's Best Online Business Community", keywords: ['online business community india', 'online business community', 'make money online india community'], toneHint: 'practical, income-focused, action-oriented, India-specific' },
  { category: 'community', slug: 'accountability-community-for-founders', h1: 'An Accountability Community That Actually Holds You to Your Goals', keywords: ['accountability community founders', 'accountability partner founder india', 'founder accountability'], toneHint: 'empathetic, problem-aware, solution-focused' },
  { category: 'community', slug: 'whatsapp-community-for-entrepreneurs', h1: 'Beyond WhatsApp: A Real Community for Entrepreneurs', keywords: ['whatsapp community entrepreneurs india', 'entrepreneur whatsapp group india', 'best whatsapp group for entrepreneurs'], toneHint: 'contrarian, honest, upgrade-focused, India-aware' },
  { category: 'community', slug: 'founder-community-for-beginners', h1: 'A Founder Community That Welcomes Complete Beginners', keywords: ['founder community beginners', 'entrepreneur community for beginners india', 'how to join founder community india'], toneHint: 'welcoming, reassuring, beginner-affirming, zero-judgment' },
  { category: 'community', slug: 'paid-founder-community-india', h1: "Why a Paid Founder Community Gets Better Results Than Free Groups", keywords: ['paid founder community india', 'paid entrepreneur community india', 'founder community membership india'], toneHint: 'confident, value-justifying, ROI-focused' },
  { category: 'community', slug: 'ai-startup-community-india', h1: "India's AI Startup Community: Learn, Build, and Launch Together", keywords: ['ai startup community india', 'ai startup india', 'artificial intelligence entrepreneur community india'], toneHint: 'tech-forward, ambitious, India-proud' },
  // GUIDE
  { category: 'guide', slug: 'how-to-make-first-money-online-india', h1: 'How to Make Your First Money Online in India', keywords: ['how to make first money online india', 'earn money online india', 'make money online india for beginners'], toneHint: 'practical, step-by-step, encouraging, India-specific with rupee amounts' },
  { category: 'guide', slug: 'how-to-start-online-business-india', h1: 'How to Start an Online Business in India — Step by Step', keywords: ['how to start online business india', 'start online business india', 'online business india beginners'], toneHint: 'structured, beginner-friendly, India-specific, AI-forward' },
  { category: 'guide', slug: 'how-to-stop-overthinking-and-start-building', h1: 'How to Stop Overthinking and Actually Start Building', keywords: ['how to stop overthinking start business', 'analysis paralysis entrepreneur', 'overthinking founder'], toneHint: 'empathetic, psychology-aware, direct, action-triggering' },
  { category: 'guide', slug: 'how-to-use-ai-to-start-a-business', h1: 'How to Use AI Tools to Start Your Business Faster', keywords: ['how to use ai to start business', 'ai for entrepreneurs india', 'ai business tools india 2025'], toneHint: 'practical, tool-specific, exciting, accessible to non-tech founders' },
  { category: 'guide', slug: 'first-10k-online-india', h1: 'Your First ₹10,000 Online: A Real Plan for Indian Founders', keywords: ['first 10k online india', 'earn first 10000 online india', 'make 10k online india'], toneHint: 'specific, milestone-focused, achievable, India rupee amounts' },
  { category: 'guide', slug: 'how-to-find-business-ideas-with-ai', h1: 'How to Find Profitable Business Ideas Using AI Tools', keywords: ['business ideas with ai', 'find business ideas using ai', 'ai business idea generator india'], toneHint: 'creative, systematic, tool-driven, idea-generating' },
  { category: 'guide', slug: 'online-business-ideas-india-2025', h1: '30 Online Business Ideas in India You Can Start with AI', keywords: ['online business ideas india 2025', 'business ideas india 2025', 'small business ideas india online'], toneHint: 'listicle, India-specific, practical with INR revenue estimates' },
  { category: 'guide', slug: 'how-to-get-first-client-india', h1: 'How to Land Your First Client in India as a First-Time Founder', keywords: ['how to get first client india', 'get first client freelancing india', 'first client india entrepreneur'], toneHint: 'tactical, step-by-step, confidence-building, India-market-aware' },
  { category: 'guide', slug: 'how-to-build-accountability-as-a-founder', h1: 'How to Stay Accountable as a Solo Founder', keywords: ['founder accountability', 'accountability for solo founders', 'how to stay accountable entrepreneur'], toneHint: 'psychological, practical, system-focused, solo founder empathy' },
  { category: 'guide', slug: 'aspiring-entrepreneur-guide-india', h1: "The Aspiring Entrepreneur's Guide to Starting in India", keywords: ['aspiring entrepreneur india', 'guide for entrepreneurs india', 'how to become entrepreneur india'], toneHint: 'comprehensive, encouraging, India-focused, journey-based narrative' },
  // TOOLS
  { category: 'tools', slug: 'ai-tools-for-founders-india', h1: 'The Best AI Tools for Founders in India Right Now', keywords: ['ai tools for founders india', 'ai tools entrepreneurs india', 'best ai tools india 2025'], toneHint: 'curated, tool-specific, practical with use cases, India-relevant pricing' },
  { category: 'tools', slug: 'ai-tools-for-online-business-india', h1: 'AI Tools That Make Running an Online Business in India Easier', keywords: ['ai tools online business india', 'ai for online business india', 'ai tools ecommerce india'], toneHint: 'efficiency-focused, workflow-driven, practical business use cases' },
  { category: 'tools', slug: 'ai-tools-for-content-creators-india', h1: 'AI Tools Every Indian Content Creator Should Be Using', keywords: ['ai tools content creators india', 'ai for youtube india', 'content creation ai tools india'], toneHint: 'creator-focused, platform-specific (YouTube/Instagram), India-market-aware' },
  { category: 'tools', slug: 'best-ai-tools-for-entrepreneurs-2025', h1: 'The Ultimate AI Tools List for Entrepreneurs in 2025', keywords: ['best ai tools entrepreneurs 2025', 'ai tools business 2025', 'top ai tools 2025'], toneHint: 'authoritative, comprehensive, regularly-updated feel, use-case organized' },
  { category: 'tools', slug: 'ai-automation-for-small-business-india', h1: 'How Indian Small Businesses Are Using AI Automation to Work Less', keywords: ['ai automation small business india', 'business automation ai india', 'automate business india'], toneHint: 'time-saving, ROI-focused, practical with specific tool names' },
  // CHALLENGE
  { category: 'challenge', slug: '30-day-business-challenge-india', h1: 'Take the 30-Day Business Challenge and Earn Your First Income Online', keywords: ['30 day business challenge india', 'business challenge india', '30 day startup challenge india'], toneHint: 'energetic, gamified, cohort-driven, milestone-focused' },
  { category: 'challenge', slug: 'first-10k-challenge-india', h1: 'The First ₹10K Challenge: Earn ₹10,000 Online in 30 Days', keywords: ['first 10k challenge india', 'earn 10000 in 30 days india', 'make 10k rupees online challenge'], toneHint: 'urgent, specific, gamified, challenge-mindset' },
  { category: 'challenge', slug: 'ai-business-challenge-india', h1: 'The AI Business Challenge: Build Something Real with AI in 30 Days', keywords: ['ai business challenge india', 'build business with ai challenge', 'ai startup challenge india'], toneHint: 'tech-forward, challenge-oriented, achievable ambition' },
  { category: 'challenge', slug: 'online-income-challenge-india', h1: 'The Online Income Challenge: Your First Rupees from the Internet', keywords: ['online income challenge india', 'make money online challenge india', 'earn online challenge india'], toneHint: 'motivating, realistic, anti-passive-income-hype, India-specific' },
  { category: 'challenge', slug: 'founder-accountability-challenge', h1: 'The Founder Accountability Challenge: Finally Follow Through on Your Goals', keywords: ['founder accountability challenge', 'entrepreneur accountability challenge india', 'accountability challenge founders'], toneHint: 'habit-forming, introspective, long-term focus, community emphasis' },
]

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function generatePageContent(page) {
  const keywordList = page.keywords.join(', ')
  const prompt = `You are writing SEO content for "Founders Wing" — India's AI-first founder community run by Prithal Bhardwaj.

Community facts:
- Paid membership: ₹2,999 for 6 months or ₹4,999 for 12 months
- Includes: weekly live sessions with Prithal, private WhatsApp community, AI tool breakdowns, accountability buddy system, copy-paste playbooks/templates, the ₹10K Sprint Challenge (30-day cohort challenge to earn first ₹10,000)
- Target audience: aspiring founders in India with ideas but stuck overthinking, want to make first money online, use AI as unfair advantage
- Anti-hype: community of doers, not lurkers; no courses, just real builders

Page details:
- H1: "${page.h1}"
- Primary keywords: ${keywordList}
- Tone: ${page.toneHint}

Generate a JSON object with exactly this structure (no markdown, just raw JSON):
{
  "intro": "A 250-300 word introductory section written in 2-3 paragraphs. Naturally weave in the primary keyword. Speak directly to the reader's pain/desire. End with a transition toward Founders Wing as the solution. Do NOT use the word 'delve'. Write in plain, punchy English.",
  "faqs": [
    { "q": "question 1", "a": "answer 1 (2-4 sentences)" },
    { "q": "question 2", "a": "answer 2 (2-4 sentences)" },
    { "q": "question 3", "a": "answer 3 (2-4 sentences)" },
    { "q": "question 4", "a": "answer 4 (2-4 sentences)" },
    { "q": "question 5", "a": "answer 5 (2-4 sentences)" }
  ]
}

FAQs should be genuinely useful search questions related to the page topic — not generic. Include at least one FAQ specifically about Founders Wing.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1200,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = response.content[0].text.trim()
  // Strip markdown code fences if present
  const jsonStr = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  return JSON.parse(jsonStr)
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    console.error('❌  ANTHROPIC_API_KEY is not set. Add it to .env.local or export it.')
    process.exit(1)
  }

  const results = { ...existing }
  let generated = 0
  let skipped = 0

  for (const page of SEO_PAGES) {
    const key = `${page.category}/${page.slug}`

    if (results[key]) {
      console.log(`⏭  Skipping (already exists): ${key}`)
      skipped++
      continue
    }

    process.stdout.write(`⚡ Generating: ${key} ... `)
    try {
      results[key] = await generatePageContent(page)
      console.log('✓')
      generated++
      // Write incrementally so a crash doesn't lose progress
      writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2))
    } catch (err) {
      console.error(`\n❌ Failed: ${key}`, err.message)
    }

    // Polite rate-limiting
    await new Promise((r) => setTimeout(r, 500))
  }

  writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2))
  console.log(`\n✅ Done. Generated: ${generated}, Skipped: ${skipped}`)
  console.log(`📄 Output: lib/generated-content.json`)
}

main()
