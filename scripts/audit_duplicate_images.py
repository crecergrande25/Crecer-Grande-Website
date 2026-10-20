#!/usr/bin/env python3
"""Audit sitewide repeated rendered images by path and similar pixels (read-only)."""
from pathlib import Path
from collections import defaultdict
from PIL import Image,ImageOps
import re, hashlib
root=Path(__file__).resolve().parents[1]
pages=sorted(root.rglob("*.html"),key=lambda p:(0 if p.name=="index.html" and p.parent==root else 1,str(p)))
groups=defaultdict(list)
for p in pages:
    text=p.read_text(encoding="utf-8")
    for m in re.finditer(r"<img\b[^>]*>",text,flags=re.I):
        tag=m.group(0)
        src=re.search(r'\bsrc\s*=\s*["\x27]([^"\x27]+)',tag,re.I)
        if not src:continue
        url=src.group(1).split("?")[0]
        if not url.startswith("/assets/images/"):continue
        groups[url].append(str(p.relative_to(root)))
unique=len(groups)
dupes={k:v for k,v in groups.items() if len(v)>1}
print("HTML_IMAGES|"+str(sum(map(len,groups.values())))+"|unique_urls="+str(unique)+"|duplicate_urls="+str(len(dupes))+"|redundant_uses="+str(sum(len(v)-1 for v in dupes.values())))
for k,v in sorted(dupes.items(),key=lambda t:-len(t[1])):
    print("REUSED|"+k+"|count="+str(len(v))+"|pages="+",".join(v[:8]))
# check visual duplicate assets via perceptual dhash
def dhash(img):
    g=ImageOps.grayscale(img).resize((9,8))
    a=list(g.getdata())
    bits=0
    for y in range(8):
        for x in range(8):
            bits=(bits<<1)|int(a[y*9+x]>a[y*9+x+1])
    return bits
imglist=[]
for p in sorted((root/"assets/images").rglob("*")):
    if p.suffix.lower() not in (".png",".jpg",".jpeg",".webp"):continue
    with Image.open(p) as im:
        im.load()
        imglist.append((str(p.relative_to(root)),im.size,dhash(im)))
visual=[]
for i,(pa,(wa,ha),ha_) in enumerate(imglist):
    if min(wa,ha)<200:continue
    for pb,(wb,hb),hb_ in imglist[i+1:]:
        if min(wb,hb)<200:continue
        dist=(ha_^hb_).bit_count()
        if dist<=3:visual.append((pa,pb,dist))
for a,b,d in visual[:160]:
    print("NEAR_DUPLICATE|"+a+"|"+b+"|distance="+str(d))
print("NEAR_DUPLICATE_TOTAL|"+str(len(visual)))
