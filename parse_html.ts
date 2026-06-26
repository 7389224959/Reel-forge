import fs from 'fs';

const html = fs.readFileSync('test_page.html', 'utf-8');
const regex = /<img[^>]+src="([^"]+)"/g;
const matches = [...html.matchAll(regex)];

console.log("Found:", matches.length);
if (matches.length > 0) {
  matches.slice(0, 10).forEach(m => console.log(m[1]));
}
