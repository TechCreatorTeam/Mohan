// scripts/updateGlobalPalette.js
const fs = require('fs');
const path = require('path');

// Example palette. Replace with dynamic values as needed.
const palette = {
  '--bg-primary': '#ffffff',
  '--bg-secondary': '#f5f5f5',
  '--text-primary': '#222222',
  '--text-secondary': '#666666',
  // Add more variables as needed
};

const cssLines = [':root {'];
for (const [key, value] of Object.entries(palette)) {
  cssLines.push(`  ${key}: ${value};`);
}
cssLines.push('}');

const cssContent = cssLines.join('\n') + '\n';

const outputPath = path.join(__dirname, '../public/global-palette.css');
fs.writeFileSync(outputPath, cssContent);

console.log('✅ global-palette.css updated!');
