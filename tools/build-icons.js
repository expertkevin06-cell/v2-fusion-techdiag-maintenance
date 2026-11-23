#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════════════════════
   BUILD-ICONS — MECADATA // ÉCLAIR JAUNE
   Usage :  node tools/build-icons.js
   Produit : icons/icon-192.png, icon-512.png, icon-maskable-512.png,
             apple-touch-icon.png (180), favicon-32.png, favicon-16.png,
             icon.svg, icons/preview.html
   Aucune dépendance externe : zlib + encodeur PNG + rasteriseur intégrés.
   ══════════════════════════════════════════════════════════════════════════ */
"use strict";

const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const OUT = path.join(__dirname, "..", "icons");

/* ── Palette MECADATA ── */
const C = {
  bg0: [4, 7, 13],
  bg1: [12, 20, 36],
  bg2: [17, 28, 49],
  bolt: [255, 214, 10],
  boltHi: [255, 245, 170],
  boltLo: [255, 168, 0],
  cyan: [37, 212, 238],
  ring: [37, 212, 238]
};

/* ── Polygone éclair (coordonnées normalisées 0..1) ── */
const BOLT = [
  [0.615, 0.055],
  [0.270, 0.545],
  [0.470, 0.545],
  [0.385, 0.945],
  [0.745, 0.415],
  [0.535, 0.415],
  [0.690, 0.055]
];

/* ── CRC32 PNG ── */
const CRC_TABLE = (function () {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c >>> 0;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function encodePNG(w, h, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0; // filtre None
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]);
}

/* ── Helpers raster ── */
function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t)
  ];
}
function pointInPoly(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1];
    const xj = poly[j][0], yj = poly[j][1];
    const hit = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (hit) inside = !inside;
  }
  return inside;
}
function scalePoly(poly, s, cx, cy) {
  return poly.map(function (p) {
    return [cx + (p[0] - cx) * s, cy + (p[1] - cy) * s];
  });
}
function distToPolyEdge(x, y, poly) {
  let best = 1e9;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const ax = poly[j][0], ay = poly[j][1];
    const bx = poly[i][0], by = poly[i][1];
    const dx = bx - ax, dy = by - ay;
    const L2 = dx * dx + dy * dy;
    let t = L2 ? ((x - ax) * dx + (y - ay) * dy) / L2 : 0;
    t = Math.max(0, Math.min(1, t));
    const px = ax + t * dx, py = ay + t * dy;
    const d = Math.hypot(x - px, y - py);
    if (d < best) best = d;
  }
  return best;
}

/* ── Rendu d'une icône ── */
function renderIcon(size, opts) {
  opts = opts || {};
  const maskable = !!opts.maskable;
  const radius = opts.radius === undefined ? 0.22 : opts.radius;
  const SS = size <= 64 ? 4 : 3;               // supersampling
  const buf = Buffer.alloc(size * size * 4);

  // Zone sûre maskable : l'éclair tient dans 72 % central
  const boltScale = maskable ? 0.68 : 0.86;
  const poly = scalePoly(BOLT, boltScale, 0.5, 0.5);
  const glowR = maskable ? 0.30 : 0.36;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0;

      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = (x + (sx + 0.5) / SS) / size;
          const py = (y + (sy + 0.5) / SS) / size;

          // Fond : dégradé radial sombre
          const d = Math.hypot(px - 0.42, py - 0.34) / 1.05;
          let col = mix(C.bg1, C.bg0, Math.min(1, d * 1.25));

          // Anneau technique discret
          const ringD = Math.abs(Math.hypot(px - 0.5, py - 0.5) - 0.44);
          if (ringD < 0.006) col = mix(col, C.ring, 0.20);

          // Halo jaune autour de l'éclair
          const edge = distToPolyEdge(px, py, poly);
          const inBolt = pointInPoly(px, py, poly);
          if (!inBolt && edge < glowR) {
            const t = Math.pow(1 - edge / glowR, 2.4) * 0.55;
            col = mix(col, C.boltLo, t);
          }

          // Éclair : dégradé vertical jaune vif -> ambre
          if (inBolt) {
            const t = Math.max(0, Math.min(1, (py - 0.06) / 0.88));
            let bc = mix(C.boltHi, C.bolt, Math.min(1, t * 1.6));
            bc = mix(bc, C.boltLo, Math.max(0, t - 0.55) / 0.45);
            // liseré interne clair sur le bord haut-gauche
            if (edge < 0.018) bc = mix(bc, C.boltHi, 0.45 * (1 - edge / 0.018));
            col = bc;
          }

          // Coins arrondis (icône standard uniquement)
          let alpha = 255;
          if (!maskable && radius > 0) {
            const rr = radius;
            const cx = Math.max(rr, Math.min(1 - rr, px));
            const cy = Math.max(rr, Math.min(1 - rr, py));
            const dd = Math.hypot(px - cx, py - cy);
            if (dd > rr) alpha = 0;
            else if (dd > rr - 1.5 / size) alpha = Math.round(255 * (rr - dd) / (1.5 / size));
          }

          r += col[0]; g += col[1]; b += col[2]; a += alpha;
        }
      }

      const n = SS * SS;
      const o = (y * size + x) * 4;
      buf[o] = Math.round(r / n);
      buf[o + 1] = Math.round(g / n);
      buf[o + 2] = Math.round(b / n);
      buf[o + 3] = Math.round(a / n);
    }
  }
  return buf;
}

/* ── SVG vectoriel (source de vérité) ── */
function svgSource() {
  const pts = BOLT.map(function (p) { return (p[0] * 512).toFixed(1) + "," + (p[1] * 512).toFixed(1); }).join(" ");
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">',
    '  <defs>',
    '    <radialGradient id="bg" cx="42%" cy="34%" r="78%">',
    '      <stop offset="0" stop-color="#111C31"/>',
    '      <stop offset="1" stop-color="#04070D"/>',
    '    </radialGradient>',
    '    <linearGradient id="bolt" x1="0" y1="0" x2="0" y2="1">',
    '      <stop offset="0" stop-color="#FFF5AA"/>',
    '      <stop offset=".45" stop-color="#FFD60A"/>',
    '      <stop offset="1" stop-color="#FFA800"/>',
    '    </linearGradient>',
    '    <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">',
    '      <feGaussianBlur stdDeviation="18" result="b"/>',
    '      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>',
    '    </filter>',
    '    <clipPath id="round"><rect width="512" height="512" rx="112"/></clipPath>',
    '  </defs>',
    '  <g clip-path="url(#round)">',
    '    <rect width="512" height="512" fill="url(#bg)"/>',
    '    <circle cx="256" cy="256" r="225" fill="none" stroke="#25D4EE" stroke-opacity=".20" stroke-width="3"/>',
    '    <g filter="url(#glow)">',
    '      <polygon points="' + pts + '" fill="url(#bolt)"/>',
    '    </g>',
    '    <polygon points="' + pts + '" fill="none" stroke="#FFF5AA" stroke-opacity=".55" stroke-width="4"/>',
    '  </g>',
    '</svg>'
  ].join("\n");
}

/* ── Écriture ── */
function write(name, data) {
  const p = path.join(OUT, name);
  fs.writeFileSync(p, data);
  const kb = (data.length / 1024).toFixed(1);
  console.log("  OK  icons/" + name + "  (" + kb + " Ko)");
}

function main() {
  console.log("\nMECADATA // génération des icônes PWA — éclair jaune\n");
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  const targets = [
    { name: "icon-192.png", size: 192, maskable: false },
    { name: "icon-512.png", size: 512, maskable: false },
    { name: "icon-maskable-512.png", size: 512, maskable: true },
    { name: "icon-maskable-192.png", size: 192, maskable: true },
    { name: "apple-touch-icon.png", size: 180, maskable: true, radius: 0 },
    { name: "favicon-32.png", size: 32, maskable: false },
    { name: "favicon-16.png", size: 16, maskable: false }
  ];

  targets.forEach(function (t) {
    const rgba = renderIcon(t.size, { maskable: t.maskable, radius: t.radius });
    write(t.name, encodePNG(t.size, t.size, rgba));
  });

  write("icon.svg", Buffer.from(svgSource(), "utf8"));

  const preview = [
    '<!doctype html><meta charset="utf-8"><title>Icônes MECADATA</title>',
    '<style>body{background:#04070D;color:#E6EEF9;font:14px system-ui;padding:28px}',
    '.r{display:flex;gap:22px;flex-wrap:wrap;align-items:flex-end;margin-top:18px}',
    'figure{margin:0;text-align:center}figcaption{color:#61748C;font-size:11px;margin-top:8px}',
    'img{background:#0C1424;border-radius:14px;border:1px solid rgba(96,160,255,.2)}</style>',
    '<h1>MECADATA — icônes PWA</h1><p>Éclair jaune · prêtes pour PWABuilder.</p><div class="r">',
    targets.map(function (t) {
      const w = Math.min(t.size, 160);
      return '<figure><img src="' + t.name + '" width="' + w + '" height="' + w + '"><figcaption>' + t.name + '<br>' + t.size + '×' + t.size + '</figcaption></figure>';
    }).join(""),
    '</div>'
  ].join("");
  write("preview.html", Buffer.from(preview, "utf8"));

  console.log("\nTerminé. Déployez le dossier icons/ à la racine du site.");
  console.log("PWABuilder : https://www.pwabuilder.com/  →  collez l'URL du site.\n");
}

main();
