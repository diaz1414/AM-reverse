const fs = require('fs');
const css = fs.readFileSync('nopixel_f0394be7a8cc1c70.css', 'utf8');

const regexes = [
  /--color-ink:[^;]+/g,
  /--color-paper:[^;]+/g,
  /--color-brand-2:[^;]+/g,
  /--color-brand:[^;]+/g,
  /\.bg-ink\{[^}]+\}/g,
  /\.bg-paper\{[^}]+\}/g,
  /\.bg-brand-2\{[^}]+\}/g,
  /\.text-brand-2\{[^}]+\}/g,
  /\.text-paper\{[^}]+\}/g,
  /\.text-ink\{[^}]+\}/g
];

for (const r of regexes) {
  const matches = [...css.matchAll(r)].map(m => m[0]);
  console.log(matches.slice(0, 5));
}
