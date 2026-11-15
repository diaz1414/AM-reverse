const fs = require('fs');

const css1 = fs.readFileSync('nopixel_f0394be7a8cc1c70.css', 'utf8');
const css2 = fs.readFileSync('nopixel_4252802624b7da93.css', 'utf8');

// Find :root variables
console.log('--- ROOT VARS IN CSS ---');
const rootMatch = (css1 + css2).match(/:root\s*\{([^}]+)\}/);
if (rootMatch) {
  console.log(rootMatch[1].split(';').map(s => s.trim()).filter(Boolean).join('\n'));
}

// Find font-family definitions
console.log('--- FONT FAMILIES ---');
const fonts = [...(css1 + css2).matchAll(/font-family:[^;]+/g)].map(m => m[0]);
console.log([...new Set(fonts)].slice(0, 15));

// Find color palette keywords: bg-ink, text-paper, brand, etc.
console.log('--- PALETTE & THEME CLASSES ---');
const colors = [...(css1 + css2).matchAll(/\.(bg|text|border)-([a-zA-Z0-9_-]+)/g)].map(m => m[0]);
console.log([...new Set(colors)].filter(c => c.includes('ink') || c.includes('paper') || c.includes('brand') || c.includes('accent') || c.includes('emerald') || c.includes('green') || c.includes('zinc') || c.includes('neutral') || c.includes('dark')));
