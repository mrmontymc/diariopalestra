import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

// Function to calculate CRC32 for PNG chunks
function crc32(buf) {
  let table = [];
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }

  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = table[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const crcData = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcData);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function generatePNG(width, height, isMaskable = false) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw bitmap with scanline filter bytes
  const bytesPerPixel = 4;
  const rowSize = 1 + width * bytesPerPixel;
  const rawData = Buffer.alloc(height * rowSize);

  const cx = width / 2;
  const cy = height / 2;
  const scale = width / 512;
  const rBg = width * 0.46;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * bytesPerPixel;

      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background: Deep dark zinc #09090b with subtle radial glow
      let r = 9, g = 9, b = 11, a = 255;

      // Outer squircle or circle background
      if (!isMaskable) {
        // Rounded corner container
        const cornerR = width * 0.22;
        const inBox = Math.abs(dx) <= (cx - cornerR) || Math.abs(dy) <= (cy - cornerR);
        const nearCorner = Math.sqrt(
          Math.pow(Math.max(0, Math.abs(dx) - (cx - cornerR)), 2) +
          Math.pow(Math.max(0, Math.abs(dy) - (cy - cornerR)), 2)
        ) <= cornerR;

        if (!inBox && !nearCorner) {
          rawData[pxOffset] = 0;
          rawData[pxOffset + 1] = 0;
          rawData[pxOffset + 2] = 0;
          rawData[pxOffset + 3] = 0;
          continue;
        }
      }

      // Emerald radial glow in center
      const glow = Math.max(0, 1 - dist / (width * 0.45));
      r = Math.min(255, Math.round(9 + glow * 10));
      g = Math.min(255, Math.round(9 + glow * 45));
      b = Math.min(255, Math.round(11 + glow * 25));

      // Draw Barbells / Dumbbell icon
      // Center bar: horizontal rect
      const barHalfW = 120 * scale;
      const barHalfH = 14 * scale;
      const inBar = Math.abs(dx) <= barHalfW && Math.abs(dy) <= barHalfH;

      // Dumbbell Plates (left and right)
      // Big outer plates
      const plate1X = 85 * scale;
      const plate1W = 16 * scale;
      const plate1H = 80 * scale;
      const inPlate1 = (Math.abs(dx - plate1X) <= plate1W || Math.abs(dx + plate1X) <= plate1W) && Math.abs(dy) <= plate1H;

      // Medium outer plates
      const plate2X = 115 * scale;
      const plate2W = 14 * scale;
      const plate2H = 65 * scale;
      const inPlate2 = (Math.abs(dx - plate2X) <= plate2W || Math.abs(dx + plate2X) <= plate2W) && Math.abs(dy) <= plate2H;

      // Collars
      const collarX = 60 * scale;
      const collarW = 8 * scale;
      const collarH = 25 * scale;
      const inCollar = (Math.abs(dx - collarX) <= collarW || Math.abs(dx + collarX) <= collarW) && Math.abs(dy) <= collarH;

      // Central Flame icon (orange/amber gradient above center)
      const flameDy = dy + 35 * scale;
      const flameDist = Math.sqrt(dx * dx + flameDy * flameDy);
      const inFlame = (flameDy < 20 * scale && flameDy > -70 * scale && Math.abs(dx) < (35 * scale * (1 - flameDy / (50 * scale))));

      if (inBar || inCollar) {
        // Metallic steel / emerald tint
        r = 160; g = 175; b = 185;
      } else if (inPlate1 || inPlate2) {
        // Emerald 400 #34d399 plates
        r = 52; g = 211; b = 153;
      } else if (inFlame) {
        // Orange 500 #f97316 flame
        r = 249; g = 115; b = 22;
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const deflatedData = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', deflatedData);
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate files
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

console.log('Generating PWA PNG icons...');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), generatePNG(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), generatePNG(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), generatePNG(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), generatePNG(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), generatePNG(64, 64, false));

// Generate icon.svg
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="110" fill="#09090b"/>
  <circle cx="256" cy="256" r="220" fill="url(#glow)" opacity="0.4"/>
  <defs>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#10b981" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#09090b" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="barGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#71717a"/>
      <stop offset="50%" stop-color="#e4e4e7"/>
      <stop offset="100%" stop-color="#71717a"/>
    </linearGradient>
    <linearGradient id="plateGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
    <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#ea580c"/>
      <stop offset="50%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#fbbf24"/>
    </linearGradient>
  </defs>

  <!-- Barbells / Dumbbells -->
  <rect x="136" y="242" width="240" height="28" rx="14" fill="url(#barGrad)" />
  
  <!-- Left plates -->
  <rect x="190" y="226" width="16" height="60" rx="6" fill="#52525b" />
  <rect x="156" y="176" width="28" height="160" rx="10" fill="url(#plateGrad)" stroke="#10b981" stroke-width="4" />
  <rect x="124" y="196" width="24" height="120" rx="8" fill="url(#plateGrad)" opacity="0.9" />

  <!-- Right plates -->
  <rect x="306" y="226" width="16" height="60" rx="6" fill="#52525b" />
  <rect x="328" y="176" width="28" height="160" rx="10" fill="url(#plateGrad)" stroke="#10b981" stroke-width="4" />
  <rect x="364" y="196" width="24" height="120" rx="8" fill="url(#plateGrad)" opacity="0.9" />

  <!-- Center Flame Badge -->
  <path d="M256 120 C275 160 300 185 290 220 C280 250 256 260 256 260 C256 260 232 250 222 220 C212 185 237 160 256 120 Z" fill="url(#flameGrad)" />
  <path d="M256 165 C266 190 276 205 272 225 C268 242 256 250 256 250 C256 250 244 242 240 225 C236 205 246 190 256 165 Z" fill="#fef08a" opacity="0.9"/>
</svg>`;

fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);
console.log('PWA icons created successfully in public/');
