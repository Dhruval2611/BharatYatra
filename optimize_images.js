import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function optimizeDirectory(dirRelative, maxWidth) {
  const dirPath = path.join(__dirname, 'public', dirRelative);
  console.log(`Optimizing directory: ${dirPath}`);
  
  try {
    const files = await fs.readdir(dirPath);
    for (const file of files) {
      if (!file.match(/\.(jpg|jpeg|png|avif)$/i)) continue;

      const inputPath = path.join(dirPath, file);
      const parsedPath = path.parse(inputPath);
      const outputPath = path.join(dirPath, `${parsedPath.name}.webp`);

      // Don't recreate webp if checking a webp (we don't match webp above, but just in case)
      if (parsedPath.ext.toLowerCase() === '.webp') continue;

      console.log(`Processing: ${file}`);
      
      const image = sharp(inputPath);
      const metadata = await image.metadata();

      let pipeline = image;
      if (metadata.width > maxWidth) {
        pipeline = pipeline.resize({ width: maxWidth, withoutEnlargement: true });
      }

      await pipeline.webp({ quality: 80 }).toFile(outputPath);
      console.log(`Saved: ${parsedPath.name}.webp`);
    }
  } catch (err) {
    console.error(`Error processing ${dirRelative}:`, err);
  }
}

async function main() {
  await optimizeDirectory('images/most visited places', 800);
  await optimizeDirectory('images/showcase', 1200);
  console.log('Image optimization completed.');
}

main();
