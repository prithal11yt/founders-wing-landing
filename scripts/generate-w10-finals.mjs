import fs from 'fs';
import path from 'path';

const API_URL = 'https://platform.higgsfield.ai/nano-banana';
const API_KEY = '34d0b29e-d39e-46d9-a841-9b9336d0d00a';
const API_SECRET = '293e2f4ae063a19f70f654999c82ec1e21f00b1b4380fee4b41e09c2f02449f8';

const OUTPUT_DIR = '/Users/prithal/.gemini/antigravity/brain/d50dafd1-1166-447c-b51c-bfde784712ba/w10_finals';

const PROMPTS = [
    // 1 - Cleaner, more precise nodes
    "Premium minimal logo on pure black background. A W letterform constructed entirely from connected dots and thin lines, like a network graph. Exactly 7-9 white dots of varying sizes connected by crisp thin white lines to form the shape of the letter W. The larger dots are at the peaks and valleys of the W. The overall shape also subtly suggests a bird with spread wings. Clean, precise, balanced. No text, no gradients, no glow",

    // 2 - Fewer nodes, bolder impact
    "Minimalist logo on solid black background. A bold W shape formed by just 5 large white circular dots connected by clean straight white lines. The 5 dots sit at the 5 key points of the W — bottom-left, top-left, center-bottom, top-right, bottom-right. Lines connect them crisply. Simple, iconic, the fewer dots make it more memorable and scalable. No text",

    // 3 - Wing-shaped constellation
    "Logo on pure black background. Connected white dots and thin lines forming the shape of spread bird wings that also read as a W when viewed as a whole. The dots are like stars in a constellation — some larger as anchor points, some smaller as secondary nodes. The wing tips have slightly more dots clustered together. Ethereal, premium, community-inspired. No text",

    // 4 - Network cluster with W structure
    "Professional logo on black background. A network graph of about 12-15 small white dots connected by thin lines, organically arranged but with an underlying W structure visible in the overall shape. Some clusters are denser, suggesting community hubs. The connections between clusters form the W shape. Think LinkedIn meets constellation. No text, white only",

    // 5 - Geometric W with node intersections
    "Clean geometric logo on pure black background. A W shape made from 4 straight white lines, with small filled white circles (nodes) at every intersection and endpoint. The lines have medium thickness, the dots are slightly larger than the line width. Very clean, very structured, like a tech blueprint or circuit diagram. Precise, professional. No text",

    // 6 - Asymmetric dynamic constellation W
    "Dynamic logo on solid black background. Connected dots forming a W shape, but with an asymmetric, slightly organic layout — the dots are not perfectly aligned, giving the shape a natural, hand-plotted feel like a real star constellation. Thin connecting lines of varying opacity. The right wing of the W extends slightly higher than the left, suggesting upward flight. White on black. No text",

    // 7 - Gradient-sized nodes W
    "Elegant logo on pure black background. A W shape formed by about 10 white dots connected by fine lines. The dots gradually increase in size from the bottom-center of the W outward to the wing tips, creating a sense of growth and expansion radiating outward. This gradient in dot size adds visual depth and direction. Symbolizes a community growing outward. No text",

    // 8 - Double-line connected W
    "Sophisticated logo on black background. A W-bird shape where each connection between nodes is a double parallel line instead of a single line, giving it a more substantial, premium feel. The node dots are medium-sized, uniformly white. The double-line treatment makes it feel like runway lights or a flight path. Clean, distinctive, memorable. No text",

    // 9 - W constellation with one highlighted node
    "Striking logo on pure black background. A W-bird constellation of connected white dots and lines, but with one single node at the top center peak highlighted slightly larger than the rest — representing the focal founder in the community. All other nodes are equal-sized. The highlighted node is the anchor point of the composition. Leadership within community. No text",

    // 10 - Enclosed circular W constellation
    "Premium logo on black background. A thin white circle enclosing a W-bird shape made from connected dots and lines inside it. The constellation W sits centered within the circular border, some nodes touching or near the circle edge. The circle represents unity and inclusiveness, the internal constellation represents the networked community. Badge-like, iconic, versatile. No text"
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
        body: JSON.stringify({ prompt, num_images: 1, aspect_ratio: '1:1', input_images: [], output_format: 'png', safety_settings: [] })
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
    const label = `W10v${idx + 1}`;
    try {
        console.log(`[${label}] Submitting...`);
        const job = await submitJob(prompt);
        if (!job.status_url) { console.error(`[${label}] Error:`, job); return null; }
        console.log(`[${label}] Queued → ${job.request_id}`);
        const url = await pollStatus(job.status_url);
        const file = `w10_v${String(idx + 1).padStart(2, '0')}.png`;
        await downloadImage(url, path.join(OUTPUT_DIR, file));
        console.log(`[${label}] ✅ ${file}`);
        return file;
    } catch (e) { console.error(`[${label}] ❌ ${e.message}`); return null; }
}

async function main() {
    console.log(`\n🌐 Generating 10 W10 constellation variations...\n`);
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
