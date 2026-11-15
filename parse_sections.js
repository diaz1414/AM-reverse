const fs = require('fs');
const html = fs.readFileSync('nopixel_dump.html', 'utf8');

// Let's inspect the first 10000 chars of body
const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/);
if (bodyMatch) {
  const body = bodyMatch[1];
  console.log('Body length:', body.length);
  
  // Find all sections
  const sections = [...body.matchAll(/<section[\s\S]*?<\/section>/g)].map(s => s[0]);
  console.log('Found sections:', sections.length);
  sections.forEach((sec, idx) => {
    console.log(`\n=== SECTION ${idx} (len: ${sec.length}) ===`);
    console.log(sec.slice(0, 1000));
  });
}
