import { mkdir, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import sharp from "sharp";
import { TYPE_CODES } from "../src/types.js";

const sourceDirectory = resolve("characters");
const outputDirectory = resolve("public", "characters");
const sourceFiles = new Set((await readdir(sourceDirectory)).map((file) => file.toLowerCase()));

await mkdir(outputDirectory, { recursive: true });

for (const code of TYPE_CODES) {
  const basename = code.toLowerCase();
  const sourceName = ["png", "jpg", "jpeg"].map((extension) => `${basename}.${extension}`).find((name) => sourceFiles.has(name));
  if (!sourceName) throw new Error(`缺少角色原图：${basename}.png/.jpg/.jpeg`);
  const source = resolve(sourceDirectory, sourceName);
  const metadata = await sharp(source).metadata();
  if (metadata.width !== 1600 || metadata.height !== 2000) {
    throw new Error(`${sourceName} 应为 1600×2000，当前为 ${metadata.width}×${metadata.height}。`);
  }
  await sharp(source).webp({ quality: 92, alphaQuality: 100, smartSubsample: true }).toFile(resolve(outputDirectory, `${basename}.webp`));
  process.stdout.write(`converted ${sourceName} -> public/characters/${basename}.webp\n`);
}
