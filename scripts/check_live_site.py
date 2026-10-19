#!/usr/bin/env python3
"""Read-only smoke tests against the production website after deployment."""
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError
from urllib.parse import urlparse
import time
import sys

BASE = "https://crecergrande.in"
PAGES = {
    "/": ["Send a Requirement", "Design, drafting"],
    "/about.html": ["Five divisions connected by one Engineering Desk", "04 · Automation Solutions"],
    "/services.html": ["Engineering Capabilities & Industrial Services", "Industrial Automation"],
    "/divisions/automation-solutions.html": ["Industrial automation and PLC support", "PLC and HMI assessment"],
    "/contact.html": ["Please provide at least one contact method", 'id="rfq-form"'],
    "/request-quote.html": ["Submit Requirement", 'id="rfq-form"'],
    "/assets/js/contact.js": ["Some reference files may not have been attached", "Please provide a phone number or email address"],
    "/robots.txt": ["Sitemap: https://crecergrande.in/sitemap.xml"],
    "/sitemap.xml": ["https://crecergrande.in/divisions/automation-solutions.html"]
}

def fetch(path):
    url = BASE + path
    req = Request(url, headers={"User-Agent": "CrecerGrande-QA/1.0"})
    with urlopen(req, timeout=20) as response:
        if response.status != 200:
            raise RuntimeError(f"{url} returned HTTP {response.status}")
        if urlparse(response.geturl()).netloc not in {"crecergrande.in", "www.crecergrande.in"}:
            raise RuntimeError(f"{url} unexpectedly redirected to {response.geturl()}")
        return response.read().decode("utf-8", errors="replace")

failed = []
for path, expected in PAGES.items():
    result = None
    for attempt in range(12 if path == "/" else 2):
        try:
            html = fetch(path)
            missing = [v for v in expected if v not in html]
            if missing:
                raise RuntimeError(f"missing release content: {missing}")
            if path == "/sitemap.xml" and "<loc>https://crecergrande.in/industrial-automation-kolkata.html</loc>" in html:
                raise RuntimeError("obsolete redirect still in sitemap")
            result = None
            break
        except Exception as exc:
            result = str(exc)
            if path == "/" and attempt < 11:
                print(f"Waiting for live release: {result}", flush=True)
                time.sleep(10)
            elif attempt == 0:
                time.sleep(3)
    if result:
        failed.append((path, result))
        print(f"FAIL {path}: {result}")
    else:
        print(f"PASS {path}")

if failed:
    print(f"Production smoke test FAILED: {len(failed)} route(s)")
    sys.exit(1)
print(f"Production smoke test PASSED: {len(PAGES)} routes")
