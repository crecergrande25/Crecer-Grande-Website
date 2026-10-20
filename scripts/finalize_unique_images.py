#!/usr/bin/env python3
"""Finish sitewide visual deduplication, including ../assets relative URLs."""
from pathlib import Path
from html import escape
from urllib.parse import urljoin,urlparse
import json,re
ROOT=Path(__file__).resolve().parents[1]
manifest_path=ROOT/"scripts/unique_image_placements.json"
report=json.loads(manifest_path.read_text(encoding="utf8"))
groups=report["pixelGroups"]
first={}
for item in report["kept"]:
    key=str(groups.get(item["image"],item["image"]))
    first.setdefault(key, (item["page"],item["image"]))
seen=set()
logos=0;other=0;new=0
wordmark='<span class="cg-typographic-logo" aria-label="Crecer Grande"><span class="cg-type-glyph" aria-hidden="true">CG</span><span class="cg-type-name">CRECER <strong>GRANDE</strong></span></span>'
reimg=re.compile(r"<img\b[^>]*>",re.I|re.S)
resrc=re.compile(r'(?<![\w:-])src\s*=\s*(["\x27])([^"\x27]+)\1',re.I)
realt=re.compile(r'\balt\s*=\s*(["\x27])([^"\x27]*)\1',re.I)
pages=list(ROOT.rglob("*.html"))
prior=["index.html","services.html","divisions.html","projects.html","insights.html","industries.html","about.html","contact.html","request-quote.html","engineering-desk.html"]
pages.sort(key=lambda p:(prior.index(p.relative_to(ROOT).as_posix()) if p.relative_to(ROOT).as_posix() in prior else 100, p.relative_to(ROOT).as_posix()))
for p in pages:
    route=p.relative_to(ROOT).as_posix()
    txt=p.read_text(encoding="utf8")
    def convert(m):
        global logos,other,new
        tag=m.group(0)
        match=resrc.search(tag)
        if not match:return tag
        src=match.group(2)
        url=urlparse(urljoin("https://crecergrande.in/"+route,src)).path
        if not url.startswith("/assets/images/"):return tag
        if re.search(r'/(?:Logo-R01|logo|logo-icon)\.(?:png|jpg|jpeg|svg|webp)$',url,re.I):
            logos+=1
            return wordmark
        key=str(groups.get(url,url))
        if key not in first:
            first[key]=(route,url)
            new+=1
        if first[key]==(route,url) and key not in seen:
            seen.add(key)
            return tag
        # If the original owner was already preserved in the first pass, do not
        # allow a duplicate on a later page or a second picture on the same page.
        alt=realt.search(tag)
        title=re.sub(r"\s+"," ",alt.group(2) if alt else "Engineering and industrial services").strip()[:96]
        other+=1
        return '<div class="cg-art-placeholder" role="img" aria-label="'+escape(title,quote=True)+'"><span class="cg-art-mark" aria-hidden="true">CG</span><span class="cg-art-label">'+escape(title)+'</span></div>'
    updated=reimg.sub(convert,txt)
    if updated!=txt:p.write_text(updated,encoding="utf8")
print("FINAL|"+json.dumps({"newlyEliminatedDuplicates":other,"additionalWordmarks":logos,"previouslyUnseenUniquePhotos":new}))
