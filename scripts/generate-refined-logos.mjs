import fs from 'fs';
import path from 'path';

const API_URL = 'https://platform.higgsfield.ai/nano-banana';
const API_KEY = '34d0b29e-d39e-46d9-a841-9b9336d0d00a';
const API_SECRET = '293e2f4ae063a19f70f654999c82ec1e21f00b1b4380fee4b41e09c2f02449f8';

const OUTPUT_DIR = '/Users/prithal/.gemini/antigravity/brain/d50dafd1-1166-447c-b51c-bfde784712ba/refined_logos';

// === LOGO 12 VARIATIONS (Subtle 3D Paper Wing) ===
const PAPER_WING_PROMPTS = [
    // 1 - More angular origami
    "Logo on pure black background. A single stylized wing shape made of angular folded paper planes overlapping, creating subtle 3D depth through white and light gray shading. Origami-inspired, geometric folds. Minimalist, premium, no text, no gradients, refined",
    // 2 - Smoother, more organic curves  
    "Logo on pure black background. An elegant wing created from 3 smooth overlapping petal-like shapes, each a slightly different shade of white/off-white, creating soft layered depth. Organic yet precise. Like ceramic or porcelain. No text, minimalist, premium",
    // 3 - Single fold with shadow
    "Logo on pure black background. A single wing shape created by one clean diagonal fold — the top plane is bright white, the bottom plane is soft gray, creating a crisp fold-line down the center. Like a folded business card forming a wing. Minimal, architectural, no text",
    // 4 - Stacked layered feathers
    "Logo on pure black background. Five thin elongated leaf-like shapes stacked at slightly different angles, each a progressively lighter shade from gray to white, creating a fan of wing feathers with subtle depth. Premium, tactile, dimensional. No text, no heavy shadows",
    // 5 - Paper airplane wing hybrid
    "Logo on pure black background. A stylized wing that looks like a partially folded paper airplane — clean geometric folds, white with subtle gray planes showing the fold structure. Combines flight and craftsmanship. Minimal, modern, no text",
    // 6 - Overlapping transparent planes
    "Logo on pure black background. Two large overlapping wing shapes — one white, one slightly transparent gray — creating a layered X-ray effect where they overlap. The overlap area creates a third tone. Flat yet dimensional. Clean, modern, no text",
    // 7 - Minimalist wing with one raised edge
    "Logo on pure black background. A simple curved wing silhouette in white where one edge slightly lifts and curls upward, with a tiny shadow underneath suggesting it's peeling off the surface. Barely 3D, mostly flat. Refined micro-detail. No text",
    // 8 - Tessellated wing
    "Logo on pure black background. A wing shape made from interlocking triangular facets like a low-poly 3D model, each facet a slightly different shade of white and gray. Geometric, crystalline, modern. Like a diamond wing. No text, clean edges",
    // 9 - Wrapped ribbon wing
    "Logo on pure black background. A wing formed from a single continuous ribbon that twists and curves upward, the twist creating natural light and dark sides. White ribbon on black. Elegant, flowing, dimensional without being heavy. No text",
    // 10 - Material design wing
    "Logo on pure black background. A wing icon following material design principles — flat colored planes stacked with consistent subtle drop shadows between layers. White planes, crisp edges, systematic spacing. Clean, Google-inspired precision. No text"
];

// === LOGO 10 VARIATIONS (W-Bird Fusion) ===
const W_BIRD_PROMPTS = [
    // 1 - Lighter, more elegant
    "Logo on pure black background. An elegant uppercase W letterform where the center peak transforms into a graceful bird silhouette in flight. Thinner strokes than typical, more refined. Pure white, flat vector. The bird is subtle, emerging naturally from the W. No text",
    // 2 - Negative space bird
    "Logo on pure black background. A bold solid white W letterform with a bird shape cut out as negative space from its center — the bird is revealed by what's removed, not added. Black bird silhouette inside white W. Strong, clever, iconic. No text",
    // 3 - More geometric bird
    "Logo on pure black background. An uppercase W constructed from sharp angular geometric shapes, with the top peaks forming two abstract triangular wings of a bird. Very geometric, almost crystalline. Pure white, flat. No curves, all straight edges. No text",
    // 4 - Eagle variant
    "Logo on pure black background. A broad uppercase W where the two outer strokes flare outward and upward like powerful eagle wings. A small triangular notch at the center top suggests the eagle's head. Bold, strong, heraldic. Pure white, flat vector. No text",
    // 5 - Minimalist phoenix from W
    "Logo on pure black background. A simple W where a single thin curved line rises from its center peak, forming a long-tailed phoenix or bird trail ascending upward. The line is elegant and fluid against the geometric W below. White on black. No text",
    // 6 - Rounded friendly version
    "Logo on pure black background. A rounded, soft-cornered W letterform with the center rising into a cute simplified bird shape — friendly, approachable, modern. Think Duolingo-level warmth but monochrome white on black. Clean, contemporary. No text",
    // 7 - Split W wings
    "Logo on pure black background. A W split perfectly in half vertically — each half looks like a single bird wing. Together they form both the letter and a pair of spread wings. Symmetrical, balanced, bold. Pure white, flat vector. No text",
    // 8 - Abstract bird-W with speed lines
    "Logo on pure black background. An angular W-bird mark that leans forward dynamically, with two horizontal speed lines trailing from the left side suggesting rapid motion. Energetic, forward-moving, ambitious. White on black. No text",
    // 9 - Crown-wing W
    "Logo on pure black background. An uppercase W where the three peaks are shaped like a crown, and the outer strokes extend outward like wings. Combines royalty with flight — exclusive, premium, powerful. White, flat vector, symmetrical. No text",
    // 10 - Connected nodes W-bird
    "Logo on pure black background. A W-bird shape constructed from connected dots and lines, like a constellation or network graph. Each junction is a node, lines connect them to form both a W and a bird. Tech-meets-nature. White on black. No text"
];

// === MIXED CONCEPTS (Paper 3D Wing + W-Bird) ===
const MIXED_PROMPTS = [
    // 1 - 3D layered W that looks like a bird
    "Logo on pure black background. A W letterform made from overlapping layered planes of white and light gray, creating subtle 3D depth. The layered planes are shaped so the overall W also reads as a bird with spread wings. Subtle depth, dimensional, premium. No text",
    // 2 - Paper-fold bird emerging from W
    "Logo on pure black background. A geometric W at the base with a 3D paper-folded bird emerging from its center peak, like origami coming to life. The bird has clean angular folds with white and gray planes showing depth. Modern, tactile, striking. No text",
    // 3 - Dimensional W-wings
    "Logo on pure black background. Two wing shapes that together form a W — each wing is rendered with subtle 3D paper-fold depth, slightly different gray tones on each facet. The wings mirror each other to create the W shape. Architectural, refined, elegant. No text",
    // 4 - Folded card W-bird
    "Logo on pure black background. A single piece of paper folded in the shape of a W, where the folds and shadows make it also appear as a bird in flight viewed from above. White and soft gray. Clever visual illusion. Minimalist, premium craftsmanship. No text",
    // 5 - Stacked planes bird-W emblem
    "Logo on pure black background. Three overlapping geometric wing-feather shapes stacked with subtle depth, arranged to collectively form a W letterform. Each feather-plane is a different shade from gray to white. Combines layered paper aesthetic with monogram concept. No text"
];

fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const headers = {
    'Content-Type': 'application/json',
    'hf-api-key': API_KEY,
    'hf-secret': API_SECRET
};

async function submitJob(prompt) {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            prompt,
            num_images: 1,
            aspect_ratio: '1:1',
            input_images: [],
            output_format: 'png',
            safety_settings: []
        })
    });
    return res.json();
}

async function pollStatus(statusUrl, maxWait = 120) {
    const start = Date.now();
    while (Date.now() - start < maxWait * 1000) {
        const res = await fetch(statusUrl, { headers });
        const data = await res.json();
        if (data.status === 'completed' && data.images?.length) return data.images[0].url;
        if (data.status === 'failed') throw new Error(`Job failed`);
        await new Promise(r => setTimeout(r, 3000));
    }
    throw new Error('Timeout');
}

async function downloadImage(url, filepath) {
    const res = await fetch(url);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(filepath, buffer);
}

async function generateLogo(label, prompt, filename) {
    try {
        console.log(`[${label}] Submitting...`);
        const job = await submitJob(prompt);
        if (!job.status_url) { console.error(`[${label}] No status_url:`, job); return null; }
        console.log(`[${label}] Queued → ${job.request_id}`);
        const imageUrl = await pollStatus(job.status_url);
        const filepath = path.join(OUTPUT_DIR, filename);
        await downloadImage(imageUrl, filepath);
        console.log(`[${label}] ✅ ${filename}`);
        return filepath;
    } catch (err) {
        console.error(`[${label}] ❌ ${err.message}`);
        return null;
    }
}

async function processBatch(prompts, prefix, groupLabel) {
    console.log(`\n🎨 Generating ${groupLabel}...\n`);
    const results = [];
    for (let i = 0; i < prompts.length; i += 4) {
        const batch = prompts.slice(i, i + 4);
        const batchResults = await Promise.all(
            batch.map((prompt, j) => {
                const idx = i + j + 1;
                return generateLogo(`${groupLabel} ${idx}/${prompts.length}`, prompt, `${prefix}_${String(idx).padStart(2, '0')}.png`);
            })
        );
        results.push(...batchResults);
        if (i + 4 < prompts.length) {
            console.log(`  ⏳ Next batch...`);
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    return results;
}

async function main() {
    console.log(`\n🚀 Generating 25 refined logo variations\n${'═'.repeat(50)}`);

    const r1 = await processBatch(PAPER_WING_PROMPTS, 'paper', 'Paper Wing Variations');
    const r2 = await processBatch(W_BIRD_PROMPTS, 'wbird', 'W-Bird Variations');
    const r3 = await processBatch(MIXED_PROMPTS, 'mixed', 'Mixed Concepts');

    const all = [...r1, ...r2, ...r3];
    const ok = all.filter(Boolean).length;
    console.log(`\n${'═'.repeat(50)}\n✅ Done! ${ok}/${all.length} logos generated.\n📁 ${OUTPUT_DIR}\n`);
}

main().catch(console.error);
