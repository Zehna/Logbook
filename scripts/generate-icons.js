const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

// Helper membuat PNG valid tanpa dependensi eksternal
function createPNG(size) {
  const width = size;
  const height = size;

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr.writeUInt8(8, 8); // bit depth
  ihdr.writeUInt8(6, 9); // RGBA
  ihdr.writeUInt8(0, 10); // compression
  ihdr.writeUInt8(0, 11); // filter
  ihdr.writeUInt8(0, 12); // interlace

  // Raw bitmap dengan filter byte 0 di tiap baris
  const rowBytes = width * 4;
  const rawData = Buffer.alloc(height * (rowBytes + 1));

  for (let y = 0; y < height; y++) {
    const rowOffset = y * (rowBytes + 1);
    rawData[rowOffset] = 0; // Filter 0 (None)

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      // Desain gradien Indigo-Violet dengan aksen buku/dokumen
      const rx = x / width;
      const ry = y / height;

      // Rounded icon boundary
      const dx = Math.abs(x - width / 2) / (width / 2);
      const dy = Math.abs(y - height / 2) / (height / 2);
      const isInside = Math.pow(dx, 4) + Math.pow(dy, 4) <= 1;

      if (isInside) {
        // Indigo (79, 70, 229) ke Violet (124, 58, 237)
        const r = Math.round(79 + 45 * rx);
        const g = Math.round(70 - 12 * ry);
        const b = Math.round(229 + 8 * rx);

        // Gambar aksen dokumen putih di tengah
        const isDoc =
          x >= width * 0.28 &&
          x <= width * 0.72 &&
          y >= height * 0.25 &&
          y <= height * 0.75;

        if (isDoc) {
          rawData[pxOffset] = 255;
          rawData[pxOffset + 1] = 255;
          rawData[pxOffset + 2] = 255;
          rawData[pxOffset + 3] = 255;
        } else {
          rawData[pxOffset] = r;
          rawData[pxOffset + 1] = g;
          rawData[pxOffset + 2] = b;
          rawData[pxOffset + 3] = 255;
        }
      } else {
        rawData[pxOffset] = 0;
        rawData[pxOffset + 1] = 0;
        rawData[pxOffset + 2] = 0;
        rawData[pxOffset + 3] = 0;
      }
    }
  }

  const idatData = zlib.deflateSync(rawData);

  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, "ascii");
    const crcBuf = Buffer.alloc(4);
    const crc = crc32(Buffer.concat([typeBuf, data]));
    crcBuf.writeUInt32BE(crc >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crcBuf]);
  }

  // Sederhana CRC32 implementasi
  function crc32(buf) {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c = (c >>> 8) ^ table[(c ^ buf[i]) & 0xff];
    }
    return (c ^ 0xffffffff) >>> 0;
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrChunk = makeChunk("IHDR", ihdr);
  const idatChunk = makeChunk("IDAT", idatData);
  const iendChunk = makeChunk("IEND", Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// CRC32 Lookup Table
const table = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  table[n] = c;
}

const targetDir = path.join(__dirname, "..", "extension", "icons");
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

[16, 48, 128].forEach((size) => {
  const pngBuf = createPNG(size);
  fs.writeFileSync(path.join(targetDir, `icon${size}.png`), pngBuf);
  console.log(`Generated icon${size}.png`);
});

// Buat juga icon.svg
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128">
  <rect width="128" height="128" rx="28" fill="#4F46E5"/>
  <path d="M38 32h52a4 4 0 0 1 4 4v56a4 4 0 0 1-4 4H38a4 4 0 0 1-4-4V36a4 4 0 0 1 4-4z" fill="#FFFFFF"/>
  <rect x="48" y="46" width="32" height="6" rx="3" fill="#4F46E5"/>
  <rect x="48" y="60" width="32" height="6" rx="3" fill="#818CF8"/>
  <rect x="48" y="74" width="22" height="6" rx="3" fill="#C7D2FE"/>
</svg>`;
fs.writeFileSync(path.join(targetDir, "icon.svg"), svg);
console.log("Generated icon.svg");
