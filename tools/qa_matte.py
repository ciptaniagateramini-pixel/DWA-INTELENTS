"""Matte QA sheet: cutout on dark + light backgrounds, plus 200% crops of edges."""
import sys
from pathlib import Path
from PIL import Image

src, out = Path(sys.argv[1]), Path(sys.argv[2])
im = Image.open(src).convert("RGBA")
w, h = im.size
thumb = im.resize((w * 600 // h, 600))
tiles = []
for bg in [(10, 18, 48), (255, 201, 40), (245, 245, 245)]:
    t = Image.new("RGBA", thumb.size, bg + (255,)); t.alpha_composite(thumb); tiles.append(t)
# 200% crops: hair top-left and hand/phone region, on dark navy
bbox = im.getbbox()
crops = []
for cx, cy in [(bbox[0] + 120, bbox[1] + 120), ((bbox[0] + bbox[2]) // 2, bbox[1] + 40), (bbox[2] - 160, h // 2)]:
    c = im.crop((cx - 150, cy - 150, cx + 150, cy + 150)).resize((600, 600), Image.NEAREST)
    t = Image.new("RGBA", c.size, (10, 18, 48, 255)); t.alpha_composite(c); crops.append(t)
W = sum(t.width for t in tiles) + 600 * len(crops)
sheet = Image.new("RGB", (W, 600), "black")
x = 0
for t in tiles + crops:
    sheet.paste(t.convert("RGB"), (x, 0)); x += t.width
sheet.save(out, quality=85)
