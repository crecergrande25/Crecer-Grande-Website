#!/usr/bin/env python3
"""CI asset integrity check: all committed raster images decode, all static links exist."""
from pathlib import Path
from PIL import Image
import re,sys

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
print(f"PASS {count} raster assets decoded, {checked} referenced image paths resolved")
