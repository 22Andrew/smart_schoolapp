#!/usr/bin/env node
/**
 * Extract UI strings and generate per-language phrase JSON files.
 * Usage:
 *   node scripts/generate-i18n-phrases.js --extract-only
 *   node scripts/generate-i18n-phrases.js --lang=hi
 *   node scripts/generate-i18n-phrases.js --purge-failed
 *   node scripts/generate-i18n-phrases.js
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATES = path.join(ROOT, 'src', 'main', 'resources', 'templates');
const JS_DIR = path.join(ROOT, 'src', 'main', 'resources', 'static', 'js');
const OUT_DIR = path.join(ROOT, 'src', 'main', 'resources', 'i18n');
const LANGS = ['hi', 'ar', 'sw', 'fr', 'tr', 'ru', 'de', 'nl'];

const SKIP = [
  /^[\d\s.,\-+/%$#@!?:;()[\]{}|\\/<>*=&'"]+$/,
  /^https?:\/\//i,
  /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i,
  /^\d{4}-\d{2}-\d{2}/,
  /^v?\d+\.\d+/,
  /^[A-Z_]{3,}$/,
  /^#[0-9a-fA-F]{3,8}$/,
  /^\$\{/,
  /^\/\w/,
  /^th:/,
  /^(null|true|false|undefined)$/i
];

const ATTR_PATTERNS = [
  /placeholder="([^"]{2,200})"/gi,
  /placeholder='([^']{2,200})'/gi,
  /title="([^"]{2,200})"/gi,
  /title='([^']{2,200})'/gi,
  /aria-label="([^"]{2,200})"/gi,
  /aria-label='([^']{2,200})'/gi
];

const JS_PATTERNS = [
  /(?:title|text|message|placeholder|label|confirmButtonText|cancelButtonText|html|heading)\s*:\s*['"]([^'"]{2,200})['"]/g,
  /\.(?:textContent|innerText)\s*=\s*['"]([^'"]{2,200})['"]/g,
  /(?:alert|confirm)\(\s*['"]([^'"]{2,200})['"]/g
];

function normalize(text) {
  return String(text || '').replace(/\s+/g, ' ').trim();
}

function isValidPhrase(text) {
  text = normalize(text);
  if (text.length < 2 || text.length > 200) return false;
  if (!/[A-Za-z]/.test(text)) return false;
  if (text.includes('${') || text.includes('#{') || text.includes('[[${')) return false;
  if (text.includes("' +") || text.includes("+ '") || text.includes(' + ')) return false;
  if ((text.match(/ /g) || []).length > 25) return false;
  return !SKIP.some((re) => re.test(text));
}

function walk(dir, ext, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, ext, out);
    else if (entry.name.endsWith(ext)) out.push(full);
  }
  return out;
}

function extractFromHtml(content) {
  const found = new Set();
  for (const re of ATTR_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(content)) !== null) {
      const phrase = normalize(m[1]);
      if (isValidPhrase(phrase)) found.add(phrase);
    }
  }
  const textRe = />[^<>{}]{2,200}</g;
  let m;
  while ((m = textRe.exec(content)) !== null) {
    const phrase = normalize(m[0].slice(1, -1));
    if (isValidPhrase(phrase)) found.add(phrase);
  }
  return found;
}

function extractFromJs(content) {
  const found = new Set();
  for (const re of JS_PATTERNS) {
    re.lastIndex = 0;
    let m;
    while ((m = re.exec(content)) !== null) {
      const phrase = normalize(m[1]);
      if (isValidPhrase(phrase)) found.add(phrase);
    }
  }
  return found;
}

function collectPhrases() {
  const byLower = new Map();
  function addPhrase(phrase) {
    const lower = phrase.toLowerCase();
    const existing = byLower.get(lower);
    if (!existing) {
      byLower.set(lower, phrase);
      return;
    }
    const preferNew = (phrase.match(/[A-Z]/g) || []).length > (existing.match(/[A-Z]/g) || []).length
      || phrase.length > existing.length;
    if (preferNew) byLower.set(lower, phrase);
  }

  for (const file of walk(TEMPLATES, '.html')) {
    extractFromHtml(fs.readFileSync(file, 'utf8')).forEach(addPhrase);
  }
  for (const file of walk(JS_DIR, '.js')) {
    extractFromJs(fs.readFileSync(file, 'utf8')).forEach(addPhrase);
  }
  return Array.from(byLower.values()).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function httpGet(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 400) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        resolve(data);
      });
    }).on('error', reject);
  });
}

async function translateGoogleAt(text, target) {
  const q = encodeURIComponent(text);
  const url = `https://translate.googleapis.com/translate_a/single?client=at&sl=en&tl=${target}&dt=t&q=${q}`;
  const data = await httpGet(url);
  if (!data || data.trim().startsWith('<')) {
    throw new Error('Blocked response');
  }
  const parsed = JSON.parse(data);
  const translated = (parsed[0] || []).map((part) => part[0]).join('');
  if (!translated) throw new Error('Empty translation');
  return translated;
}

async function translateGoogleChrome(text, target) {
  const q = encodeURIComponent(text);
  const url = `https://clients5.google.com/translate_a/t?client=dict-chrome-ex&sl=en&tl=${target}&q=${q}`;
  const data = await httpGet(url);
  if (!data || data.trim().startsWith('<')) {
    throw new Error('Blocked response');
  }
  const parsed = JSON.parse(data);
  const translated = Array.isArray(parsed) ? parsed[0] : parsed;
  if (!translated) throw new Error('Empty translation');
  return String(translated);
}

async function translateMyMemory(text, target) {
  const q = encodeURIComponent(text.slice(0, 450));
  const url = `https://api.mymemory.translated.net/get?q=${q}&langpair=en|${target}`;
  const data = await httpGet(url);
  const parsed = JSON.parse(data);
  if (parsed.quotaFinished) {
    throw new Error('MyMemory quota finished');
  }
  const translated = parsed.responseData && parsed.responseData.translatedText;
  if (!translated || translated.toUpperCase() === text.toUpperCase()) {
    throw new Error('MyMemory returned source text');
  }
  return translated;
}

async function translateText(text, target) {
  const providers = [
    () => translateGoogleAt(text, target),
    () => translateGoogleChrome(text, target),
    () => translateMyMemory(text, target)
  ];
  let lastError;
  for (const provider of providers) {
    try {
      const translated = await provider();
      if (translated && normalize(translated) && normalize(translated) !== normalize(text)) {
        return translated;
      }
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error('All providers failed');
}

async function translateWithRetry(text, target, attempts = 5) {
  let lastError;
  for (let i = 0; i < attempts; i++) {
    try {
      return await translateText(text, target);
    } catch (error) {
      lastError = error;
      if (String(error.message).includes('quota finished')) {
        throw error;
      }
      await sleep(350 * (i + 1));
    }
  }
  throw lastError;
}

function isTranslated(english, translated) {
  return translated && normalize(translated) && normalize(translated) !== normalize(english);
}

function purgeFailedEntries(phrases) {
  for (const lang of LANGS) {
    const outPath = path.join(OUT_DIR, `messages-${lang}.json`);
    if (!fs.existsSync(outPath)) continue;
    const catalog = JSON.parse(fs.readFileSync(outPath, 'utf8'));
    let removed = 0;
    for (const key of Object.keys(catalog)) {
      if (!isTranslated(key, catalog[key])) {
        delete catalog[key];
        removed++;
      }
    }
    fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2), 'utf8');
    console.log(`Purged ${removed} failed entries from messages-${lang}.json`);
  }
}

async function translateAll(phrases, lang) {
  const outPath = path.join(OUT_DIR, `messages-${lang}.json`);
  const catalog = fs.existsSync(outPath)
    ? JSON.parse(fs.readFileSync(outPath, 'utf8'))
    : {};

  Object.keys(catalog).forEach((key) => {
    if (!isTranslated(key, catalog[key])) {
      delete catalog[key];
    }
  });

  const complete = phrases.filter((phrase) => isTranslated(phrase, catalog[phrase])).length;
  if (complete >= phrases.length * 0.98) {
    console.log(`Skip ${lang}: ${complete}/${phrases.length} translated`);
    return;
  }

  const pending = phrases.filter((phrase) => !isTranslated(phrase, catalog[phrase]));
  console.log(`${lang}: ${complete} done, ${pending.length} remaining`);

  for (let i = 0; i < pending.length; i++) {
    const phrase = pending[i];
    try {
      catalog[phrase] = await translateWithRetry(phrase, lang);
    } catch (error) {
      console.warn(`  ${lang} skip "${phrase.slice(0, 50)}": ${error.message}`);
      continue;
    }

    if ((i + 1) % 10 === 0 || i === pending.length - 1) {
      fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2), 'utf8');
      const done = phrases.filter((p) => isTranslated(p, catalog[p])).length;
      console.log(`  ${lang}: ${done}/${phrases.length}`);
    }
    await sleep(100);
  }

  fs.writeFileSync(outPath, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`Done ${lang}: ${phrases.filter((p) => isTranslated(p, catalog[p])).length}/${phrases.length}`);
}

async function main() {
  const args = process.argv.slice(2);
  const extractOnly = args.includes('--extract-only');
  const purgeFailed = args.includes('--purge-failed');
  const langArg = args.find((a) => a.startsWith('--lang='));
  const singleLang = langArg ? langArg.split('=')[1] : null;

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const phrases = collectPhrases();
  fs.writeFileSync(path.join(OUT_DIR, 'phrase-keys.json'), JSON.stringify(phrases, null, 2), 'utf8');
  console.log(`Found ${phrases.length} unique phrases`);

  if (extractOnly) return;
  if (purgeFailed) {
    purgeFailedEntries(phrases);
    if (!singleLang && args.length === 1) return;
  }

  for (const lang of (singleLang ? [singleLang] : LANGS)) {
    console.log(`Translating ${lang}...`);
    await translateAll(phrases, lang);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
