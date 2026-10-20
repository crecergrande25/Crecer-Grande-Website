#!/usr/bin/env python3
"""CI asset integrity check: all committed raster images decode, all static links exist."""
from pathlib import Path
from PIL import Image
import re,sys
import xml.etree.ElementTree as ET

root=Path(__file__).resolve().parents[1]
images=root/"assets/images"
bad=[]
count=0
for p in images.rglob("*"):
    if p.suffix.lower() not in {".webp",".png",".jpg",".jpeg"}:continue
    count+=1
    try:
        with Image.open(p) as im:
            im.load()
            if im.width < 90 or im.height < 90:
                print(f"NOTICE unusually small image: {p.relative_to(root)} ({im.width}x{im.height})")
    except Exception as exc:bad.append(f"Unreadable: {p.relative_to(root)} — {exc}")

# Verify all content illustrations are parseable SVGs rather than broken HTML responses.
svg_count=0
for svg in images.rglob('*.svg'):
    svg_count+=1
    try:
        el=ET.parse(svg).getroot()
        if not el.tag.endswith('svg'):
            bad.append(f'Invalid SVG root: {svg.relative_to(root)}')
    except Exception as exc:
        bad.append(f'Invalid SVG XML: {svg.relative_to(root)} — {exc}')

# Repeated content must be illustrated rather than replaced by plain-text cards.
leftovers=[]
for page in root.rglob('*.html'):
    if 'cg-art-placeholder' in page.read_text(encoding='utf8',errors='replace'):
        leftovers.append(str(page.relative_to(root)))
if leftovers:
    bad.append('Text-only content artwork placeholders remain: '+', '.join(leftovers))

pat=re.compile(r'(?<![\w/-])/?assets/images/[\w./-]+\.(?:webp|png|jpg|jpeg|svg)\b',re.I)
checked=0
for p in root.rglob("*"):
    if p.suffix.lower() not in {".html",".css",".js",".json",".xml",".svg",".webmanifest"}:continue
    if ".git" in p.parts or ".github" in p.parts or "scripts" in p.parts:continue
    s=p.read_text(encoding="utf8",errors="replace")
    for m in pat.finditer(s):
        name=m.group(0).lstrip("/")
        checked+=1
        if not (root/name).exists():
            bad.append(f"Missing: {name} — referenced in {p.relative_to(root)}")
if bad:
    for msg in bad:print("ERROR",msg)
    sys.exit(1)
print(f"PASS {count} raster assets decoded, {svg_count} SVGs valid, {checked} image paths resolved; zero content placeholders")
