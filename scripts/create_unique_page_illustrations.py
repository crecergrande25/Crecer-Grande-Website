#!/usr/bin/env python3
"""Replace one-off branded placeholders with original site-specific SVG drawings.
No stock images, duplicated source photographs or generic text-only placeholders.
Run on isolated branch; re-running is a no-op.
"""
from pathlib import Path
import hashlib
import html
import random
import re
import textwrap

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'assets/images/page-unique'
OUT.mkdir(parents=True, exist_ok=True)

PATTERN = re.compile(
    r'<div class="cg-art-placeholder" role="img" aria-label="([^"]*)">'
    r'<span class="cg-art-mark" aria-hidden="true">CG</span>'
    r'<span class="cg-art-label">([^<]*)</span></div>'
)

PALETTES = [
    ('#0b2340','#1d4b70','#efbb5c'),('#0b2a36','#22556c','#dfad51'),
    ('#141f3d','#2c466b','#eab958'),('#0c2d44','#245f77','#f5bf67'),
    ('#0f2635','#375267','#e2b468'),('#132746','#325278','#edbd65')
]

def category(text):
    t = text.lower()
    if any(k in t for k in ('plc','hmi','controls','automation','electrical','sensor','electronic')): return 'automation'
    if any(k in t for k in ('chiller','coolant','refrigeration','cooling','pump','thermal')): return 'chiller'
    if any(k in t for k in ('3d print','additive','prototype','fdm','sla','resin')): return 'printing'
    if any(k in t for k in ('laser','optics','marking','nozzle','welding','consumable')): return 'laser'
    if any(k in t for k in ('cnc','machining','milling','spindle','feeds','cutting speed')): return 'cnc'
    if any(k in t for k in ('bending','sheet metal','press brake','fabrication')): return 'bending'
    if any(k in t for k in ('inspection','quality','metrology','verification','capa','ncr','tolerance','measurement')): return 'inspection'
    if any(k in t for k in ('cad','drawing','design','reverse','engineering','geometry','drafting')): return 'engineering'
    if any(k in t for k in ('maintenance','machine','breakdown','repair','service')): return 'maintenance'
    if any(k in t for k in ('tender','procurement','sourcing','supply','document','compliance','audit')): return 'documentation'
    return 'components'

def artwork(kind, accent):
    # Distinct, recognizable engineered shapes. The panel is a concept image,
    # not a representation of an identifiable OEM product.
    outlines='#b9d6e8'
    if kind=='automation':
        return f'''<rect x="92" y="52" width="328" height="358" rx="22" fill="#153551" stroke="{outlines}" stroke-width="6"/>
        <rect x="118" y="85" width="272" height="90" rx="10" fill="#0a1c2e" stroke="{accent}" stroke-width="4"/>
        <path d="M140 130h72l24-23 26 46 27-24h66" fill="none" stroke="#6dd4da" stroke-width="6"/>
        <g fill="{accent}"><rect x="120" y="211" width="105" height="110" rx="12"/><rect x="249" y="211" width="140" height="110" rx="12"/></g>
        <g stroke="#09253f" stroke-width="9"><path d="M138 240h72m-72 24h72m-72 24h72"/><path d="M270 242h94m-94 25h94m-94 25h94"/></g>
        <path d="M145 410v45m56-45v45m58-45v45m60-45v45m60-45v45" stroke="#86cbd1" stroke-width="9"/>'''
    if kind=='laser':
        return f'''<rect x="36" y="310" width="478" height="65" rx="10" fill="#6d8297" stroke="{outlines}" stroke-width="5"/>
        <path d="M92 304v-212h345v212" stroke="{outlines}" stroke-width="20" fill="none"/>
        <rect x="226" y="90" width="80" height="190" rx="18" fill="#1e4766" stroke="#d9e7f0" stroke-width="7"/>
        <path d="M260 272l6 59" stroke="{accent}" stroke-width="10"/>
        <circle cx="266" cy="358" r="87" fill="{accent}" opacity=".14"/>
        <path d="M265 331l-112 106m112-106l13 132m-13-132l150 100m-150-100l-167 12m167-12l185-50" stroke="{accent}" stroke-width="7" stroke-linecap="round"/>
        <path d="M110 342h318m-305 19h288" stroke="#e5eef4" stroke-width="4" opacity=".66"/>'''
    if kind=='printing':
        return f'''<path d="M105 410v-318h360v318H105z" fill="none" stroke="{outlines}" stroke-width="14"/>
        <path d="M105 145h360M132 407h304" stroke="{accent}" stroke-width="11"/>
        <rect x="223" y="155" width="116" height="88" rx="13" fill="#54728b" stroke="{outlines}" stroke-width="6"/>
        <path d="M260 243h44l-10 33h-24z" fill="{accent}"/>
        <path d="M160 364h253" stroke="{outlines}" stroke-width="17" stroke-linecap="round"/>
        <path d="M202 361l42-65h99l42 65z" fill="#4b6e87" stroke="{accent}" stroke-width="7"/>
        <path d="M219 337h146m-131-20h116" stroke="#dce8ef" stroke-width="5"/>'''
    if kind=='chiller':
        return f'''<rect x="79" y="96" width="393" height="303" rx="27" fill="#31516c" stroke="{outlines}" stroke-width="8"/>
        <circle cx="213" cy="238" r="94" fill="#09223a" stroke="{accent}" stroke-width="10"/>
        <circle cx="213" cy="238" r="23" fill="{accent}"/>
        <path d="M213 150l25 66-25 22m86 0l-66 25-20-25m0 86l-25-66 25-20m-86 0l66-25 20 25" stroke="#bce6f0" stroke-width="12" fill="none"/>
        <rect x="342" y="159" width="89" height="96" rx="12" fill="#091d30" stroke="{outlines}" stroke-width="5"/>
        <path d="M359 207h54" stroke="#79e0ce" stroke-width="8"/>
        <path d="M347 314h85m-85 28h85" stroke="{accent}" stroke-width="9"/>'''
    if kind=='cnc':
        return f'''<rect x="82" y="95" width="405" height="310" rx="23" fill="#173b58" stroke="{outlines}" stroke-width="8"/>
        <path d="M125 134h310v42H125z" fill="#92acbf"/>
        <path d="M273 175v119" stroke="#dfe8ed" stroke-width="30"/>
        <path d="M256 296h34l-7 48h-20z" fill="{accent}"/>
        <rect x="143" y="354" width="286" height="35" rx="7" fill="#d5e2ea"/>
        <rect x="187" y="326" width="188" height="28" rx="8" fill="#647f96"/>
        <path d="M150 185v142m280-142v142" stroke="{accent}" stroke-width="6" stroke-dasharray="14 12"/>'''
    if kind=='bending':
        return f'''<path d="M64 135h445v66H64z" fill="#57758d" stroke="{outlines}" stroke-width="6"/>
        <path d="M100 201h356l-165 103z" fill="{accent}" opacity=".8"/>
        <path d="M86 357l165-76 165 76" fill="none" stroke="{outlines}" stroke-width="23" stroke-linejoin="round"/>
        <path d="M111 373l143-66 139 66" fill="none" stroke="#223e58" stroke-width="15"/>
        <path d="M85 390h396" stroke="{accent}" stroke-width="9"/>
        <path d="M132 124v-35m317 35v-35" stroke="{outlines}" stroke-width="11"/>'''
    if kind=='inspection':
        return f'''<circle cx="268" cy="242" r="166" fill="#254660" stroke="{outlines}" stroke-width="8"/>
        <circle cx="268" cy="242" r="132" fill="#0c273e" stroke="{accent}" stroke-width="6"/>
        <path d="M268 141v93l58 38" stroke="#f1c66f" stroke-width="12" stroke-linecap="round"/>
        <g stroke="{outlines}" stroke-width="5"><path d="M268 100v25m142 117h-26M268 385v-25M126 242h25"/></g>
        <path d="M137 370l70 63 187-209" stroke="#80dbc2" stroke-width="18" stroke-linecap="round" stroke-linejoin="round" fill="none"/>'''
    if kind=='engineering':
        return f'''<path d="M276 74l174 100v193L276 466 102 367V174z" fill="#2b5470" fill-opacity=".55" stroke="{outlines}" stroke-width="7"/>
        <path d="M102 174l174 103 174-103M276 277v189" fill="none" stroke="{accent}" stroke-width="6"/>
        <path d="M184 217l92-55 92 55v112l-92 56-92-56z" fill="#41657e" stroke="#bde0ed" stroke-width="5"/>
        <path d="M184 217l92 58 92-58m-92 58v110" fill="none" stroke="{accent}" stroke-width="5"/>
        <g stroke="#b5d9e9" stroke-width="3" stroke-dasharray="10 10"><path d="M70 160V390M487 160v230M70 418h415"/></g>'''
    if kind=='maintenance':
        return f'''<circle cx="265" cy="249" r="147" fill="#233f58" stroke="{outlines}" stroke-width="8"/>
        <circle cx="265" cy="249" r="76" fill="#0a1b31" stroke="{accent}" stroke-width="10"/>
        <circle cx="265" cy="249" r="25" fill="{accent}"/>
        <g stroke="{outlines}" stroke-width="23" stroke-linecap="round"><path d="M265 79v34m0 273v34M94 249h35m272 0h35M144 128l26 26m190 190l26 26m0-242l-26 26m-190 190l-26 26"/></g>
        <path d="M415 106l38 25-47 53 42 43-29 30-43-43-55 48-25-37 78-76z" fill="{accent}"/>'''
    if kind=='documentation':
        return f'''<path d="M145 75h240l70 70v311H145z" fill="#f4f7f9" stroke="{outlines}" stroke-width="8"/>
        <path d="M385 75v70h70" fill="#b7cfde"/>
        <g stroke="#4c728b" stroke-width="10" stroke-linecap="round"><path d="M218 204h159m-159 53h159m-159 53h130m-130 53h159"/></g>
        <path d="M159 206l19 20 35-43m-54 73l19 20 35-43m-54 75l19 20 35-43" stroke="#2fbd9b" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="414" cy="397" r="61" fill="{accent}"/><path d="M386 396l20 22 39-43" stroke="#15354c" stroke-width="11" fill="none"/>'''
    return f'''<circle cx="262" cy="248" r="139" fill="#173a57" stroke="{outlines}" stroke-width="9"/>
    <circle cx="262" cy="248" r="60" fill="#0d2037" stroke="{accent}" stroke-width="13"/>
    <g stroke="{outlines}" stroke-width="25" stroke-linecap="round"><path d="M262 80v51m0 233v51M95 248h48m236 0h48M144 131l36 36m164 164l36 36m0-236l-36 36m-164 164l-36 36"/></g>
    <path d="M210 247h104M262 194v107" stroke="{accent}" stroke-width="11"/>'''

def make_svg(label, theme, digest):
    seed=int(digest[:8],16)
    rng=random.Random(seed)
    a,b,accent=PALETTES[seed % len(PALETTES)]
    # Text on the drawing is explanatory and does not claim an actual product photo.
    clean=' '.join(html.unescape(label).split())
    words=textwrap.wrap(clean, width=30, break_long_words=False, max_lines=3, placeholder='…')
    lineheight=46 if len(words)>2 else 52
    size=35 if len(words)>2 else 40
    text=''.join(
        '<text x="70" y="'+str(315+i*lineheight)+'" font-family="Arial,Helvetica,sans-serif" fill="#fff" font-size="'+str(size)+'" font-weight="700">'+html.escape(t)+'</text>'
        for i,t in enumerate(words)
    )
    strokes=''.join(
        '<path d="M'+str(710+i*45)+' '+str(76+(i%3)*11)+' v'+str(14+rng.randrange(20))+
        '" stroke="'+accent+'" opacity=".44" stroke-width="4"/>'
        for i in range(8)
    )
    motif=artwork(theme,accent)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750" role="img" aria-labelledby="title desc">
<title id="title">{html.escape(clean)} — engineering illustration</title>
<desc id="desc">Original, unique technical illustration for this page placement. Concept artwork, not a photograph of specific equipment.</desc>
<defs><linearGradient id="bg" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="{a}"/><stop offset=".7" stop-color="{b}"/><stop offset="1" stop-color="{a}"/></linearGradient>
<pattern id="grid" width="44" height="44" patternUnits="userSpaceOnUse"><path d="M44 0H0V44" fill="none" stroke="#fff" stroke-opacity=".075"/></pattern></defs>
<rect width="1200" height="750" fill="url(#bg)"/><rect width="1200" height="750" fill="url(#grid)"/>
<circle cx="{945+(seed%61)-30}" cy="{345+(seed%79)-40}" r="305" fill="#f5bf70" opacity=".07"/>
<path d="M615 90V660" stroke="#fff" opacity=".12" stroke-width="3"/>
<g transform="translate({665+(seed%33)} {104+(seed%23)}) rotate({(seed%9)-4} 265 225)">{motif}</g>
{strokes}
<rect x="70" y="92" width="78" height="54" rx="12" fill="{accent}"/><text x="109" y="129" font-size="27" font-weight="900" fill="#11283f" font-family="Arial,Helvetica,sans-serif" text-anchor="middle">CG</text>
<text x="166" y="128" font-family="Arial,Helvetica,sans-serif" font-size="25" font-weight="800" fill="#ffe0a7" letter-spacing="1.1">CRECER GRANDE</text>
<text x="70" y="249" fill="{accent}" font-family="Arial,Helvetica,sans-serif" font-size="22" font-weight="750" letter-spacing="2">{html.escape(theme.upper())} / TECHNICAL VISUAL</text>
{text}
<path d="M70 603h1056" stroke="#fff" stroke-opacity=".27" stroke-width="2"/>
<text x="70" y="641" font-family="Arial,Helvetica,sans-serif" font-size="20" fill="#ccdce7">UNIQUE CONCEPT ILLUSTRATION · NOT A PRODUCT PHOTO</text>
<text x="1125" y="641" text-anchor="end" font-family="monospace" font-size="20" fill="{accent}">CG-{digest[:10].upper()}</text>
</svg>'''

created=[]
changed=[]
for page in sorted(ROOT.rglob('*.html')):
    if '.git' in page.parts or 'node_modules' in page.parts:
        continue
    relative=page.relative_to(ROOT).as_posix()
    original=page.read_text(encoding='utf-8')
    number=[0]
    def replace(match):
        number[0]+=1
        label=html.unescape(match.group(1))
        digest=hashlib.sha256((relative+'|'+str(number[0])+'|'+label).encode()).hexdigest()
        base=relative.replace('/','-').replace('.html','')
        base=re.sub('[^a-zA-Z0-9-]+','-',base).strip('-').lower()[:64]
        image_file=base+'-'+str(number[0]).zfill(2)+'-'+digest[:8]+'.svg'
        destination=OUT/image_file
        destination.write_text(make_svg(label,category(label+' '+relative),digest),encoding='utf-8')
        created.append(destination.relative_to(ROOT).as_posix())
        alt=html.escape('Concept illustration: '+label,quote=True)
        eager='eager' if any(token in original[max(0,match.start()-140):match.start()] for token in ('hero-media','hero-visual')) else 'lazy'
        return ('<img class="cg-unique-illustration" src="/assets/images/page-unique/'+image_file+
                '" alt="'+alt+'" loading="'+eager+
                '" decoding="async" width="1200" height="750" style="display:block;width:100%;height:100%;object-fit:cover">')
    updated=PATTERN.sub(replace,original)
    if updated!=original:
        if 'unique-media.css' not in updated:
            updated=updated.replace('</head>','<link rel="stylesheet" href="/assets/css/unique-media.css?v=1.1.0"></head>',1)
        page.write_text(updated,encoding='utf-8')
        changed.append(relative)

css=ROOT/'assets/css/unique-media.css'
content=css.read_text(encoding='utf-8')
new_style='\n/* Original, individually illustrated content images preserve the original media frame. */\n.cg-unique-illustration{display:block;inline-size:100%;block-size:100%;min-height:0;object-fit:cover;max-inline-size:100%}\n'
if new_style not in content:
    css.write_text(content+new_style,encoding='utf-8')

# No hidden text-only placeholders should remain in a public HTML page.
unreplaced=[str(x.relative_to(ROOT)) for x in ROOT.rglob('*.html') if 'cg-art-placeholder' in x.read_text(encoding='utf-8')]
if unreplaced:
    raise RuntimeError('Unconverted placeholders: '+','.join(unreplaced))
if len(created)!=len(set(created)):
    raise RuntimeError('Repeated SVG file name')
if not created:
    raise RuntimeError('No placeholder images found; site likely already converted')
print('ILLUSTRATED|'+str(len(created))+'|PAGES|'+str(len(changed)),flush=True)
for item in created:
    print('IMAGE|'+item)
print('FILES|'+','.join(changed))
