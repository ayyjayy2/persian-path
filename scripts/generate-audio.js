#!/usr/bin/env node
/**
 * generate-audio.js
 * Generates a .wav file for every Persian word in data.js using OpenAI TTS.
 *
 * Usage:
 *   1. Copy .env.example to .env and add your OpenAI API key
 *   2. npm install
 *   3. npm run generate-audio
 *
 * Files are saved to audio/{lessonId}-{index}.wav
 * Already-generated files are skipped automatically (safe to re-run).
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
const { LESSONS } = require("../data.js");

const AUDIO_DIR = path.join(__dirname, "../audio");
const VOICE = "nova";       // Options: alloy, echo, fable, onyx, nova, shimmer
const MODEL = "tts-1-hd";   // tts-1 (faster/cheaper) or tts-1-hd (higher quality)
const FORMAT = "wav";
const DELAY_MS = 1500;      // Delay between requests to stay under rate limits

if (!process.env.OPENAI_API_KEY) {
  console.error("❌  OPENAI_API_KEY not set. Copy .env.example to .env and add your key.");
  process.exit(1);
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function toAudioFileName(english, phonetic) {
  const clean = s => s
    .toLowerCase()
    .replace(/\(.*?\)/g, "")       // remove (parentheticals)
    .replace(/—.*$/, "")           // remove em-dash and after
    .replace(/[/|]/g, " ")         // slashes to spaces
    .replace(/[^a-z0-9\s-]/g, "")  // remove special chars
    .trim()
    .replace(/\s+/g, "-")          // spaces to hyphens
    .replace(/-+/g, "-")           // collapse multiple hyphens
    .replace(/^-|-$/g, "");        // trim leading/trailing hyphens
  return `${clean(english)}-${clean(phonetic)}.wav`;
}

async function main() {
  fs.mkdirSync(AUDIO_DIR, { recursive: true });

  let total = 0;
  let generated = 0;
  let skipped = 0;
  let failed = 0;

  for (const lesson of LESSONS) {
    console.log(`\n📚 Lesson: ${lesson.title} (${lesson.words.length} words)`);

    for (let i = 0; i < lesson.words.length; i++) {
      const word = lesson.words[i];
      const filename = toAudioFileName(word.english, word.phonetic);
      const filepath = path.join(AUDIO_DIR, filename);
      total++;

      if (fs.existsSync(filepath)) {
        console.log(`  ⏭  [${i + 1}/${lesson.words.length}] ${word.phonetic} — already exists`);
        skipped++;
        continue;
      }

      process.stdout.write(`  🎙  [${i + 1}/${lesson.words.length}] ${word.phonetic} (${word.english})... `);

      try {
        const response = await client.audio.speech.create({
          model: MODEL,
          voice: VOICE,
          input: word.persian,
          response_format: FORMAT,
        });

        const buffer = Buffer.from(await response.arrayBuffer());
        fs.writeFileSync(filepath, buffer);
        console.log(`✅ saved ${filename} (${(buffer.length / 1024).toFixed(1)} KB)`);
        generated++;
      } catch (err) {
        console.log(`❌ FAILED: ${err.message}`);
        failed++;
      }

      // Rate limit buffer
      if (i < lesson.words.length - 1) {
        await sleep(DELAY_MS);
      }
    }
  }

  console.log(`\n✨ Done! ${generated} generated, ${skipped} skipped, ${failed} failed — ${total} total words.`);
  if (generated > 0) {
    console.log(`\n📁 Audio files saved to: ${AUDIO_DIR}`);
    console.log(`   Commit them: git add audio/ && git commit -m "Add generated Persian audio files"`);
  }
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
