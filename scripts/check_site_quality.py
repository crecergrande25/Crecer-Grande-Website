#!/usr/bin/env python3
"""Static checks for key public pages, without third-party dependencies."""
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from urllib.parse import urlparse, unquote

ROOT = Path(__file__).resolve().parents[1]
ISSUES = []

class PageParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.in_title = False
        self.titles = []
        self.h1 = 0
        self.links = []
        self.canonical = []
        self.robots = ""
        self.refresh = False

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "title":
            self.in_title = True
        if tag == "h1":
            self.h1 += 1
        if tag == "a" and attrs.get("href"):
            self.links.append(attrs["href"])
        if tag == "link" and attrs.get("rel") == "canonical":
            self.canonical.append(attrs.get("href", ""))
        if tag == "meta" and attrs.get("name", "").lower() == "robots":
            self.robots = attrs.get("content", "")
        if tag == "meta" and attrs.get("http-equiv", "").lower() == "refresh":
            self.refresh = True

    def handle_endtag(self, tag):
        if tag == "title":
            self.in_title = False

    def handle_data(self, data):
        if self.in_title:
            self.titles.append(data)

pages = {}
for path in ROOT.rglob("*.html"):
    if ".git" in path.parts or "admin" in path.parts:
        continue
    p = PageParser()
    p.feed(path.read_text(encoding="utf-8"))
    pages[path.relative_to(ROOT).as_posix()] = p

for path, p in pages.items():
    if p.refresh or "noindex" in p.robots.lower():
        continue
    if not p.canonical:
        ISSUES.append(f"{path}: missing canonical")
    if p.h1 != 1:
        ISSUES.append(f"{path}: expected one H1, found {p.h1}")
    for url in p.links:
        if url.startswith("/") and not url.startswith("//"):
            target = unquote(urlparse(url).path).lstrip("/") or "index.html"
            if target.endswith("/"):
                target += "index.html"
            if not (ROOT / target).exists():
                ISSUES.append(f"{path}: broken internal link {url}")

tree = ET.parse(ROOT / "sitemap.xml")
ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
for loc in tree.findall(".//s:loc", ns):
    u = urlparse(loc.text or "")
    if u.netloc != "crecergrande.in":
        ISSUES.append(f"sitemap: unexpected host {loc.text}")
        continue
    target = u.path.lstrip("/") or "index.html"
    p = pages.get(target)
    if p is None:
        ISSUES.append(f"sitemap: missing HTML page {target}")
    elif p.refresh or "noindex" in p.robots.lower():
        ISSUES.append(f"sitemap: redirect/noindex URL {target}")

if ISSUES:
    print("\n".join(ISSUES))
    sys.exit(1)
print(f"Checked {len(pages)} HTML pages and sitemap: OK")
