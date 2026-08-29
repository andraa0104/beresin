const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Lightweight valid PNG generator with zero dependencies
function createPNG(width, height, r, g, b) {
  // Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // CRC32 implementation
  const crcTable = [];
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    crcTable[n] = c;
  }

  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type);
    const body = Buffer.concat([typeBuf, data]);
    const crcVal = crc32(body);
    const crcBuf = Buffer.alloc(4);
    crcBuf.writeUInt32BE(crcVal, 0);
    return Buffer.concat([len, body, crcBuf]);
  }

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 2; // color type: 2 (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // Raw image scanlines
  // Each scanline begins with filter byte (0)
  const lineSize = 1 + width * 3;
  const rawData = Buffer.alloc(height * lineSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * lineSize;
    rawData[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pixelOffset = rowOffset + 1 + x * 3;
      // Beautiful gradient background
      const ratio = (x + y) / (width + height);
      const pr = Math.round(r * (1 - ratio * 0.3));
      const pg = Math.round(g * (1 - ratio * 0.2 + ratio * 0.4));
      const pb = Math.min(255, Math.round(b * (1 + ratio * 0.2)));

      rawData[pixelOffset] = pr;
      rawData[pixelOffset + 1] = pg;
      rawData[pixelOffset + 2] = pb;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idat = makeChunk('IDAT', compressed);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

const iconsDir = path.resolve(__dirname, '../public/icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate valid 192x192, 512x512, apple-touch-icon binary PNGs with Beresin Brand Blue (#0284c7: R=2, G=132, B=199)
const png192 = createPNG(192, 192, 2, 132, 199);
const png512 = createPNG(512, 512, 2, 132, 199);

fs.writeFileSync(path.join(iconsDir, 'icon-192.png'), png192);
fs.writeFileSync(path.join(iconsDir, 'icon-512.png'), png512);
fs.writeFileSync(path.join(iconsDir, 'icon-512-maskable.png'), png512);
fs.writeFileSync(path.join(iconsDir, 'apple-touch-icon.png'), png192);

console.log('✓ Authentic valid binary PNG icons generated successfully for PWA manifest.');
