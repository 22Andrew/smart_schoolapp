#!/usr/bin/env python3
"""Extract UI strings from templates/JS and generate per-language phrase JSON files."""

from __future__ import annotations

import json
import re
import sys
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATES = ROOT / "src" / "main" / "resources" / "templates"
JS_DIR = ROOT / "src" / "main" / "resources" / "static" / "js"
OUT_DIR = ROOT / "src" / "main" / "resources" / "i18n"

LANGS = ["hi", "ar", "sw", "fr", "tr", "ru", "de", "nl"]

SKIP_PATTERNS = [
    re.compile(r"^[\d\s.,\-+/%$#@!?:;()\[\]{}|\\/<>*=&'\"]+$"),
    re.compile(r"^https?://", re.I),
    re.compile(r"^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$", re.I),
    re.compile(r"^\d{4}-\d{2}-\d{2}"),
    re.compile(r"^v?\d+\.\d+"),
    re.compile(r"^[A-Z_]{3,}$"),
    re.compile(r"^#[0-9a-fA-F]{3,8}$"),
    re.compile(r"^\$\{"),
    re.compile(r"^/\w"),
    re.compile(r"^data-"),
    re.compile(r"^th:"),
    re.compile(r"^\$\("),
    re.compile(r"^function\s"),
    re.compile(r"^var\s"),
    re.compile(r"^const\s"),
    re.compile(r"^let\s"),
    re.compile(r"^return\s"),
    re.compile(r"^null$", re.I),
    re.compile(r"^true$", re.I),
    re.compile(r"^false$", re.I),
    re.compile(r"^undefined$", re.I),
]

ATTR_PATTERNS = [
    re.compile(r'placeholder="([^"]{2,200})"', re.I),
    re.compile(r"placeholder='([^']{2,200})'", re.I),
    re.compile(r'title="([^"]{2,200})"', re.I),
    re.compile(r"title='([^']{2,200})'", re.I),
    re.compile(r'aria-label="([^"]{2,200})"', re.I),
    re.compile(r"aria-label='([^']{2,200})'", re.I),
    re.compile(r'alt="([^"]{2,200})"', re.I),
]

HTML_TEXT_PATTERN = re.compile(r">([^<>{}]{2,200})<")
JS_STRING_PATTERNS = [
    re.compile(r"(?:title|text|message|placeholder|label|confirmButtonText|cancelButtonText|html|heading)\s*:\s*['\"]([^'\"]{2,200})['\"]"),
    re.compile(r"\.(?:textContent|innerText|innerHTML)\s*=\s*['\"]([^'\"]{2,200})['\"]"),
    re.compile(r"(?:alert|confirm)\(\s*['\"]([^'\"]{2,200})['\"]"),
    re.compile(r"Swal\.fire\(\s*['\"]([^'\"]{2,200})['\"]"),
]


def normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text or "").strip()


def is_valid_phrase(text: str) -> bool:
    text = normalize(text)
    if len(text) < 2 or len(text) > 200:
        return False
    if not re.search(r"[A-Za-z]", text):
        return False
    for pattern in SKIP_PATTERNS:
        if pattern.search(text):
            return False
    if text.startswith("/*") or text.startswith("//"):
        return False
    if "${" in text or "#{" in text or "[[${" in text:
        return False
    if text.count(" ") > 25:
        return False
    return True


def extract_from_html(content: str) -> set[str]:
    found: set[str] = set()
    for pattern in ATTR_PATTERNS:
        for match in pattern.findall(content):
            phrase = normalize(match)
            if is_valid_phrase(phrase):
                found.add(phrase)
    for match in HTML_TEXT_PATTERN.findall(content):
        phrase = normalize(match)
        if is_valid_phrase(phrase):
            found.add(phrase)
    return found


def extract_from_js(content: str) -> set[str]:
    found: set[str] = set()
    for pattern in JS_STRING_PATTERNS:
        for match in pattern.findall(content):
            phrase = normalize(match)
            if is_valid_phrase(phrase):
                found.add(phrase)
    return found


def collect_phrases() -> list[str]:
    phrases: set[str] = set()
    if TEMPLATES.exists():
        for path in TEMPLATES.rglob("*.html"):
            try:
                content = path.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            phrases.update(extract_from_html(content))
    if JS_DIR.exists():
        for path in JS_DIR.rglob("*.js"):
            try:
                content = path.read_text(encoding="utf-8", errors="ignore")
            except OSError:
                continue
            phrases.update(extract_from_js(content))
    return sorted(phrases, key=str.lower)


def translate_batch(texts: list[str], target: str, translator) -> dict[str, str]:
    result: dict[str, str] = {}
    for text in texts:
        try:
            translated = translator.translate(text)
            result[text] = translated if translated else text
        except Exception as exc:
            print(f"  warn: failed '{text[:40]}...' -> {target}: {exc}", file=sys.stderr)
            result[text] = text
        time.sleep(0.05)
    return result


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    keys_path = OUT_DIR / "phrase-keys.json"

    print("Collecting phrases...")
    phrases = collect_phrases()
    keys_path.write_text(json.dumps(phrases, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Found {len(phrases)} unique phrases -> {keys_path}")

    try:
        from deep_translator import GoogleTranslator
    except ImportError:
        print("deep-translator not installed. Run: pip install deep-translator")
        print("Generating empty language stubs only.")
        for lang in LANGS:
            out = OUT_DIR / f"messages-{lang}.json"
            out.write_text("{}", encoding="utf-8")
        return

    batch_size = 50
    for lang in LANGS:
        out_path = OUT_DIR / f"messages-{lang}.json"
        if out_path.exists() and out_path.stat().st_size > 1000:
            existing = json.loads(out_path.read_text(encoding="utf-8"))
            if len(existing) >= len(phrases) * 0.9:
                print(f"Skipping {lang}: already has {len(existing)} entries")
                continue

        print(f"Translating to {lang}...")
        translator = GoogleTranslator(source="en", target=lang)
        catalog: dict[str, str] = {}
        for i in range(0, len(phrases), batch_size):
            batch = phrases[i : i + batch_size]
            print(f"  batch {i // batch_size + 1}/{(len(phrases) + batch_size - 1) // batch_size}")
            catalog.update(translate_batch(batch, lang, translator))
            out_path.write_text(json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"Wrote {len(catalog)} entries -> {out_path}")


if __name__ == "__main__":
    main()
