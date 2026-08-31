# i18n phrase generation

Extracts UI strings from all HTML templates and JS files, then generates per-language JSON maps under `src/main/resources/i18n/`.

## Commands

```bash
# Extract keys only
node scripts/generate-i18n-phrases.js --extract-only

# Generate all header languages (hi, ar, sw, fr, tr, ru, de, nl)
node scripts/generate-i18n-phrases.js

# Generate one language
node scripts/generate-i18n-phrases.js --lang=hi
```

Output files:

- `src/main/resources/i18n/phrase-keys.json` — all English source strings
- `src/main/resources/i18n/messages-{lang}.json` — English → translated map

Restart the Spring Boot app after generation so `PhraseCatalogLoader` reloads the catalog.
