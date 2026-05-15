/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const ffmpeg = require("ffmpeg-static");

const sourceDir = path.join(process.cwd(), "public", "sounds", "chess");
const outputDir = path.join(process.cwd(), "public", "sounds", "chess-fixed");

if (!ffmpeg) {
  console.error("ffmpeg-static did not provide an ffmpeg binary.");
  process.exit(1);
}

if (!fs.existsSync(sourceDir)) {
  console.error(`Source folder not found: ${sourceDir}`);
  console.error("Expected files in: public/sounds/chess/*.mp3");
  process.exit(1);
}

fs.mkdirSync(outputDir, { recursive: true });

const files = fs.readdirSync(sourceDir).filter((file) => file.endsWith(".mp3"));

if (files.length === 0) {
  console.error(`No .mp3 files found in: ${sourceDir}`);
  process.exit(1);
}

for (const file of files) {
  const inputPath = path.join(sourceDir, file);
  const outputPath = path.join(outputDir, file);

  console.log(`Processing ${file}...`);

  const result = spawnSync(
    ffmpeg,
    [
      "-y",
      "-hide_banner",
      "-loglevel",
      "error",
      "-i",
      inputPath,
      "-af",
      "adelay=20|20,afade=t=in:st=0:d=0.006,apad=pad_dur=0.06,volume=0.75",
      "-ar",
      "44100",
      "-ac",
      "2",
      "-b:a",
      "160k",
      outputPath,
    ],
    { stdio: "inherit" }
  );

  if (result.status !== 0) {
    console.error(`Failed to process ${file}`);
    process.exit(result.status ?? 1);
  }
}

console.log("");
console.log(`Done. Fixed sounds written to: ${outputDir}`);
