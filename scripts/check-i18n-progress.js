#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'src', 'main', 'resources', 'i18n');
const keysFile = path.join(dir, 'phrase-keys.json');
if (!fs.existsSync(keysFile)) {
  console.log('No phrase-keys.json found. Run: node scripts/generate-i18n-phrases.js --extract-only');
  process.exit(1);
}

const total = JSON.parse(fs.readFileSync(keysFile, 'utf8')).length;
console.log('Total UI phrases:', total);
console.log('');

fs.readdirSync(dir)
  .filter((f) => f.startsWith('messages-') && f.endsWith('.json'))
  .sort()
  .forEach((file) => {
    const catalog = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    const translated = Object.entries(catalog).filter(
      ([key, value]) => value && value.trim() && value.trim().toLowerCase() !== key.trim().toLowerCase()
    ).length;
    const lang = file.replace('messages-', '').replace('.json', '');
    const pct = ((translated / total) * 100).toFixed(1);
    console.log(`${lang.padEnd(3)} ${String(translated).padStart(5)}/${total}  (${pct}%)`);
  });
