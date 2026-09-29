#!/usr/bin/env python3
"""
Crecer Grande public-site image uniqueness audit.

Checks:
1. The same content-image path referenced by more than one public HTML page.
2. Different image files with identical binary content (SHA-256) that are referenced.
3. Near-identical referenced raster images using perceptual hashes when Pillow is installed.

Intentional brand assets (logo/favicon/social preview/QR) are excluded.
Run from repository root:
    python scripts/audit_image_uniqueness.py
"""

from __future__ import annotations
import hashlib
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
IMAGE_ROOT = ROOT / "assets" / "images"
IMG_RE = re.compile(r"""(?:src|href|url\()\s*[='"(]*\s*['"]?(/assets/images/[^'"\)\s?#]+)""", re.I)
EXTS = {".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"}
IGNORE_NAMES = {
    "logo.png", "logo-r01.png", "logo-icon.png", "favicon.png",
    "apple-touch-icon.png", "social-preview.png", "whatsapp-qr.png"
}

def public_html_files():
    for path in ROOT.rglob("*.html"):
        rel = path.relative_to(ROOT)
        if rel.parts and rel.parts[0] == "admin":
            continue
        yield path

def is_ignored(rel: str) -> bool:
    name = Path(rel).name.lower()
    return name in IGNORE_NAMES or "logo" in name or "favicon" in name

def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()

refs = defaultdict(set)
for html in public_html_files():
    text = html.read_text(encoding="utf-8", errors="ignore")
    page = str(html.relative_to(ROOT)).replace("\\", "/")
    for src in IMG_RE.findall(text):
        rel = src.lstrip("/")
        if is_ignored(rel):
            continue
        refs[rel].add(page)

problems = []

for rel, pages in sorted(refs.items()):
    if len(pages) > 1:
        problems.append(("REUSED_PATH", rel, sorted(pages)))

digest_groups = defaultdict(list)
for rel in refs:
    path = ROOT / rel
    if path.exists() and path.suffix.lower() in EXTS:
        digest_groups[sha256(path)].append(rel)

for digest, files in digest_groups.items():
    if len(files) > 1:
        pages = sorted({p for f in files for p in refs[f]})
        problems.append(("IDENTICAL_CONTENT", " | ".join(sorted(files)), pages))

# Optional perceptual check.
try:
    from PIL import Image
    import imagehash

    phashes = {}
    for rel in refs:
        path = ROOT / rel
        if path.exists() and path.suffix.lower() in EXTS:
            try:
                with Image.open(path) as im:
                    phashes[rel] = imagehash.phash(im.convert("RGB"))
            except Exception:
                pass

    names = sorted(phashes)
    for i, a in enumerate(names):
        for b in names[i + 1:]:
            if sha256(ROOT / a) == sha256(ROOT / b):
                continue
            distance = phashes[a] - phashes[b]
            if distance <= 5:
                pages = sorted(refs[a] | refs[b])
                problems.append(("NEAR_DUPLICATE", f"{a} ~ {b} (pHash distance {distance})", pages))
except ImportError:
    pass

if problems:
    print("IMAGE UNIQUENESS AUDIT FAILED\n")
    for kind, item, pages in problems:
        print(f"[{kind}] {item}")
        for page in pages:
            print(f"  - {page}")
        print()
    print(f"{len(problems)} duplicate/reuse issue(s) found.")
    sys.exit(1)

print(f"Image uniqueness audit passed: {len(refs)} referenced content images checked.")
