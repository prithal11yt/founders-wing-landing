import fs from 'fs';
import path from 'path';

const API_URL = 'https://platform.higgsfield.ai/nano-banana';
const API_KEY = '34d0b29e-d39e-46d9-a841-9b9336d0d00a';
const API_SECRET = '293e2f4ae063a19f70f654999c82ec1e21f00b1b4380fee4b41e09c2f02449f8';

const OUTPUT_DIR = '/Users/prithal/.gemini/antigravity/brain/d50dafd1-1166-447c-b51c-bfde784712ba/fullname_logos';

const PROMPTS = [
    // 1 - Full wordmark constellation
    "Premium logo on pure black background. The text 'FOUNDERS WING' spelled out in uppercase where each letter is formed by connected white dots and thin white lines, like a constellation or star map. The dots sit at the key structural points of each letter, connected by fine lines to form readable text. Clean, elegant, wide letter spacing. The overall effect is a network/community constellation spelling out the brand name. No other elements",

    // 2 - Two-line stacked with constellation
    "Logo on solid black background. 'FOUNDERS' on the top line and 'WING' on the bottom line, both larger. Both words constructed from connected white dots and thin lines like a network graph. Each letter formed by nodes at corners and intersections connected by straight lines. Clean, modern, white on black. The word WING is bolder with slightly larger dots. Wide spacing between letters. No extra decorations",

    // 3 - Full name with icon above
    "Logo on pure black background. A small abstract wing shape made of connected dots and lines centered above the text 'FOUNDERS WING'. The text below is in clean modern uppercase sans-serif font, white, with generous letter spacing. The wing icon above uses the same connected-dots-and-lines visual language — about 6-8 dots forming a wing constellation. Cohesive brand mark combining icon and text. No other elements",

    // 4 - Connected dots wordmark with wing flourish
    "Logo on black background. The words 'FOUNDERS WING' in uppercase formed by white dots connected by thin lines. The final letter G has its tail extending upward and outward as a sweeping wing trail made of additional connected dots and a curving line — the wing flourish emerges naturally from the last letter. The constellation text transitions into a wing gesture. Premium, creative, unique. No other elements",

    // 5 - Minimal node wordmark
    "Minimalist logo on pure black background. 'FOUNDERS WING' written in a clean geometric sans-serif font, white, uppercase. At every corner and intersection point of each letter, a small white dot is placed — like nodes on a circuit board. The dots are subtle but visible, adding the connected-network texture to otherwise clean typography. Thin lines optionally connecting some dots across letters. Elegant, technical. No other elements",

    // 6 - FW constellation icon + full name text
    "Professional brand identity on black background. Left side: the letters FW formed by connected dots and lines in a constellation pattern, compact and iconic. Right side: 'Founders Wing' in clean modern sans-serif font, white, title case, vertically centered with the icon. A horizontal lockup. The FW icon uses about 8-10 dots with connecting lines. Clean separation between icon and text. Premium startup branding",

    // 7 - Full name with dots as letter terminals
    "Elegant logo on pure black background. 'FOUNDERS WING' in a custom uppercase sans-serif typeface where every stroke terminal ends in a small circle/dot. Thin lines connect some of these terminal dots across adjacent letters, creating a subtle network effect woven through the typography. The connections are sparse and elegant, not overwhelming. White on black. Wide tracking. Premium, distinctive",

    // 8 - Circular badge with constellation name
    "Badge-style logo on black background. A thin white circle enclosing the text 'FOUNDERS WING' along the top curve and an abstract wing constellation of connected dots at the center-bottom. The text follows the circle's inner curve at the top. The wing constellation inside is made of 5-7 dots connected by lines. Classic badge composition, modern execution. White on black",

    // 9 - Two words connected by constellation bridge
    "Creative logo on pure black background. The word 'FOUNDERS' on the left in clean white uppercase sans-serif, and the word 'WING' on the right in matching font. Between and connecting the two words, a constellation of dots and lines bridges the gap — linking the last letter S to the first letter W through a network of 4-5 connected nodes. The constellation bridge is the visual centerpiece connecting the two words like a community network. Elegant, meaningful",

    // 10 - Full constellation with readable text overlay
    "Logo on pure black background. A wide, horizontal constellation pattern of about 20-25 connected white dots and thin lines spread across the frame, forming an abstract wing/network shape. Overlaid on top of this constellation, the text 'FOUNDERS WING' in bold clean white uppercase sans-serif with slight transparency where it overlaps the constellation lines. The text and constellation coexist in the same space. Modern, layered, premium"
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
        body: JSON.stringify({ prompt, num_images: 1, aspect_ratio: '16:9', input_images: [], output_format: 'png', safety_settings: [] })
    });
    return res.json();
}

async function pollStatus(statusUrl, maxWait = 120) {
    const start = Date.now();
    while (Date.now() - start < maxWait * 1000) {
        const res = await fetch(statusUrl, { headers });
        const data = await res.json();
        if (data.status === 'completed' && data.images?.length) return data.images[0].url;
        if (data.status === 'failed') throw new Error('Job failed');
        await new Promise(r => setTimeout(r, 3000));
    }
    throw new Error('Timeout');
}

async function downloadImage(url, filepath) {
    const res = await fetch(url);
    fs.writeFileSync(filepath, Buffer.from(await res.arrayBuffer()));
}

async function generateLogo(idx, prompt) {
    const label = `FN${idx + 1}`;
    try {
        console.log(`[${label}] Submitting...`);
        const job = await submitJob(prompt);
        if (!job.status_url) { console.error(`[${label}] Error:`, job); return null; }
        console.log(`[${label}] Queued → ${job.request_id}`);
        const url = await pollStatus(job.status_url);
        const file = `fullname_v${String(idx + 1).padStart(2, '0')}.png`;
        await downloadImage(url, path.join(OUTPUT_DIR, file));
        console.log(`[${label}] ✅ ${file}`);
        return file;
    } catch (e) { console.error(`[${label}] ❌ ${e.message}`); return null; }
}

async function main() {
    console.log(`\n🌐 Generating 10 "Founders Wing" full-name constellation logos...\n`);
    const results = [];
    for (let i = 0; i < PROMPTS.length; i += 4) {
        const batch = PROMPTS.slice(i, i + 4);
        const r = await Promise.all(batch.map((p, j) => generateLogo(i + j, p)));
        results.push(...r);
        if (i + 4 < PROMPTS.length) {
            console.log(`  ⏳ Next batch...\n`);
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    console.log(`\n✅ Done! ${results.filter(Boolean).length}/10 generated.\n📁 ${OUTPUT_DIR}\n`);
}

main().catch(console.error);
