#!/usr/bin/env python3
"""Correct remaining legacy footer and floating-help headings."""
from pathlib import Path
import re
root=Path(__file__).resolve().parents[1]
changed=[]
for p in sorted(root.rglob('*.html')):
    rel=p.relative_to(root).as_posix()
    if rel.startswith('admin/'):continue
    raw=p.read_text(encoding='utf8',errors='replace')
    if re.search(r'<meta\b[^>]*http-equiv=["\x27]refresh',raw,re.I):continue
    def footer(m):
        tag=m.group(0)
        return re.sub(r'<h([3456])(\s[^>]*)?>([\s\S]*?)</h\1>',lambda h:'<h2 class="cg-footer-heading">'+h.group(3)+'</h2>',tag,flags=re.I)
    s=re.sub(r'<footer\b[^>]*>[\s\S]*?</footer>',footer,raw,flags=re.I)
    s=re.sub(r'(<div\b[^>]*class=["\x27][^"\x27]*\bask-panel\b[^"\x27]*["\x27][^>]*>)\s*<h3>([^<]+)</h3>',
        lambda m:m.group(1)+'<h2 class="cg-ask-heading">'+m.group(2)+'</h2>',s,flags=re.I)
    if s!=raw:
        p.write_text(s,encoding='utf8')
        changed.append(rel)
        print('LEGACY_HEADING|'+rel)
style=root/'assets/css/site.css'
s=style.read_text(encoding='utf8')
assert '.footer h4{' in s and '.ask-panel h3{' in s
s=s.replace('.footer h4{margin:0 0 12px;color:#fff}',
            '.footer :is(h4,h2.cg-footer-heading){margin:0 0 12px;color:#fff;font-size:1em;font-weight:700}')
s=s.replace('.ask-panel h3{margin:0 0 3px}',
            '.ask-panel :is(h3,h2.cg-ask-heading){margin:0 0 3px;font-size:1.17em;font-weight:700}')
style.write_text(s,encoding='utf8')
print('LEGACY_HEADING_SUMMARY|pages='+str(len(changed)))
