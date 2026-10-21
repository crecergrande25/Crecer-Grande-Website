#!/usr/bin/env python3
"""Render the 50-guide directory and new articles from the reviewed insight records."""
from pathlib import Path
from bs4 import BeautifulSoup
import copy,json,html,xml.etree.ElementTree as ET
ROOT=Path(__file__).resolve().parents[1]
records=json.loads((ROOT/'assets/data/insights.json').read_text())
media={e['id']:e for e in json.loads((ROOT/'assets/data/photography.json').read_text())['entries']}
labels={'design':'Design & CAD','manufacturing':'Manufacturing','maintenance':'Maintenance','quality':'Quality & Inspection'}
def esc(v):return html.escape(str(v),quote=True)
def picture(id,hero=False,background=False):
 e=media[id];base=e['src'][:-5];srcset=', '.join(f'{base}-{w}.webp {w}w' for w in [480,800,1200])+f', {e["src"]} 1536w'
 return f'<img src="{e["src"]}" srcset="{srcset}" sizes="(max-width:700px) 100vw, {"48" if hero else "33"}vw" width="1536" height="1024" alt="{esc(e["alt"]) if not background else ""}" data-generated-image="{id}" decoding="async" loading="{"eager" if hero else "lazy"}"'+(' fetchpriority="high"' if hero else '')+(' class="cg-insight-backdrop" aria-hidden="true"' if background else '')+'/>'
def tile(a,featured=False):
 return f'<a class="cg-insight-tile {"pr-card" if featured else "pr-article"}" href="{a["href"]}"'+('' if featured else f' data-filter-item="{a["category"]}"')+f'>{picture(a["image"],background=True)}<div class="pr-card-kicker">{esc(labels[a["category"]])}</div><h3>{esc(a["title"])}</h3><p>{esc(a["summary"])}</p><span class="pr-text-link">Read guide →</span></a>'
# Existing long-form guides keep their content. New guides receive a full page and metadata.
base=BeautifulSoup((ROOT/'insights/3d-printing-file-formats.html').read_text(),'html.parser')
contact=BeautifulSoup((ROOT/'contact.html').read_text(),'html.parser')
for a in records:
 if not a.get('new'):continue
 s=copy.deepcopy(base);title=a['title']+' | Crecer Grande';s.title.string=title
 for meta in s.select('meta[name="description"],meta[property="og:description"],meta[name="twitter:description"]'):meta['content']=a['summary']
 for meta in s.select('meta[property="og:title"],meta[name="twitter:title"]'):meta['content']=title
 for meta in s.select('meta[property="og:url"]'):meta['content']='https://crecergrande.in'+a['href']
 for meta in s.select('meta[property="og:image"],meta[name="twitter:image"]'):meta['content']='https://crecergrande.in'+media[a['image']]['src']
 s.select_one('link[rel="canonical"]')['href']='https://crecergrande.in'+a['href']
 for old in s.select('script[type="application/ld+json"]'):old.decompose()
 structured=[{'@context':'https://schema.org','@type':'BreadcrumbList','itemListElement':[{'@type':'ListItem','position':1,'name':'Home','item':'https://crecergrande.in/'},{'@type':'ListItem','position':2,'name':'Insights','item':'https://crecergrande.in/insights.html'},{'@type':'ListItem','position':3,'name':a['title'],'item':'https://crecergrande.in'+a['href']}]},{'@context':'https://schema.org','@type':'TechArticle','headline':a['title'],'description':a['summary'],'image':'https://crecergrande.in'+media[a['image']]['src'],'datePublished':'2026-10-21','dateModified':'2026-10-21','publisher':{'@type':'Organization','name':'Crecer Grande'},'mainEntityOfPage':'https://crecergrande.in'+a['href']}]
 for obj in structured:
  tag=s.new_tag('script',attrs={'type':'application/ld+json'});tag.string=json.dumps(obj);s.head.append(tag)
 hero=f'''<section class="content-hero cg-image-backed-hero cg-foreground-hero cg-layered-hero" data-background-image="{a['image']}" style="--cg-page-hero-bg:url('{media[a['image']]['src'].replace('.webp','-1200.webp')}');"><div class="container cg-foreground-grid"><div class="cg-foreground-copy"><div class="eyebrow">Engineering Insights · {esc(labels[a['category']])}</div><h1>{esc(a['title'])}</h1><p>{esc(a['summary'])}</p><div class="actions"><a class="btn outline" href="/insights.html">All 50 insights →</a></div></div><figure class="cg-hero-foreground">{picture(a['image'],hero=True)}<figcaption class="cg-generated-note">AI-generated illustration</figcaption></figure></div></section>'''
 def bullets(values):return '<ul>'+''.join('<li>'+esc(v)+'</li>' for v in values)+'</ul>'
 article=f'''<section class="section"><article class="container cg-guide-body"><nav aria-label="Breadcrumb" class="cg-guide-toc"><a href="/insights.html">Insights</a><span aria-current="page">{esc(labels[a['category']])}</span></nav><p class="cg-guide-lead">{esc(a['why'])}</p><nav class="cg-guide-toc" aria-label="In this guide"><a href="#checks">Practical checks</a><a href="#mistakes">Common mistakes</a><a href="#inputs">What to collect</a><a href="#decision">The next decision</a></nav><section class="cg-guide-section" id="checks"><h2>Practical checks</h2>{bullets(a['checks'])}<p>Record the finding against the actual part, machine or drawing revision. A useful check identifies both the observation and the conditions under which it was made, so another person can review it.</p></section><section class="cg-guide-section" id="mistakes"><h2>Common mistakes to avoid</h2>{bullets(a['mistakes'])}</section><section class="cg-guide-section" id="inputs"><h2>What to collect before a review</h2>{bullets(a['inputs'])}<p>Send clear original files where available. Mark uncertain dimensions, missing information and the result you need. Separate confirmed requirements from assumptions instead of filling the gaps with guessed specifications.</p></section><section class="cg-guide-section cg-guide-callout" id="decision"><h2>The next decision</h2><p>{esc(a['decision'])}</p></section><section class="cg-guide-section"><h2>Discuss this requirement</h2><p>Crecer Grande can review the information you already have and confirm the feasible scope, evidence needed and commercial next step.</p><a class="btn primary" href="/request-quote.html?requirement={__import__('urllib.parse',fromlist=['quote']).quote(a['title'])}">Send your requirement →</a> <a class="btn outline" href="/insights.html">Browse the library</a></section><p class="cg-media-disclosure">General engineering guidance; equipment instructions and the applicable drawing or specification govern the actual work. Images are AI-generated illustrations.</p></article></section>'''
 main=s.find('main');main.clear();main.append(BeautifulSoup(hero+article,'html.parser'))
 # Use current shared components, including original branding and raster social marks.
 for selector in ['header.site-header','footer.cg-footer']:
  current=s.select_one(selector)
  if current:current.replace_with(copy.deepcopy(contact.select_one(selector)))
 s.body['data-content-updated-at']='2026-10-21T16:57:20Z'
 (ROOT/a['href'].lstrip('/')).write_text(str(s))
# Rebuild the directory, preserving the established hero while replacing all library cards.
p=ROOT/'insights.html';s=BeautifulSoup(p.read_text(),'html.parser')
for section in list(s.select('main > section:not(.cg-foreground-hero)')):section.decompose()
for tag in s.select('.pr-metrics'):tag.decompose()
metrics=BeautifulSoup('<div class="pr-metrics"><div class="pr-metric"><strong>50</strong><span>Practical guides</span></div><div class="pr-metric"><strong>4</strong><span>Topic groups</span></div></div>','html.parser');s.select_one('.pr-hero-copy').append(metrics)
featured=['3d-printing-file-formats','chiller-pump-equivalent-selection','gdt-datum-basics'];by={a['slug']:a for a in records}
featured_html='<section class="pr-section"><div class="pr-container"><div class="pr-section-head"><div><div class="pr-eyebrow">Featured knowledge</div><h2>Useful guides. Clear next steps.</h2></div><p>Start with file preparation, equipment compatibility or drawing requirements.</p></div><div class="pr-feature-grid cg-insight-grid">'+''.join(tile(by[x],True) for x in featured)+'</div></div></section>'
filters='<button type="button" class="pr-filter active" aria-pressed="true" data-filter="all">All insights</button>'+''.join(f'<button type="button" class="pr-filter" aria-pressed="false" data-filter="{key}">{esc(label)}</button>' for key,label in labels.items())
library='<section class="pr-section pr-soft"><div class="pr-container"><div class="pr-section-head"><div><div class="pr-eyebrow">50 articles, guides &amp; checklists</div><h2>Find the answer you need.</h2></div><p>Search a topic or choose a category. Each guide explains what to check, what to avoid and what information to collect.</p></div><div class="pr-filters" data-filter-toolbar role="group" aria-label="Filter articles">'+filters+'</div><div class="cg-library-tools"><label>Search this library<input type="search" data-content-search placeholder="Try bearing, drawing, weld or inspection"/></label><p data-filter-status aria-live="polite" role="status"></p></div><p data-filter-empty hidden>No matching results. Try another topic or clear your search.</p><div class="pr-article-grid cg-insight-grid">'+''.join(tile(a) for a in records)+'</div><p class="cg-media-disclosure">Card images are AI-generated illustrations of engineering subjects, not photographs of completed customer projects.</p></div></section>'
s.main.append(BeautifulSoup(featured_html+library,'html.parser'))
s.title.string='50 Engineering Insights & Practical Guides | Crecer Grande'
for tag in s.select('meta[property="og:title"],meta[name="twitter:title"]'):tag['content']=s.title.string
for tag in s.select('meta[name="description"],meta[property="og:description"],meta[name="twitter:description"]'):tag['content']='Explore 50 practical guides covering CAD, materials, fabrication, maintenance and inspection. Search by topic and prepare a clearer engineering requirement.'
p.write_text(str(s))
# Surface useful knowledge on Home after removing the retired Projects showcase.
p=ROOT/'index.html';s=BeautifulSoup(p.read_text(),'html.parser')
for old in s.select('[data-cg-home-insights]'):old.decompose()
section=BeautifulSoup('<section class="pr-section" data-cg-home-insights><div class="pr-container"><div class="pr-section-head"><div><div class="pr-eyebrow">From the engineering library</div><h2>Check the detail before the next step.</h2></div><a href="/insights.html">Explore all 50 insights →</a></div><div class="pr-feature-grid cg-insight-grid">'+''.join(tile(by[x],True) for x in ['engineering-material-grade-selection','bearing-failure-evidence','first-article-inspection-planning'])+'</div><p class="cg-media-disclosure">AI-generated engineering illustrations.</p></div></section>','html.parser');s.main.append(section);p.write_text(str(s))
# Rebuild searchable article entries; removed downloads and Projects stay absent.
p=ROOT/'assets/data/content-index.json';search=json.loads(p.read_text());search=[x for x in search if not x.get('href','').startswith(('/insights/','/projects')) and '/assets/downloads/' not in x.get('href','')]

for entry in search:
 if entry.get('href')=='/insights.html':entry.update(name='50 Engineering Insights & Practical Guides',desc='Search engineering guides for CAD, manufacturing, maintenance and inspection.')
search.extend(dict(name=a['title'],kind='Guide',desc=a['summary'],href=a['href'],keywords=a['category']+' '+a['slug'].replace('-',' ')) for a in records);p.write_text(json.dumps(search,indent=2)+'\n')
ns='http://www.sitemaps.org/schemas/sitemap/0.9';ET.register_namespace('',ns);p=ROOT/'sitemap.xml';tree=ET.parse(p);top=tree.getroot();urls={x.find('{'+ns+'}loc').text for x in top}
for a in records:
 url='https://crecergrande.in'+a['href']
 if url not in urls:
  node=ET.SubElement(top,'{'+ns+'}url');ET.SubElement(node,'{'+ns+'}loc').text=url;ET.SubElement(node,'{'+ns+'}lastmod').text='2026-10-21'
ET.indent(tree,space='  ');tree.write(p,encoding='utf-8',xml_declaration=True)
print('Rendered 50-card library, 33 new articles, homepage links, search and sitemap')
