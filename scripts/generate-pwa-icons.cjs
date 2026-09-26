const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// Helper to create CRC32 table
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
  let crc = -1;
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xff];
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, "ascii");
  const crcData = Buffer.concat([typeBuf, data]);

  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcData), 0);

  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, isMaskable = false) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // bit depth 8
  ihdrData.writeUInt8(6, 9); // RGBA
  ihdrData.writeUInt8(0, 10);
  ihdrData.writeUInt8(0, 11);
  ihdrData.writeUInt8(0, 12);
  const ihdr = makeChunk("IHDR", ihdrData);

  // Raw bitmap: each line starts with filter byte 0
  const rowLen = 1 + width * 4;
  const raw = Buffer.alloc(height * rowLen);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * (isMaskable ? 0.48 : 0.42);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLen;
    raw[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background color: #0f766e (Teal 700: r=15, g=118, b=110)
      let r = 15, g = 118, b = 110, a = 255;

      // Inner book icon shape simulation
      // Book dimensions
      const bw = width * 0.45;
      const bh = height * 0.35;
      const inBookX = Math.abs(dx) <= bw / 2;
      const inBookY = dy >= -bh / 2 && dy <= bh / 2;

      // Spine in center
      const inSpine = Math.abs(dx) <= width * 0.02 && inBookY;

      if (inBookX && inBookY && !inSpine) {
        // Book pages white: #ffffff
        r = 255;
        g = 255;
        b = 255;
      } else if (inSpine) {
        // Spine color: #fbbf24 (Amber/Gold)
        r = 251;
        g = 191;
        b = 36;
      }

      // Small bookmark ribbon top right
      if (dx >= width * 0.08 && dx <= width * 0.14 && dy >= -height * 0.22 && dy <= -height * 0.05) {
        r = 244;
        g = 63;
        b = 94; // Rose accent
      }

      raw[pxOffset] = r;
      raw[pxOffset + 1] = g;
      raw[pxOffset + 2] = b;
      raw[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(raw);
  const idat = makeChunk("IDAT", compressed);
  const iend = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

const iconsDir = path.join(__dirname, "../public/icons");
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

fs.writeFileSync(path.join(iconsDir, "icon-192x192.png"), createPng(192, 192, false));
fs.writeFileSync(path.join(iconsDir, "icon-512x512.png"), createPng(512, 512, false));
fs.writeFileSync(path.join(iconsDir, "icon-maskable-192x192.png"), createPng(192, 192, true));
fs.writeFileSync(path.join(iconsDir, "icon-maskable-512x512.png"), createPng(512, 512, true));
fs.writeFileSync(path.join(iconsDir, "apple-touch-icon.png"), createPng(180, 180, false));

// Also generate a clean vector SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="128" fill="#0f766e"/>
  <path d="M120 180 C180 160 256 180 256 180 C256 180 332 160 392 180 L392 340 C332 320 256 340 256 340 C256 340 180 320 120 340 Z" fill="#ffffff"/>
  <line x1="256" y1="180" x2="256" y2="340" stroke="#fbbf24" stroke-width="12" stroke-linecap="round"/>
  <path d="M300 170 L300 240 L315 225 L330 240 L330 170 Z" fill="#f43f5e"/>
</svg>`;
fs.writeFileSync(path.join(iconsDir, "icon.svg"), svgContent);

console.log("PWA Icons successfully generated in public/icons/!");
