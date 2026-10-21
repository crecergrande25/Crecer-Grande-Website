#!/usr/bin/env python3
"""Promote heading hierarchy semantically; preserve visual sizes and layout."""
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
converted=0
pages=0
for file in sorted(ROOT.rglob('*.html')):
    path=file.relative_to(ROOT).as_posix()
    content=file.read_text(encoding="utf-8")
    if re.search(r'<meta\b[^>]*http-equiv=["\x27]refresh',content,re.I):
        continue
    before=content
    if path=='estimate.html':
        def promote(m):
            global converted
            converted+=1
            return '<h2 class="cg-estimate-tool-title">'+m.group(1)+'</h2>'
        content=re.sub(r'<h3>([^<]*(?:&amp;)?[^<]*)</h3>',promote,content)
        if 'cg-estimate-tool-title' not in content:raise RuntimeError("Estimate card titles not found")
    if path=="admin/index.html":
        if '<h2>Administrator sign in</h2>' not in content:raise RuntimeError("Admin login title changed")
        content=content.replace('<h2>Administrator sign in</h2>','<h1 class="cg-admin-login-heading">Administrator sign in</h1>')
    elif path=="admin/reset-password.html":
        if '<div class="login"><form' not in content or '</form></div><script>' not in content:
            raise RuntimeError("Password-reset form markup changed")
        content=content.replace('<div class="login"><form','<main class="login"><form',1)
        content=content.replace('</form></div><script>','</form></main><script>',1)
    else:
        # Footer links are navigation categories directly under a landmark;
        # their titles should be H2, not H4 (which skips page heading levels).
        def fix_footer(m):
            global converted
            footer=m.group(0)
            h4=re.findall(r'<h4(?:\s[^>]*)?>',footer,re.I)
            for tag in h4:
                footer=footer.replace(tag,'<h2 class="cg-footer-heading">')
            footer=footer.replace('</h4>','</h2>')
            converted+=len(h4)
            return footer
        content=re.sub(r'<footer\b[^>]*class=["\x27][^"\x27]*cg-footer[^"\x27]*["\x27][^>]*>[\s\S]*?</footer>',fix_footer,content,flags=re.I)
    if content!=before:
        file.write_text(content,encoding="utf-8")
        pages+=1
        print('REPAIRED|'+path)
# Shared nav/footer are built again in site.js on some routes.
js=ROOT/"assets/js/site.js"
old=js.read_text(encoding="utf8")
new=old.replace('<h4>Service Routes</h4>','<h2 class=cg-footer-heading>Service Routes</h2>')
new=new.replace('<h4>Company</h4>','<h2 class=cg-footer-heading>Company</h2>')
new=new.replace('<h4>Contact Us</h4>','<h2 class=cg-footer-heading>Contact Us</h2>')
new=new.replace('<h3>Botcha !</h3>','<h2 class="cg-botcha-title">Botcha !</h2>')
if new==old:raise RuntimeError("Shared footer / Botcha headings not found")
js.write_text(new,encoding="utf8")
# Extend selectors (without replacing their values) to preserve visual styling.
css=ROOT/"assets/css/site.css"
s=css.read_text(encoding='utf8')
for key,newsel in [
    ('.cg-footer-col h4{','.cg-footer-col :is(h4,h2.cg-footer-heading){'),
    ('.cg-footer-contact h4{','.cg-footer-contact :is(h4,h2.cg-footer-heading){')]:
    if key not in s:raise RuntimeError('Missing site.css selector '+key)
    s=s.replace(key,newsel)
s+='\n/* Heading accessibility: estimate cards remain visually equivalent to former h3 titles. */\nmain .resource-card h2.cg-estimate-tool-title{font-size:1.17em;font-weight:700;margin-block:1em;line-height:normal}\n'
css.write_text(s,encoding='utf8')
botcha=ROOT/"assets/css/botcha.css"
b=botcha.read_text(encoding='utf8')
if '.cg-botcha-head-copy h3{' not in b:raise RuntimeError("Botcha selector missing")
botcha.write_text(b.replace('.cg-botcha-head-copy h3{','.cg-botcha-head-copy h2.cg-botcha-title{'),encoding='utf8')
admin=ROOT/"admin/assets/admin.css"
a=admin.read_text(encoding='utf8')
if '.login-card h2{' not in a:raise RuntimeError("Admin login selector missing")
admin.write_text(a.replace('.login-card h2{','.login-card h2,.login-card h1.cg-admin-login-heading{'),encoding='utf8')
print('HEADING_FIX_SUMMARY|pages='+str(pages)+'|converted='+str(converted))
