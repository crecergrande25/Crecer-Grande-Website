#!/usr/bin/env python3
"""Produce metadata and review sheets for repository raster assets."""
from pathlib import Path
from PIL import Image, ImageOps, ImageDraw, ImageFont, ImageFilter, ImageStat
from io import BytesIO
import base64
import math

root=Path(__file__).resolve().parents[1]/"assets"/"images"
paths=sorted(p for p in root.rglob("*") if p.suffix.lower() in {".webp",".jpg",".jpeg",".png"})
records=[]
for p in paths:
    try:
        with Image.open(p) as im:
            rgb=im.convert("RGB")
            width,height=im.size
            if min(width,height)>80:
                edge=rgb.convert("L").resize((240,240)).filter(ImageFilter.FIND_EDGES)
                sharp=round(ImageStat.Stat(edge).stddev[0],1)
            else:
                sharp=0
            records.append((str(p.relative_to(root)),width,height,p.stat().st_size,sharp))
    except Exception as exc:
        print("ERROR",p,exc)
for rec in records:
    print("METRIC|"+"|".join(map(str,rec)),flush=True)

font=ImageFont.load_default()
sheet_w=6*205
sheet_h=6*180
for k in range(math.ceil(len(records)/36)):
    sheet=Image.new("RGB",(sheet_w,sheet_h),(249,250,252))
    draw=ImageDraw.Draw(sheet)
    for j,(rel,w,h,size,sharp) in enumerate(records[k*36:(k+1)*36]):
        with Image.open(root/rel) as src:
            im=ImageOps.contain(src.convert("RGB"),(195,138))
            x=(j%6)*205+(205-im.width)//2
            y=(j//6)*180+3+(138-im.height)//2
            sheet.paste(im,(x,y))
            tx=(j%6)*205+5
            ty=(j//6)*180+144
            # Use file name, folder grouping logged in metrics
            short=rel.split("/")[-1]
            if len(short)>30:short=short[:28]+".."
            draw.text((tx,ty),str(k*36+j).zfill(3)+" "+short,fill=(15,22,35),font=font)
            draw.text((tx,ty+14),f"{w}x{h} · {size//1024}KB",fill=(75,75,75),font=font)
    b=BytesIO()
    sheet.save(b,format="JPEG",quality=63,optimize=True)
    encoded=base64.b64encode(b.getvalue()).decode()
    count=math.ceil(len(encoded)/3800)
    for part in range(count):
        print(f"SHEET|{k}|{part}|{count}|"+encoded[part*3800:(part+1)*3800],flush=True)
print(f"COMPLETE|{len(records)}|{math.ceil(len(records)/36)}",flush=True)
