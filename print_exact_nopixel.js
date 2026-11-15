const fs = require('fs');
const html = fs.readFileSync('nopixel_dump.html', 'utf8');

// Header
const header = html.match(/<header[\s\S]*?<\/header>/)[0];
console.log('=== FULL HEADER ===');
console.log(header);

// Section 0 (Hero)
const sec0 = html.match(/<section data-site-section="true" data-site-nav="home"[\s\S]*?<\/section>/)[0];
console.log('\n=== HERO SECTION ===');
console.log(sec0);

// Section 1 (News / Cards)
const sec1 = html.match(/<section data-site-section="true" data-site-nav="news"[\s\S]*?<\/section>/)[0];
console.log('\n=== SECTION 1 (Snippet 3000) ===');
console.log(sec1.slice(0, 3000));
