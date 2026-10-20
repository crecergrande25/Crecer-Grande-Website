#!/usr/bin/env python3
"""Generate distinct per-product text-first engineering art, not product photos."""
from pathlib import Path
from html import escape
import hashlib,json,re,textwrap,xml.etree.ElementTree as ET

ROOT=Path(__file__).resolve().parents[1]
items=json.loads((ROOT/"scripts/product_unique_art_assignments.json").read_text(encoding="utf8"))["assigned"]
DIR=ROOT/"assets/images/product-unique"
DIR.mkdir(parents=True,exist_ok=True)
def wrap_words(s,max_chars=30):
    words=re.sub(r"\s+"," ",str(s)).strip().split(" ")
    lines=[]
    line=""
    for word in words:
        if len(line+" "+word)>max_chars and line:
            lines.append(line)
            line=word
        else:
            line=(line+" "+word).strip()
    if line:lines.append(line)
    return lines[:3]
for item in items:
    slug=item["slug"]
    if not re.fullmatch(r"[a-z0-9-]+",slug):raise RuntimeError("Unsafe product slug")
    title=str(item["title"] or slug).strip()
    category=str(item["category"] or "Industrial Components").strip()
    h=hashlib.sha256(slug.encode("utf8")).hexdigest()
    # Change color, accent-line position, and schematic overlay by product slug.
    hue=[178,190,200,211,221,229,240][int(h[0],16)%7]
    secondary=[210,221,231,241,247][int(h[1],16)%5]
    ax=280+int(h[2:4],16)*2
    ay=76+int(h[4:6],16)//2
    n=3+int(h[6],16)%5
    tag=escape(category.upper()[:48])
    lines=wrap_words(title,35)
    font=43 if max(map(len,lines))<27 else 36
    base=306 if len(lines)==1 else 280 if len(lines)==2 else 264
    title_rows="\n".join('<text x="64" y="'+str(base+i*52)+'" fill="#fff" font-family="Arial,Helvetica,sans-serif" font-size="'+str(font)+'" font-weight="700">'+escape(row)+'</text>' for i,row in enumerate(lines))
    pattern="\n".join(f'<path d="M {100+i*68} 120 v {-20-(i%3)*14}" stroke="#e3a638" stroke-width="3" opacity=".52"/>' for i in range(n))
    serial=escape("CG-"+h[:8].upper())
    svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="800" height="520" viewBox="0 0 800 520" role="img" aria-labelledby="title desc">
<title id="title">{escape(title)}</title>
<desc id="desc">Unique illustrated identification panel for {escape(title)}. Not an actual product photograph.</desc>
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="hsl({hue},48%,21%)"/><stop offset=".62" stop-color="#102c49"/><stop offset="1" stop-color="hsl({secondary},51%,13%)"/></linearGradient>
  <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse"><path d="M 34 0 H 0 V 34" fill="none" stroke="#fff" opacity=".08" stroke-width=".8"/></pattern>
</defs>
<rect width="800" height="520" fill="url(#bg)"/>
<rect width="800" height="520" fill="url(#grid)"/>
<circle cx="{ax+230}" cy="{ay+10}" r="{155+int(h[7],16)*3}" fill="none" stroke="#f1b54e" stroke-opacity=".22" stroke-width="24"/>
<circle cx="{ax+200}" cy="{ay+50}" r="115" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width="3"/>
<path d="M {ax-80} {ay+60} l 145 -35 l 75 75 l -145 35 z" fill="none" stroke="#fff" opacity=".14" stroke-width="3"/>
{pattern}
<rect x="63" y="54" width="78" height="48" rx="12" fill="#efba57"/><text x="102" y="87" font-family="Arial,Helvetica,sans-serif" font-size="21" font-weight="900" fill="#102c49" text-anchor="middle">CG</text>
<text x="158" y="76" font-family="Arial,Helvetica,sans-serif" font-weight="800" letter-spacing="1.5" font-size="16" fill="#f8d28b">CRECER GRANDE</text>
<text x="64" y="219" font-family="Arial,Helvetica,sans-serif" font-weight="600" letter-spacing="1" font-size="17" fill="#edc481">{tag}</text>
{title_rows}
<path d="M 64 430 H 737" stroke="#ffffff" stroke-opacity=".24" stroke-width="1"/>
<text x="64" y="460" font-family="Arial,Helvetica,sans-serif" font-size="14" fill="#c9d5e2">ILLUSTRATIVE CATEGORY ART · NOT A PRODUCT PHOTO</text>
<text x="736" y="460" font-family="Arial,Helvetica,sans-serif" font-size="14" text-anchor="end" fill="#e7b650">{serial}</text>
</svg>'''
    dest=DIR/(slug+".svg")
    ET.fromstring(svg)
    dest.write_text(svg+"\n",encoding="utf8")
print(f"GENERATED|{len(items)}|{DIR.relative_to(ROOT)}")
