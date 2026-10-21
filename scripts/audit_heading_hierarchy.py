#!/usr/bin/env python3
"""Inventory structural page headings without treating footer headings as article headings."""
from pathlib import Path
import re,json
ROOT=Path(__file__).resolve().parents[1]
H=re.compile(r'<h([1-6])\b[^>]*>([\s\S]*?)</h\1\s*>',re.I)
for f in sorted(ROOT.rglob('*.html')):
    p=f.relative_to(ROOT).as_posix()
    s=f.read_text(encoding='utf8',errors='replace')
    if re.search(r'<meta\b[^>]*http-equiv=["\x27]refresh',s,re.I):continue
    main=re.search(r'<main\b[^>]*>([\s\S]*?)</main>',s,re.I)
    text=main.group(1) if main else re.split(r'<footer\b',s,flags=re.I)[0]
    headings=[(int(m.group(1)),re.sub(r'<[^>]*>','',m.group(2)).strip().replace('\n',' ')[:80],m.start(),m.group(0)[:170]) for m in H.finditer(text)]
    jumps=[{'idx':i,'before':headings[i-1][0] if i else 0,'after':row[0],'label':row[1],'tag':row[3]} for i,row in enumerate(headings) if row[0]>(headings[i-1][0] if i else 0)+1]
    if not main or jumps or sum(k==1 for k,*_ in headings)!=1:
        print('HEADINGS|'+json.dumps({'path':p,'seq':''.join(str(x[0]) for x in headings),'total':len(headings),'main':bool(main),'one_h1':sum(k==1 for k,*_ in headings)==1,'headings':[{'n':x[0],'title':x[1]} for x in headings],'jumps':jumps},ensure_ascii=False),flush=True)
print('INVENTORY_DONE')
