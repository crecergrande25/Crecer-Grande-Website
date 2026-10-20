#!/usr/bin/env python3
"""Remove verified unreadable, undersized and visibly soft legacy site images.

Run on an isolated branch. Updates image URLs before deleting binaries.
Never rewrites Git history; historical Git blobs require a separate operation.
"""
from pathlib import Path
from PIL import Image
import re
import subprocess

ROOT = Path(__file__).resolve().parents[1]
PREFIX = "assets/images/"
# Replacement targets were checked against the 2026-10-20 visual contact sheets.
# Newer v23 images are preferred over old soft/yellow-corner artwork.
REPLACEMENTS = {
    # 19 assets that Pillow could not decode
    "advanced-manufacturing-scope-unique.webp": "div-manufacturing-v23.webp",
    "catalog/chiller-spares/chiller-pump-other.webp": "chiller-components.webp",
    "catalog/cnc-vmc/cnc-coolant-pump.webp": "prod-cnc-v23.webp",
    "catalog/co2/co2-controller.webp": "div-automation-v23.webp",
    "catalog/co2/co2-head-nozzle.webp": "laser-components.webp",
    "catalog/co2/co2-laser-tube.webp": "laser-components.webp",
    "catalog/co2/co2-mirror.webp": "laser-components.webp",
    "catalog/co2/co2-psu.webp": "laser-components.webp",
    "catalog/cutting-heads/boci-cutting-head.webp": "laser-components.webp",
    "catalog/cutting-heads/precitec-procutter-2.webp": "div-manufacturing-v23.webp",
    "catalog/press-brake/pb-accessories.webp": "prod-bending-v23.webp",
    "cg-advanced-manufacturing.webp": "div-manufacturing-v23.webp",
    "cnc/cnc-bearings-generated.webp": "prod-cnc-v23.webp",
    "contact-hero-crecer-grande-clear.webp": "hero-engineering.webp",
    "contact-hero-crecer-grande.jpg": "design.webp",
    "home-v5/advanced-manufacturing.webp": "div-manufacturing-v23.webp",
    "laser-consumables/protective-window-249-15.webp": "laser-components.webp",
    "laser-consumables-sprite.webp": "laser-components.webp",
    "part6-tooling-sprite.webp": "prod-bending-v23.webp",
    # Badly undersized thumbnails, distorted/soft product art and dated banners
    "catalog/chiller-spares/chiller-condenser.webp": "prod-chiller-spares-v23.webp",
    "catalog/chiller-spares/chiller-controller.webp": "prod-chiller-spares-v23.webp",
    "catalog/chiller-spares/chiller-fan.webp": "prod-chiller-spares-v23.webp",
    "catalog/chiller-spares/chiller-hose-fitting.webp": "prod-chiller-spares-v23.webp",
    "catalog/chiller-spares/temperature-sensor.webp": "prod-chiller-spares-v23.webp",
    "catalog/chillers/hanli-fiber-chiller.webp": "chiller.webp",
    "catalog/co2/co2-motion.webp": "laser-components.webp",
    "catalog/co2/znse-focus-lens.webp": "laser-components.webp",
    "catalog/cutting-heads/wsx-cutting-head.webp": "laser-components.webp",
    "home-v5/engineering-design.webp": "design.webp",
    "home-v5/industrial-automation.webp": "div-automation-v23.webp",
    "home-v5/machine-maintenance.webp": "maintenance.webp",
    "laser-consumables/generated-height-sensor.webp": "prod-laser-v23.webp",
    "laser-consumables/protective-windows-other.webp": "laser-components.webp",
    # Older hazy or washed-out illustrations: use the corresponding clearer 2026 artwork
    "div-engineering.webp": "div-engineering-v23.webp",
    "div-maintenance.webp": "div-maintenance-v23.webp",
    "div-manufacturing.webp": "div-manufacturing-v23.webp",
    "div-products.webp": "div-products-v23.webp",
    "div-tender-v22.webp": "div-tender-v23.webp",
    "process-cad.webp": "process-cad-v23.webp",
    "process-drawing.webp": "process-drawing-v23.webp",
    "process-maintain.webp": "process-maintain-v23.webp",
    "process-make.webp": "process-make-v23.webp",
    "process-supply.webp": "process-supply-v23.webp",
    "process-validate.webp": "process-validate-v23.webp",
    "process-verify.webp": "process-verify-v23.webp",
    "prod-3d.webp": "prod-3d-v23.webp",
    "prod-automation-v22.webp": "div-automation-v23.webp",
    "prod-bending.webp": "prod-bending-v23.webp",
    "prod-chiller.webp": "prod-chiller-v23.webp",
    "prod-cnc.webp": "prod-cnc-v23.webp",
    "prod-laser.webp": "prod-laser-v23.webp",
    "prod-pump.webp": "prod-pump-v23.webp",
    "prod-spares.webp": "prod-spares-v23.webp",
    "project-chiller.webp": "project-chiller-v23.webp",
    "project-co2-v22.webp": "project-co2-v23.webp",
    "project-qr.webp": "project-qr-v23.webp",
    "project-reverse.webp": "process-cad-v23b.webp",
    "project-spares.webp": "prod-spares-v23.webp",
    "service-3d-printing.webp": "prod-3d-v23.webp",
    "service-laser-marking.webp": "prod-laser-v23.webp",
    "service-machine-spares.webp": "prod-spares-v23.webp",
    "service-maintenance.webp": "div-maintenance-v23.webp",
    "service-reverse-engineering.webp": "process-cad-v23b.webp"
}
# Ensure every removed item has a verified decodable, higher-quality replacement.
sizes = {}
for old,new in REPLACEMENTS.items():
    source = ROOT / PREFIX / old
    target = ROOT / PREFIX / new
    if not source.is_file() or not target.is_file():
        raise RuntimeError(f"Missing image mapping: {old} -> {new}")
    if old == new or new in REPLACEMENTS:
        raise RuntimeError(f"Invalid replacement chain: {old} -> {new}")
    with Image.open(target) as img:
        img.load()
        sizes[new] = img.size

# Remove the old client-side IMAGE_UPGRADES system: it replaced new sharp images
# with older images after load and can obscure outdated references in HTML.
site_js=ROOT/"assets/js/site.js"
site=site_js.read_text(encoding="utf-8")
a=site.find("const IMAGE_UPGRADES = {")
b=site.find("function applyServiceFirstArt(){",a)
if a<0 or b<0: raise RuntimeError("Site.js image-upgrade section changed")
site=site[:a]+"// Page markup now references validated image assets directly.\n  "+site[b:]
site=site.replace("    upgradeRepositoryImages();\n","")
site_js.write_text(site,encoding="utf-8")

extensions={".html",".css",".js",".json",".xml",".md",".svg",".webmanifest"}
changed=[]
for path in ROOT.rglob("*"):
    if not path.is_file() or path.suffix.lower() not in extensions: continue
    rel=path.relative_to(ROOT).as_posix()
    if rel.startswith(".git/") or rel.startswith("scripts/") or rel.startswith(".github/"): continue
    content=path.read_text(encoding="utf-8", errors="replace")
    original=content
    for old,new in REPLACEMENTS.items():
        content=content.replace(PREFIX+old,PREFIX+new)
    # Fix the declared natural dimensions after substituting an image asset,
    # avoiding stretching thumbnails in cards with width/height HTML attributes.
    if path.suffix.lower()==".html":
        def dimensions(m):
            tag=m.group(0)
            if "<img" not in tag.lower(): return tag
            for new,(w,h) in sizes.items():
                if PREFIX+new not in tag:continue
                tag=re.sub(r'(?<![\w-])width=["\x27]\d+["\x27]',f'width="{w}"',tag)
                tag=re.sub(r'(?<![\w-])height=["\x27]\d+["\x27]',f'height="{h}"',tag)
                break
            return tag
        content=re.sub(r'<img\b[^>]*>',dimensions,content,flags=re.I)
    if content!=original:
        path.write_text(content,encoding="utf-8")
        changed.append(rel)

for old in REPLACEMENTS:
    path=ROOT/PREFIX/old
    path.unlink()
    print("REMOVED|"+PREFIX+old+"|"+PREFIX+REPLACEMENTS[old])

# No references to deleted names may remain in page/content source.
for path in ROOT.rglob("*"):
    if not path.is_file() or path.suffix.lower() not in extensions: continue
    rel=path.relative_to(ROOT).as_posix()
    if rel.startswith(".git/") or rel.startswith("scripts/") or rel.startswith(".github/"): continue
    body=path.read_text(encoding="utf-8",errors="replace")
    bad=[old for old in REPLACEMENTS if PREFIX+old in body]
    if bad: raise RuntimeError(f"Stale removed image references in {rel}: {bad}")

print(f"CLEANUP|removed={len(REPLACEMENTS)}|rewritten_source_files={len(changed)}")
print("CHANGED_SOURCES|"+",".join(changed))
