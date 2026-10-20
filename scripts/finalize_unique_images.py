#!/usr/bin/env python3
"""Final sweep to eliminate repeated header/footer logo image tags."""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
wordmark='<span class="cg-typographic-logo" aria-label="Crecer Grande"><span class="cg-type-glyph" aria-hidden="true">CG</span><span class="cg-type-name">CRECER <strong>GRANDE</strong></span></span>'
count=0
for page in root.rglob("*.html"):
    s=page.read_text(encoding="utf8")
    def replace(m):
        global count
        tag=m.group(0)
        if any(v in tag.lower() for v in ("/assets/images/logo.png","/assets/images/logo-icon.png","/assets/images/logo-r01.png")):
            count+=1
            return wordmark
        return tag
    t=re.sub(r"<img\b[^>]*>",replace,s,flags=re.I|re.S)
    if t!=s:page.write_text(t,encoding="utf8")
print("LOGO_SWEEP|"+str(count))
