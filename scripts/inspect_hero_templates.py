#!/usr/bin/env python3
from pathlib import Path
import re, json
from html.parser import HTMLParser
root=Path(__file__).resolve().parents[1]
redirects=0
for p in sorted(root.rglob('*.html')):
    if p.parts[-2]=='admin':continue
    s=p.read_text(encoding='utf-8')
    relative=p.relative_to(root).as_posix()
    if 'http-equiv="refresh"' in s[:1500].lower() or re.search(r'<meta[^>]+http-equiv=["\x27]refresh',s,re.I):
        redirects+=1;continue
    m=re.search(r'<(?:section|div|header)\b[^>]*class=["\x27][^"\x27]*(?:hero|masthead)[^"\x27]*["\x27][^>]*>',s,re.I)
    if not m:
        print('HERO|'+json.dumps({'p':relative,'found':False}));continue
    t=s[m.start():m.start()+14000]
    h1=re.search(r'<h1\b[^>]*>([\s\S]*?)</h1>',t,re.I)
    title=re.sub(r'<[^>]+>',' ',h1.group(1))[:100] if h1 else ''
    imgs=re.findall(r'<img\b[^>]*>',t,re.I)
    blocks=re.findall(r'<(?:div|figure|picture|section)\b[^>]*class=["\x27][^"\x27]*(?:hero|visual|media|image|art)[^"\x27]*["\x27][^>]*>',t[:7800],re.I)
    imgList=[]
    for im in imgs[:8]:
        src=(re.search(r'\bsrc=["\x27]([^"\x27]+)',im) or [None,None])[1]
        cls=(re.search(r'\bclass=["\x27]([^"\x27]+)',im) or [None,None])[1]
        imgList.append({'src':src,'class':cls,'tag':im[:200]})
    print('HERO|'+json.dumps({'p':relative,'found':True,'tag':m.group(0)[:170], 'h1':title,'images':imgList,'blocks':blocks[:9]}))
print('REDIRECT_PAGES|'+str(redirects))
