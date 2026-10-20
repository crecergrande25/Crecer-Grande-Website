#!/usr/bin/env python3
"""Give every content image exactly one sitewide placement.

Run in a clean checkout. Images in repeated marketing cards become semantic,
image-free CSS illustrations. Global navigation uses accessible typographic
branding instead of repeatedly embedding a logo file.
"""
import json
import re
from collections import defaultdict
from html import escape
from pathlib import Path
from PIL import Image, ImageOps, ImageChops, ImageStat

ROOT=Path(__file__).resolve().parents[1]
IMAGE_ROOT=ROOT/"assets/images"
ART='linear-gradient(145deg,#0b203a,#23466b)'
WORDMARK='<span class="cg-typographic-logo" aria-label="Crecer Grande"><span class="cg-type-glyph" aria-hidden="true">CG</span><span class="cg-type-name">CRECER <strong>GRANDE</strong></span></span>'

def dhash(im):
    px=list(ImageOps.grayscale(im).resize((9,8)).getdata())
    return sum((1<<(63-(y*8+x))) for y in range(8) for x in range(8) if px[y*9+x]>px[y*9+x+1])
def norm(im):
    return ImageOps.fit(im.convert("RGB"),(96,96))
files=[]
for p in sorted(IMAGE_ROOT.rglob("*")):
    if p.suffix.lower() not in (".jpg",".jpeg",".webp",".png"):continue
    with Image.open(p) as im:
        im.load()
        files.append((p.relative_to(ROOT).as_posix(),im.width,im.height,dhash(im),norm(im)))
parents=list(range(len(files)))
def find(i):
    while parents[i]!=i:
        parents[i]=parents[parents[i]]
        i=parents[i]
    return i
def union(i,j):
    a,b=find(i),find(j)
    if a!=b:parents[b]=a
for i,a in enumerate(files):
    if min(a[1:3])<200:continue
    for j in range(i+1,len(files)):
        b=files[j]
        if min(b[1:3])<200:continue
        if (a[3]^b[3]).bit_count()>2:continue
        stat=ImageStat.Stat(ImageChops.difference(a[4],b[4]))
        if max(stat.mean)<11:union(i,j)

GROUP={}
for i,(p,*_) in enumerate(files):GROUP["/"+p]=find(i)
for idx,p in enumerate(sorted(IMAGE_ROOT.rglob("*.svg"))):
    GROUP["/"+p.relative_to(ROOT).as_posix()]="svg:"+p.name

pages=[p for p in ROOT.rglob("*.html") if ".git" not in p.parts and "node_modules" not in p.parts]
preferred=["index.html","services.html","divisions.html","projects.html","insights.html","industries.html","about.html","contact.html","request-quote.html","engineering-desk.html"]
rank={name:i for i,name in enumerate(preferred)}
pages.sort(key=lambda p:(rank.get(p.relative_to(ROOT).as_posix(),100),p.relative_to(ROOT).as_posix()))
owner={}
changed=[]
kept=[]
replaced=[]
branding=0
url_re=re.compile(r'url\(\s*(["\x27]?)(?:/)?assets/images/[^)\x27"]+\1\s*\)',re.I)
img_re=re.compile(r'<img\b[^>]*>',re.I|re.S)
source_re=re.compile(r'<source\b[^>]*>',re.I|re.S)
src_re=re.compile(r'\bsrc\s*=\s*(["\x27])([^"\x27]+)\1',re.I)
alt_re=re.compile(r'\balt\s*=\s*(["\x27])([^"\x27]*)\1',re.I)

def normpath(src):
    src=src.strip().split("?")[0].split("#")[0]
    if src.startswith("https://crecergrande.in/"):src=src[len("https://crecergrande.in"):]
    if src.startswith("assets/images/"):src="/"+src
    return src

def repl_img(path,found):
    global branding
    tag=found.group(0)
    src=src_re.search(tag)
    if not src:return tag
    url=normpath(src.group(2))
    if not url.startswith("/assets/images/"):return tag
    alt_match=alt_re.search(tag)
    alt=alt_match.group(2) if alt_match else ""
    if re.search(r'/(?:logo(?:-icon)?|Logo-R01|favicon|apple-touch-icon)\.(?:png|webp|jpg|jpeg|svg)$',url,re.I):
        branding+=1
        return WORDMARK
    key=GROUP.get(url,url)
    if key not in owner:
        owner[key]={"path":path,"url":url,"alt":alt}
        kept.append({"page":path,"image":url})
        return tag
    label=(alt or "Engineering and industrial services").strip()
    label=re.sub(r"\s+"," ",label)[:96]
    replaced.append({"page":path,"image":url,"firstPage":owner[key]["path"]})
    return '<div class="cg-art-placeholder" role="img" aria-label="'+escape(label,quote=True)+'"><span class="cg-art-mark" aria-hidden="true">CG</span><span class="cg-art-label">'+escape(label)+'</span></div>'

for path in pages:
    name=path.relative_to(ROOT).as_posix()
    text=path.read_text(encoding="utf8")
    original=text
    # When CSS or JS backgrounds reuse a photo, use gradient designs instead;
    # the static content image already has a unique single placement.
    text=url_re.sub(ART,text)
    text=source_re.sub(lambda m:re.sub(r'\s+srcset\s*=\s*(["\x27])[^"\x27]+\1','',m.group(0),flags=re.I),text)
    text=img_re.sub(lambda m:repl_img(name,m),text)
    if text!=original:
        path.write_text(text,encoding="utf8")
        changed.append(name)
# Asset URL references in CSS are global rules, not a unique page placement.
# Replace photographic CSS backgrounds with gradients, preserving text overlays.
for path in ROOT.rglob("*.css"):
    if ".git" in path.parts:continue
    text=path.read_text(encoding="utf8")
    new=url_re.sub(ART,text)
    if text!=new:
        path.write_text(new,encoding="utf8")
        changed.append(path.relative_to(ROOT).as_posix())

# Prevent live CMS content from replacing a unique page photo with a reused or
# outdated legacy image URL. Editorial text updates continue to work.
cms=ROOT/"assets/js/cms.js"
cms_text=cms.read_text(encoding="utf8")
cms_new=re.sub(r"if\(text\(data\.image_url\)\)\s*\{\s*const img=hero\?\.querySelector\('img'\);\s*if\(img\)img\.src=data\.image_url;\s*\}", "/* Keep the individually assigned page image rather than a reused CMS image. */",cms_text)
if cms_new==cms_text:raise RuntimeError("CMS image override pattern changed")
cms.write_text(cms_new,encoding="utf8")
changed.append("assets/js/cms.js")

# Remove both page-art routines. They were re-introducing the same photographs
# behind dozens of pages via --cg-hero-art and --cg-page-art.
js=ROOT/"assets/js/site.js"
txt=js.read_text(encoding="utf8")
old=txt
start=txt.find("function applyServiceFirstArt(){")
end=txt.find("function removeDuplicateTerminalCta(){",start)
if start==-1 or end==-1:raise RuntimeError("Unable to locate shared page art override")
txt=txt[:start]+'function applyServiceFirstArt(){ /* Keep page hero artwork image-free. */ }\n\n  '+txt[end:]
i=txt.find("/* ==========================================================================\n   CG UNIQUE HERO ART MAP")
if i==-1:raise RuntimeError("Unable to locate legacy hero image map")
txt=txt[:i]
# Replace the injected shared-header and footer image tags with text branding.
txt=re.sub(r'<img\b[^>]*?\bsrc=\\?["\x27]/assets/images/logo\.png\\?["\x27][^>]*>',lambda m: WORDMARK.replace('"',r'\"') if r'\"' in m.group(0) else WORDMARK,txt,flags=re.I)
txt=url_re.sub(ART,txt)
if txt!=old:
    js.write_text(txt,encoding="utf8")
    changed.append("assets/js/site.js")

css=ROOT/"assets/css/unique-media.css"
css.write_text("""
/* Global image-free alternatives for previously duplicated photography. */
.cg-art-placeholder{position:relative;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:12px;isolation:isolate;overflow:hidden;width:100%;height:100%;min-height:170px;aspect-ratio:16/10;padding:23px;text-align:center;color:#fff;background:radial-gradient(ellipse at 18% 8%,rgba(245,185,65,.34),transparent 48%),linear-gradient(135deg,#0a2340 0%,#1b5070 62%,#103458 100%);font-family:inherit}
.cg-art-placeholder:before{content:"";position:absolute;z-index:-1;inset:0;background-image:linear-gradient(rgba(255,255,255,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.09) 1px,transparent 1px);background-size:28px 28px;transform:skewY(-9deg) scale(1.25);opacity:.4}
.cg-art-mark{display:flex;align-items:center;justify-content:center;width:64px;height:64px;border:1px solid rgba(255,208,105,.56);border-radius:17px;background:rgba(255,255,255,.08);color:#ffd67c;font-size:24px;letter-spacing:-.06em;font-weight:950}
.cg-art-label{font-size:clamp(12px,1.2vw,16px);font-weight:750;line-height:1.4;max-width:34ch;text-wrap:balance}
.cg-typographic-logo{display:inline-flex;align-items:center;gap:9px;color:#f2be55;font-size:14px;font-weight:800;letter-spacing:.06em;line-height:1.15;white-space:nowrap}
.cg-type-glyph{display:grid;place-items:center;width:39px;height:39px;border-radius:10px;background:#f8c04f;color:#102b48;font-size:16px;font-weight:950;letter-spacing:-.09em}
.cg-type-name{display:block;font-size:clamp(12px,1.3vw,18px);letter-spacing:.07em}
.cg-type-name strong{display:block;color:#fff;font-weight:850}
.cg-footer .cg-typographic-logo,.cg-footer .cg-typographic-logo strong{color:#f4bd53}
.cg-footer .cg-type-name strong{color:inherit}
@media(max-width:600px){.cg-art-placeholder{min-height:145px;padding:16px}.cg-art-mark{width:48px;height:48px;font-size:20px}.cg-art-label{font-size:12px}.cg-type-name{font-size:12px}.cg-type-glyph{width:32px;height:32px;font-size:13px}}
""".strip()+"\n",encoding="utf8")
changed.append("assets/css/unique-media.css")

# Add the stylesheet to every rendered HTML page rather than injecting it late,
# preventing a flash of unstyled visual fallback.
for p in pages:
    text=p.read_text(encoding="utf8")
    if 'href="/assets/css/unique-media.css' not in text:
        text=re.sub(r'</head\s*>','<link rel="stylesheet" href="/assets/css/unique-media.css?v=1.0.0"></head>',text,count=1,flags=re.I)
        p.write_text(text,encoding="utf8")
        name=p.relative_to(ROOT).as_posix()
        if name not in changed:changed.append(name)

report={"kept":kept,"replaced":replaced,"logoReplacements":branding,"filesChanged":changed,"pixelGroups":{k:str(v) for k,v in GROUP.items()}}
out=ROOT/"scripts/unique_image_placements.json"
out.write_text(json.dumps(report,indent=2)+"\n",encoding="utf8")
print("RESULT|"+json.dumps({"htmlPages":len(pages),"originalImageReferences":len(kept)+len(replaced)+branding,"uniqueContentImages":len(kept),"replacedDuplicateImages":len(replaced),"logoToText":branding,"filesChanged":len(changed),"imageGroups":len(set(str(x) for x in GROUP.values()))}))
