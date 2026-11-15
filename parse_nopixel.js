const fs = require('fs');
const html = fs.readFileSync('nopixel_dump.html', 'utf8');

console.log('--- TITLE ---');
const tm = html.match(/<title>(.*?)<\/title>/);
console.log(tm ? tm[1] : 'none');

console.log('--- CSS ---');
const cssRegex = /href="([^"]+\.css[^"]*)"/g;
let m;
while ((m = cssRegex.exec(html)) !== null) {
  console.log(m[1]);
}

console.log('--- HEADER & NAV ---');
const headerMatch = html.match(/<header[\s\S]*?<\/header>/);
if (headerMatch) {
  console.log('Header snippet:', headerMatch[0].slice(0, 1500));
}

console.log('--- MAIN STRUCTURE ---');
const mainMatch = html.match(/<main[\s\S]*?<\/main>/);
if (mainMatch) {
  console.log('Main snippet:', mainMatch[0].slice(0, 2000));
}

console.log('--- FOOTER STRUCTURE ---');
const footerMatch = html.match(/<footer[\s\S]*?<\/footer>/);
if (footerMatch) {
  console.log('Footer snippet:', footerMatch[0].slice(0, 1500));
}
