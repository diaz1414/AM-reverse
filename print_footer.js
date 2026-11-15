const fs = require('fs');
const html = fs.readFileSync('nopixel_dump.html', 'utf8');

const footer = html.match(/<footer[\s\S]*?<\/footer>/)[0];
console.log('=== FULL FOOTER ===');
console.log(footer.slice(0, 4000));
