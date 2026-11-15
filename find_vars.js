const fs = require('fs');
const css1 = fs.readFileSync('nopixel_f0394be7a8cc1c70.css', 'utf8');
const css2 = fs.readFileSync('nopixel_4252802624b7da93.css', 'utf8');
const html = fs.readFileSync('nopixel_dump.html', 'utf8');

const all = css1 + css2 + html;

const matches = [...all.matchAll(/--(ink|paper|brand-2|brand):\s*[^;]+/g)].map(m => m[0]);
console.log('Var matches:', matches);

const styleTags = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m => m[1]);
console.log('Style tags count:', styleTags.length);
styleTags.forEach((st, i) => console.log(`style[${i}]:`, st.slice(0, 300)));
