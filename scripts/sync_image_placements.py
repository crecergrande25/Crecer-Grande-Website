#!/usr/bin/env python3
"""Refresh image placement inventory after static page changes."""
from pathlib import Path
from bs4 import BeautifulSoup
import json,csv
root=Path(__file__).resolve().parents[1]
p=root/'assets/data/photography.json';m=json.loads(p.read_text())
m['placements']=[x for x in m['placements'] if x.get('area','').lower().startswith('dynamic')]
for page in sorted(root.rglob('*.html')):
 if any(x in page.relative_to(root).parts for x in ['admin','assets','.git']):continue
 s=BeautifulSoup(page.read_text(),'html.parser');route='/'+page.relative_to(root).as_posix();route='/' if route=='/index.html' else route
 for i in s.select('main img[data-generated-image]'):
  area='Foreground hero' if i.find_parent('figure',class_='cg-hero-foreground') else 'Insight card background' if 'cg-insight-backdrop' in i.get('class',[]) else 'Page content'
  m['placements'].append(dict(page=route,image=i['data-generated-image'],area=area))
 for hero in s.select('.cg-layered-hero'):m['placements'].append(dict(page=route,image=hero['data-background-image'],area='Hero background'))
p.write_text(json.dumps(m,indent=2)+'\n');by={e['id']:e for e in m['entries']}
with (root/'docs/IMAGE_PLACEMENTS.csv').open('w',newline='') as f:
 w=csv.writer(f,lineterminator='\n');w.writerow(['page','image','title','area','src','alt'])
 for x in m['placements']:
  e=by[x['image']];w.writerow([x['page'],x['image'],e['title'],x['area'],e['src'],e['alt']])
print('Registered',len(m['placements']),'image placements')
