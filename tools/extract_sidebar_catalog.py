import re
import json
from pathlib import Path

html = Path(__file__).resolve().parents[1] / "src/main/resources/templates/fragments/sidebar.html"
text = html.read_text(encoding="utf-8")
menus = {}
current = None
for line in text.splitlines():
    m = re.search(r'data-submenu="([^"]+)"', line)
    if m:
        current = m.group(1)
        menus.setdefault(current, [])
        continue
    m = re.search(r'href="([^"]*)"[^>]*class="submenu-item[^"]*"[^>]*>([^<]+)</a>', line)
    if not m:
        m = re.search(r'class="submenu-item[^"]*"[^>]*href="([^"]*)"[^>]*>([^<]+)</a>', line)
    if m and current:
        href = m.group(1).strip()
        name = m.group(2).strip()
        slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-") or "item"
        menus[current].append({"slug": slug, "name": name, "href": href})

out = Path(__file__).resolve().parents[1] / "src/main/resources/sidebar-menu-catalog.json"
out.write_text(json.dumps(menus, indent=2), encoding="utf-8")
print(f"Wrote {out}")
print(f"{len(menus)} menus, {sum(len(v) for v in menus.values())} submenus")
