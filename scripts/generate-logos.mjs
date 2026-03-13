import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const API_URL = 'https://platform.higgsfield.ai/nano-banana';
const API_KEY = '34d0b29e-d39e-46d9-a841-9b9336d0d00a';
const API_SECRET = '293e2f4ae063a19f70f654999c82ec1e21f00b1b4380fee4b41e09c2f02449f8';

const OUTPUT_DIR = '/Users/prithal/.gemini/antigravity/brain/d50dafd1-1166-447c-b51c-bfde784712ba/nano_logos';

const PROMPTS = [
    // 1-4: Minimalist abstract wings
    "Minimalist vector logo, single abstract wing made of 3 clean curved strokes, white on pure black background, ultra premium tech brand, no text",
    "Sleek minimal logo, single geometric wing formed by overlapping triangles pointing upward, white on black, modern startup aesthetic, no text",
    "Abstract logo mark, a stylized wing created from a single continuous line, elegant and flowing, white on black background, luxury branding, no text",
    "Minimalist logo, angular wing shape inspired by origami folds, sharp precise edges, white on black, architectural feel, no text",

    // 5-8: F + W monograms
    "Monogram logo combining letters F and W into a wing silhouette, clean line art, white on black background, premium founder brand identity, no text below",
    "Geometric monogram FW where the W forms wing tips, minimalist linework, white on solid black, tech startup aesthetic, no text",
    "Elegant monogram merging F and W letterforms into an eagle wing shape, thin precise strokes, white on black, luxury tech brand, no text",
    "Bold stylized FW monogram with negative space forming a wing, modern and striking, white on black background, no text",

    // 9-12: Shield and crest concepts
    "Premium shield crest logo with abstract wing emerging from side, clean lines, white and cyan gradient on black, exclusive membership brand, no text",
    "Minimalist heraldic crest with two wings forming a V shape, geometric precision, white on black, tech elite community brand, no text",
    "Modern crest logo, circular badge with a single wing inside, clean and sophisticated, white on black background, premium brand, no text",
    "Diamond shaped emblem with stylized wing motif, geometric art deco inspired, white and teal on black background, exclusive club brand, no text",

    // 13-16: Tech + AI fusion
    "Logo of symmetrical wings made from circuit board traces and nodes, glowing cyan on black background, AI technology brand, futuristic, no text",
    "Abstract wing formed by neural network nodes and connections, constellation style, white and cyan dots on black, AI community brand, no text",
    "Logo mark of a wing transforming into data streams or binary, half organic half digital, white on black, tech founder brand, no text",
    "Geometric wing constructed from hexagonal grid pattern, clean and technical, white with subtle cyan accents on black, AI brand, no text",

    // 17-20: Feather + hybrid concepts
    "Single elegant feather logo, left half organic and right half fragmenting into geometric pixels, white on black, founder meets AI brand, no text",
    "Quill feather transforming into an upward rocket trail, minimalist single stroke, white on black background, startup momentum brand, no text",
    "Abstract feather made of layered transparent planes, depth and dimension, white on black, premium modern brand mark, no text",
    "Logo of a feather whose barbs are made of small upward arrows, symbolizing growth and community, white on black, founder brand, no text"
];

// Ensure output dir exists
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
        if (data.status === 'completed' && data.images?.length) {
            return data.images[0].url;
        }
        if (data.status === 'failed') {
            throw new Error(`Job failed: ${JSON.stringify(data)}`);
        }
        await new Promise(r => setTimeout(r, 3000));
    }
    throw new Error('Timeout waiting for image');
}

async function downloadImage(url, filepath) {
    const res = await fetch(url);
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(filepath, buffer);
}

async function generateLogo(index, prompt) {
    const label = `Logo ${index + 1}/20`;
    try {
        console.log(`[${label}] Submitting: ${prompt.slice(0, 60)}...`);
        const job = await submitJob(prompt);
        if (!job.status_url) {
            console.error(`[${label}] No status_url:`, job);
            return null;
        }
        console.log(`[${label}] Queued → ${job.request_id}`);

        const imageUrl = await pollStatus(job.status_url);
        const filename = `logo_nb_${String(index + 1).padStart(2, '0')}.png`;
        const filepath = path.join(OUTPUT_DIR, filename);
        await downloadImage(imageUrl, filepath);
        console.log(`[${label}] ✅ Saved: ${filename}`);
        return filepath;
    } catch (err) {
        console.error(`[${label}] ❌ Error:`, err.message);
        return null;
    }
}

async function main() {
    console.log(`\n🎨 Generating 20 Founders Wing logos via Nano Banana Pro...\n`);

    // Process in batches of 4 to avoid overwhelming the API
    const results = [];
    for (let i = 0; i < PROMPTS.length; i += 4) {
        const batch = PROMPTS.slice(i, i + 4);
        const batchResults = await Promise.all(
            batch.map((prompt, j) => generateLogo(i + j, prompt))
        );
        results.push(...batchResults);

        // Small delay between batches
        if (i + 4 < PROMPTS.length) {
            console.log(`\n⏳ Batch done, starting next batch...\n`);
            await new Promise(r => setTimeout(r, 2000));
        }
    }

    const successful = results.filter(Boolean);
    console.log(`\n✅ Done! Generated ${successful.length}/20 logos.`);
    console.log(`📁 Saved to: ${OUTPUT_DIR}\n`);
}

main().catch(console.error);
