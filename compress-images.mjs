import sharp from 'sharp';
import { readdir, stat, rename, unlink } from 'fs/promises';
import { join } from 'path';

const publicDir = './public';
const MAX_WIDTH = 1920;
const QUALITY = 80;

async function compressImages() {
  const files = await readdir(publicDir);
  
  for (const file of files) {
    if (!file.match(/\.(png|jpg|jpeg)$/i)) continue;
    
    const filePath = join(publicDir, file);
    const fileStats = await stat(filePath);
    const sizeMB = (fileStats.size / (1024 * 1024)).toFixed(2);
    
    if (fileStats.size < 500 * 1024) {
      console.log(`⏭️  Skipping ${file} (${sizeMB}MB - already small)`);
      continue;
    }
    
    console.log(`🔄 Compressing ${file} (${sizeMB}MB)...`);
    
    const tempPath = filePath + '.tmp.webp';
    const outputPath = filePath.replace(/\.(png|jpg|jpeg)$/i, '.webp');
    
    try {
      const metadata = await sharp(filePath).metadata();
      const width = metadata.width > MAX_WIDTH ? MAX_WIDTH : metadata.width;
      
      await sharp(filePath)
        .resize(width)
        .webp({ quality: QUALITY })
        .toFile(tempPath);
      
      const newStats = await stat(tempPath);
      const newSizeMB = (newStats.size / (1024 * 1024)).toFixed(2);
      
      // Remove original PNG and rename temp to final webp
      await unlink(filePath);
      await rename(tempPath, outputPath);
      
      console.log(`✅ ${file} → ${file.replace(/\.(png|jpg|jpeg)$/i, '.webp')} (${sizeMB}MB → ${newSizeMB}MB)`);
    } catch (err) {
      console.error(`❌ Error compressing ${file}:`, err.message);
    }
  }
  
  console.log('\n🎉 Done! All images compressed.');
}

compressImages();
