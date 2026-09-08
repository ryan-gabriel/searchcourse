/**
 * generate-seo-assets.mjs
 *
 * Generates placeholder SEO assets (site logo, favicons, OG image, Twitter
 * card, PWA manifest icons) into `public/seo/`.
 *
 * IMPORTANT: These are functional stand-ins so the site never serves broken
 * image URLs. Replace them with the real brand assets before launch:
 *
 *   Required dimensions / formats:
 *   - long-logo-dark.png  : 180x40  (light theme header logo, dark glyphs)
 *   - long-logo-light.png : 180x40  (dark theme header logo, light glyphs)
 *   - og-image.png        : 1200x630 (OG share card)
 *   - twitter-card.png    : 1200x600 (Twitter share card)
 *   - 16/32/48x16-icon.ico: real ICO favicons (16px, 32px, 48px)
 *   - 192/512x192-icon.ico: high-res favicons (or provide .png + update refs)
 *
 * Colors mirror src/app/globals.css design tokens.
 *
 * Run from the repo root:  node scripts/generate-seo-assets.mjs
 * Deps: none (uses built-in node:zlib).
 */

import { deflateSync } from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'seo');

const BRAND = {
    bg: '#12110f', // dark mode background / dark accent
    ink: '#faf9f7', // light mode background / accent-ink
    surface: '#faf9f7',
    accent: '#1a1917',
    muted: '#f0ece4',
    price: '#0b7a3b',
};

// ---------------------------------------------------------------------------
// Tiny pure-node RGBA rasterizer + PNG/ICO encoders (no external deps)
// ---------------------------------------------------------------------------

function hexToRgb(hex) {
    const h = hex.replace('#', '');
    return [
        parseInt(h.slice(0, 2), 16),
        parseInt(h.slice(2, 4), 16),
        parseInt(h.slice(4, 6), 16),
    ];
}

function lerp(a, b, t) {
    return Math.round(a + (b - a) * t);
}

class Canvas {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.data = new Uint8Array(width * height * 4);
    }

    set(x, y, [r, g, b], a = 255) {
        if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
        const i = (y * this.width + x) * 4;
        this.data[i] = r;
        this.data[i + 1] = g;
        this.data[i + 2] = b;
        this.data[i + 3] = a;
    }

    fill(color) {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.set(x, y, color);
            }
        }
    }

    verticalGradient(topColor, bottomColor) {
        for (let y = 0; y < this.height; y++) {
            const t = this.height <= 1 ? 0 : y / (this.height - 1);
            const c = [lerp(topColor[0], bottomColor[0], t), lerp(topColor[1], bottomColor[1], t), lerp(topColor[2], bottomColor[2], t)];
            for (let x = 0; x < this.width; x++) this.set(x, y, c);
        }
    }

    roundRect(x0, y0, w, h, radius, color) {
        for (let y = y0; y < y0 + h; y++) {
            for (let x = x0; x < x0 + w; x++) {
                // point-in-rounded-rect test
                const cx = Math.min(Math.max(x, x0 + radius), x0 + w - radius);
                const cy = Math.min(Math.max(y, y0 + radius), y0 + h - radius);
                const dx = x - cx;
                const dy = y - cy;
                if (dx * dx + dy * dy <= radius * radius) this.set(x, y, color);
                else if (x >= x0 && x < x0 + w && y >= y0 && y < y0 + h) this.set(x, y, color);
            }
        }
    }

    rect(x0, y0, w, h, color) {
        for (let y = y0; y < y0 + h; y++) {
            for (let x = x0; x < x0 + w; x++) this.set(x, y, color);
        }
    }
}

// Book glyph: two rounded vertical bars with a center gutter (drawn relative)
function drawBookGlyph(canvas, cx, cy, size, color, radius) {
    const barW = Math.max(1, Math.round(size * 0.32));
    const gutter = Math.max(1, Math.round(size * 0.12));
    const halfW = Math.round(size * 0.34);
    canvas.roundRect(cx - halfW, cy - size / 2, barW, size, radius, color);
    canvas.roundRect(cx + halfW - barW, cy - size / 2, barW, size, radius, color);
}

function encodePng(canvas) {
    const { width, height, data } = canvas;
    const raw = Buffer.alloc((width * 4 + 1) * height);
    for (let y = 0; y < height; y++) {
        raw[y * (width * 4 + 1)] = 0; // filter: none
        const start = y * width * 4;
        raw.set(data.subarray(start, start + width * 4), y * (width * 4 + 1) + 1);
    }

    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(width, 0);
    ihdr.writeUInt32BE(height, 4);
    ihdr[8] = 8; // bit depth
    ihdr[9] = 6; // color type RGBA
    ihdr[10] = 0;
    ihdr[11] = 0;
    ihdr[12] = 0;

    const idat = deflateSync(raw);
    const chunks = [chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))];
    return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), ...chunks]);
}

function crc32(buf) {
    let c;
    const table = crc32.table || (crc32.table = (() => {
        const t = new Uint32Array(256);
        for (let n = 0; n < 256; n++) {
            c = n;
            for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
            t[n] = c >>> 0;
        }
        return t;
    })());
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, 'ascii');
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
    return Buffer.concat([len, typeBuf, data, crc]);
}

// ICO that embeds a PNG payload (supported by all modern browsers)
function encodeIco(pngBuffer, size) {
    const header = Buffer.alloc(6);
    header.writeUInt16LE(0, 0); // reserved
    header.writeUInt16LE(1, 2); // type: icon
    header.writeUInt16LE(1, 4); // count

    const entry = Buffer.alloc(16);
    entry[0] = size >= 256 ? 0 : size;
    entry[1] = size >= 256 ? 0 : size;
    entry[2] = 0; // palette
    entry[3] = 0; // reserved
    entry.writeUInt16LE(1, 4); // planes
    entry.writeUInt16LE(32, 6); // bit count
    entry.writeUInt32LE(pngBuffer.length, 8);
    entry.writeUInt32LE(22, 12); // offset

    return Buffer.concat([header, entry, pngBuffer]);
}

function save(filename, buffer) {
    const filePath = join(OUT_DIR, filename);
    writeFileSync(filePath, buffer);
    console.log(`  writing ${filename}`);
}

// ---------------------------------------------------------------------------
// Asset definitions
// ---------------------------------------------------------------------------

function favicon(size) {
    const c = new Canvas(size, size);
    c.fill(hexToRgb(BRAND.bg));
    const mark = hexToRgb(BRAND.ink);
    const glyphSize = Math.round(size * 0.56);
    const rd = Math.max(2, Math.round(size * 0.14));
    drawBookGlyph(c, Math.round(size / 2), Math.round(size / 2), glyphSize, mark, rd);
    return encodeIco(encodePng(c), size);
}

function longLogo(dark) {
    // Header logo: 180x40, brand mark + faux wordmark bars
    const w = 180;
    const h = 40;
    const c = new Canvas(w, h);
    c.fill([0, 0, 0, 0]); // transparent background
    const markColor = dark ? hexToRgb(BRAND.ink) : hexToRgb(BRAND.accent);
    const markBg = dark ? hexToRgb(BRAND.bg) : hexToRgb(BRAND.accent);
    const textColor = dark ? hexToRgb(BRAND.ink) : hexToRgb(BRAND.accent);

    const markSize = 28;
    c.roundRect(2, (h - markSize) / 2, markSize, markSize, 8, markBg);
    const glyphColor = dark ? hexToRgb(BRAND.ink) : hexToRgb(BRAND.ink);
    drawBookGlyph(c, 2 + markSize / 2, h / 2, Math.round(markSize * 0.52), glyphColor, 3);

    // faux text bars
    const barX = markSize + 12;
    const barY = 12;
    c.roundRect(barX, barY + 3, 96, 5, 2, textColor); // line 1
    c.roundRect(barX, barY + 16, 74, 4, 2, textColor.map((v) => Math.round(v * 0.6))); // line 2 (dimmed)
    return encodePng(c);
}

function socialCard(width, height) {
    const c = new Canvas(width, height);
    c.verticalGradient(hexToRgb(BRAND.accent), hexToRgb(BRAND.bg));

    // brand mark, centered
    const markSize = Math.round(height * 0.34);
    const cx = Math.round(width / 2);
    const cy = Math.round(height * 0.44);
    drawBookGlyph(c, cx, cy, markSize, hexToRgb(BRAND.ink), Math.round(markSize * 0.16));

    // faux headline bars
    const barW = Math.round(width * 0.34);
    const hx = Math.round(width / 2);
    const baseY = cy + Math.round(markSize * 0.7) + 18;
    c.roundRect(hx - barW / 2, baseY, barW, Math.round(height * 0.028), Math.round(height * 0.014), hexToRgb(BRAND.ink));
    c.roundRect(hx - barW / 2.8, baseY + Math.round(height * 0.055), barW / 1.42, Math.round(height * 0.022), Math.round(height * 0.011), hexToRgb(BRAND.muted));

    // price accent line
    c.roundRect(hx - Math.round(width * 0.1), baseY + Math.round(height * 0.12), Math.round(width * 0.2), Math.round(height * 0.014), Math.round(height * 0.007), hexToRgb(BRAND.price));
    return encodePng(c);
}

// ---------------------------------------------------------------------------

mkdirSync(OUT_DIR, { recursive: true });
console.log('Generating SEO placeholder assets into public/seo/');

// Icons / favicons
save('16x16-icon.ico', favicon(16));
save('32x32-icon.ico', favicon(32));
save('48x48-icon.ico', favicon(48));
save('192x192-icon.ico', favicon(192));
save('512x512-icon.ico', favicon(512));

// Header logos
save('long-logo-dark.png', longLogo(false));
save('long-logo-light.png', longLogo(true));

// Social cards
save('og-image.png', socialCard(1200, 630));
save('twitter-card.png', socialCard(1200, 600));

console.log('Done. Replace with real brand assets before production launch.');