#!/usr/bin/env python3
"""CI guard for main landmarks, accessible H1..H6 hierarchy, and footer title levels."""
from pathlib import Path
import re
ROOT=Path(__file__).resolve().parents[1]
errors=[]
checked=0
footers=0
for file in sorted(ROOT.rglob("*.html")):
    p=file.relative_to(ROOT).as_posix()
    if p.startswith("admin/"):continue
    s=file.read_text(encoding="utf8",errors="replace")
    if re.search(r'<meta\b[^>]*http-equiv=["\x27]refresh',s,re.I):continue
    m=re.search(r'<main\b[^>]*>([\s\S]*?)</main>',s,re.I)
    if not m:
        errors.append(f"{p}: missing main landmark")
        continue
    hs=[int(x) for x in re.findall(r'<h([1-6])\b',m.group(1),re.I)]
    checked+=1
    if hs.count(1)!=1:errors.append(f"{p}: main must have exactly one H1; got {hs.count(1)}")
    if hs and hs[0]!=1:errors.append(f"{p}: first main heading is H{hs[0]}, not H1")
    for i,n in enumerate(hs):
        before=hs[i-1] if i else 0
        if n>before+1: errors.append(f"{p}: H{before} to H{n} heading jump")
    foot=re.search(r'<footer\b[^>]*>([\s\S]*?)</footer>',s,re.I)
    if foot:
        footers+=1
        for level in re.findall(r'<h([3456])\b',foot.group(1),re.I):
            errors.append(f"{p}: footer navigation uses H{level} (expected H2)")
for e in errors:print('HEADING_ERROR|'+e)
print(f'HEADINGS_PASS|pages={checked}|footers={footers}|errors={len(errors)}',flush=True)
if errors:raise SystemExit(1)
