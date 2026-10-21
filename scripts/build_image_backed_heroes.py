#!/usr/bin/env python3
"""Give every non-redirect public hero a unique image background without changing forms.
Keeps existing hero pictures as the page background; generates original SVG
industrial concept artwork for heroes with no dedicated image.
"""
from pathlib import Path
import re
import hashlib
import html
import random
from collections import Counter

ROOT=Path(__file__).resolve().parents[1]
ART=ROOT/"assets/images/hero-backgrounds"
ART.mkdir(parents=True,exist_ok=True)
OPEN=re.compile(r'<section\b[^>]*class=(["\x27])[^"\x27]*(?:hero|masthead)[^"\x27]*\1[^>]*>',re.I)
TOK=re.compile(r'</?section\b[^>]*>',re.I)
IM=re.compile(r'<img\b[^>]*\bsrc=["\x27]([^"\x27]+)["\x27][^>]*>',re.I)

def section_end(markup,start):
    depth=0
    for tag in TOK.finditer(markup,start):
        if tag.group(0).startswith('</'):depth-=1
        else:depth+=1
        if depth==0:return tag.end()
    raise RuntimeError("Unclosed hero section")

def theme(name):
    s=name.lower()
    for k,terms in {
      'laser':['laser','marking','welding','cutting','nozzle','consumables','optics'],
      'cad':['design','cad','draw','reverse','tolerance','datum','engineering'],
      'chiller':['chiller','cooling','pump','temperature'],
      'inspection':['inspection','quality','capa','audit','vernier','roughness','ncr','measurement'],
      'automation':['automation','controls','plc','electrical'],
      'machine':['machine','cnc','breakdown','maintenance','spares'],
      'printing':['printing','additive','prototype','3d'],
      'documents':['privacy','disclaimer','tender','rfq','quote','estimate','feedback','contact','404']
    }.items():
        if any(term in s for term in terms):return k
    return 'industrial'

def create_svg(path,kind,stamp):
    seed=int(stamp[:8],16)
    rng=random.Random(seed)
    # Technical illustration, not a claim that we own the photographed equipment.
    base=['#102b45','#133a55','#133047','#1b3c4f'][seed%4]
    bright=['#dfa834','#e9bd66','#cea04a','#e8b344'][seed%4]
    shapes=[]
    # Unique industrial panel geometry occupies right 75%, left stays dark for text.
    shapes.append('<g transform="translate(820 100)" stroke-linejoin="round" stroke-linecap="round">')
    if kind in ('cad','industrial','printing'):
      for i in range(3):
        x=80+i*175;y=105+(i%2)*50
        shapes.append(f'<path d="M{x} {y}l150 -85 160 86 -151 89z M{x} {y}v150l159 93v-154 M{x+159} {y+89}l151 -89v149l-151 94" stroke="{bright}" stroke-width="{3+i}" fill="#d4e6f0" fill-opacity=".035"/>')
      shapes.append('<path d="M125 315q160 -180 335 -40t340 -60" stroke="#b7d4e3" stroke-width="4" fill="none" stroke-dasharray="13 17"/>')
    elif kind in ('machine','laser','chiller'):
      for i in range(6):
        x=35+(i%3)*245;y=120+(i//3)*280
        shapes.append(f'<rect x="{x}" y="{y}" width="205" height="225" rx="18" fill="#5b8199" fill-opacity=".10" stroke="#b9d0df" stroke-width="4"/><circle cx="{x+100}" cy="{y+105}" r="{70-(i%3)*8}" stroke="{bright}" stroke-width="8" fill="none"/><circle cx="{x+100}" cy="{y+105}" r="23" stroke="#d1e3ee" stroke-width="4" fill="none"/>')
      shapes.append('<path d="M35 645H770M95 675H710" stroke="#90bac8" stroke-width="7"/>')
    elif kind=='inspection':
      for i in range(4):
        x=50+i*190
        shapes.append(f'<circle cx="{x+105}" cy="280" r="{85+(i%2)*28}" fill="none" stroke="{bright}" stroke-width="7"/><path d="M{x+105} 185v100l75 48" stroke="#b6dcea" stroke-width="9" fill="none"/>')
      shapes.append('<path d="M95 550l122 80 160 -170 133 103 206 -221" stroke="#a8e3d4" stroke-width="12" fill="none"/>')
    elif kind=='automation':
      shapes.append(f'<rect x="90" y="70" width="650" height="580" rx="28" fill="#8cb7d0" fill-opacity=".07" stroke="{bright}" stroke-width="6"/>')
      for i in range(7):
        x=135+i*80
        shapes.append(f'<rect x="{x}" y="130" width="52" height="125" rx="10" fill="#a1c5d9" fill-opacity=".12" stroke="#b9d6e7" stroke-width="3"/><path d="M{x+26} 255v105" stroke="{bright}" stroke-width="5"/>')
      shapes.append('<path d="M130 500h96l37-73 59 120 58-51h200" fill="none" stroke="#a4e2cc" stroke-width="10"/>')
    else:
      for i in range(6):
        x=55+(i%3)*250;y=110+(i//3)*300
        shapes.append(f'<rect x="{x}" y="{y}" width="215" height="280" rx="8" stroke="{bright}" stroke-width="4" fill="#c0e1ee" fill-opacity=".045"/><path d="M{x+33} {y+70}h145m-145 45h110m-110 45h145" stroke="#a7cadc" stroke-width="5"/>')
    shapes.append('</g>')
    dots=''.join(f'<circle cx="{rng.randrange(700,1750)}" cy="{rng.randrange(100,890)}" r="{rng.randrange(2,7)}" fill="{bright}" opacity=".4"/>' for _ in range(38))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1050" width="1920" height="1050">
<title>{html.escape(kind)} engineering background illustration</title>
<defs><linearGradient id="base" x2="1" y2=".2"><stop stop-color="#071627"/><stop offset=".6" stop-color="{base}"/><stop offset="1" stop-color="#46677c"/></linearGradient>
<pattern id="mesh" width="70" height="70" patternUnits="userSpaceOnUse"><path d="M70 0H0V70" stroke="#b4d8ea" stroke-width="1" fill="none" opacity=".16"/></pattern></defs>
<rect width="1920" height="1050" fill="url(#base)"/><rect width="1920" height="1050" fill="url(#mesh)"/>
<circle cx="{1480+seed%110}" cy="420" r="460" fill="{bright}" opacity=".09"/>
{dots}{''.join(shapes)}
<path d="M660 920h1180M920 958h920" stroke="{bright}" stroke-width="3" opacity=".38"/>
</svg>'''

def route_name(p):
    name=p.relative_to(ROOT).with_suffix('').as_posix()
    return 'home' if name=='index' else name.replace('/','-')

used_sources=set()
reports=[]
for p in sorted(ROOT.rglob("*.html")):
    path=p.relative_to(ROOT).as_posix()
    if path.startswith('admin/'):continue
    s=p.read_text(encoding='utf-8')
    if re.search(r'<meta\b[^>]*http-equiv=["\x27]refresh',s,re.I):continue
    match=OPEN.search(s)
    if match is None:raise RuntimeError(f'Hero not found: {path}')
    end=section_end(s,match.start())
    hero=s[match.start():end]
    # Keep the page's own actual hero picture, never reuse an image on another page.
    image=IM.search(hero)
    bg_src=None
    if image:
        src=image.group(1)
        if src.startswith('../assets/images/'):src='/assets/images/'+src.split('../assets/images/',1)[1]
        if src.startswith('assets/images/'):src='/'+src
        if src.startswith('/assets/images/') and src not in used_sources:
            if not (ROOT/src.lstrip('/')).is_file():raise RuntimeError(f'Missing hero image: {path}: {src}')
            bg_src=src
            used_sources.add(src)
    if not bg_src:
        slug=route_name(p)
        stamp=hashlib.sha256(path.encode()).hexdigest()
        bg_src='/assets/images/hero-backgrounds/'+slug+'-'+stamp[:8]+'.svg'
        target=ROOT/bg_src.lstrip('/')
        target.write_text(create_svg(path,theme(path),stamp),encoding='utf-8')
        used_sources.add(bg_src)

    opening=match.group(0)
    # A custom property is used rather than a direct background shorthand so
    # the stylesheet controls contrast/position at every responsive width.
    replacement=opening.replace('class=', 'class=',1)
    replacement=re.sub(r'class=(["\x27])([^"\x27]+)\1',lambda m:'class='+m.group(1)+m.group(2)+' cg-image-backed-hero'+m.group(1),replacement,count=1)
    # Legacy theme scripts inject late !important hero backgrounds.
    # Place the final image-backed background on the hero itself so that
    # a page cannot silently fall back to its previous blank/white design.
    rule=('--cg-hero-background-art:url('+bg_src+');'
          'background-color:#081b2f!important;'
          'background-image:linear-gradient(90deg,rgba(3,13,27,.94) 0%,rgba(5,23,43,.87) 39%,rgba(8,33,55,.63) 71%,rgba(7,28,48,.47) 100%),url('+bg_src+')!important;'
          'background-position:center,center!important;'
          'background-size:cover,cover!important;'
          'background-repeat:no-repeat!important;')
    if re.search(r'\bstyle=(["\x27])',replacement):
        replacement=re.sub(r'\bstyle=(["\x27])([^"\x27]*)\1',lambda m:'style='+m.group(1)+m.group(2).rstrip(';')+';'+rule+m.group(1),replacement,count=1)
    else:replacement=replacement[:-1]+' style="'+rule+'">'
    s=s[:match.start()]+replacement+s[match.end():]
    # Some older page-specific scripts set dark hero text with !important.
    # Ensure every hero headline and introductory paragraph stays readable
    # against its now-dark, image-backed canvas.
    start_hero=match.start()
    end_hero=section_end(s,start_hero)
    hero_updated=s[start_hero:end_hero]
    def force_light(m):
        tag=m.group(0)
        style=re.search(r'\bstyle=(["\x27])([^"\x27]*)\1',tag,re.I)
        if style:
            return tag[:style.start(2)]+style.group(2).rstrip(';')+';color:#fff!important;'+tag[style.end(2):]
        return tag[:-1]+' style="color:#fff!important">'
    hero_updated=re.sub(r'<(?:h1|h2|h3|p)\b[^>]*>',force_light,hero_updated,flags=re.I)
    s=s[:start_hero]+hero_updated+s[end_hero:]
    if '/assets/css/sitewide-hero-backgrounds.css' not in s:
        tag='<link rel="stylesheet" href="/assets/css/sitewide-hero-backgrounds.css?v=1.0.0">'
        s=s.replace('</head>',tag+'</head>',1)
    p.write_text(s,encoding='utf-8')
    reports.append({'page':path,'background':bg_src,'hero':opening,'had_hero_image':bool(image),'uses_existing':bool(image and image.group(1).split('/')[-1]==bg_src.split('/')[-1])})
print('SITEWIDE_HERO_SUMMARY|'+str(len(reports))+'|GENERATED|'+str(len(list(ART.glob("*.svg")))))
for record in reports:
    print('HERO_MAPPING|'+record['page']+'|'+record['background']+'|'+('existing' if record['uses_existing'] else 'new_art'))
