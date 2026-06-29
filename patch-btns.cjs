const fs = require("fs");
let s = fs.readFileSync("src/components/Hero.jsx", "utf8");

const lines = s.split('\n');
let out = [];
let i = 0;

while (i < lines.length) {
  const l = lines[i];
  // Find the "View Packages" button line and inject onClick on the previous opening-tag line
  if (l.trim() === 'View Packages' && i > 0 && lines[i-1].includes('bg-[#FF6B35]')) {
    lines[i-1] = lines[i-1].replace('<button ', '<button onClick={() => navigate("/wifi-plans")} ');
  }
  // Find "Check Coverage"
  if (l.trim() === 'Check Coverage' && i > 0 && lines[i-1].includes('bg-white')) {
    lines[i-1] = lines[i-1].replace('<button ', '<button onClick={() => navigate("/coverage")} ');
  }
  i++;
}

fs.writeFileSync("src/components/Hero.jsx", lines.join('\n'));
console.log('done', s.includes('navigate("/wifi-plans")') ? 'packages wired' : 'packages MISSING');
