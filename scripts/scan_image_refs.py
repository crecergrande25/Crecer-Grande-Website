#!/usr/bin/env python3
from pathlib import Path
from PIL import Image
import re
root=Path(__file__).resolve().parents[1]
imgs=sorted([p for p in (root/"assets/images").rglob("*") if p.suffix.lower() in (".png",".jpg",".jpeg",".webp")])
sources={}
for p in root.rglob("*"):
    if p.suffix.lower() not in (".html",".css",".js",".json",".md",".xml"): continue
    if ".git" in p.parts: continue
    try: sources[str(p.relative_to(root))]=p.read_text(encoding="utf8",errors="replace")
    except:pass
for image in imgs:
    rel=image.relative_to(root).as_posix()
    invalid=False
    try:
        with Image.open(image) as im:
            im.load()
            w,h=im.size
    except Exception:
        invalid=True
        w=h=0
    matches=[x for x,t in sources.items() if rel in t or rel[len("assets/images/"):] in t]
    if invalid or min(w,h)<350 or not matches:
        print("REF|"+rel+"|"+str(w)+"x"+str(h)+"|"+("INVALID" if invalid else "VALID")+"|"+",".join(matches[:12])+"|"+str(len(matches)),flush=True)
