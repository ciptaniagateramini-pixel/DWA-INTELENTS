import sys, numpy as np
from collections import deque
from PIL import Image, ImageFilter
im = Image.open(sys.argv[1]).convert('RGB'); a = np.array(im).astype(int)
content = ((a.max(2)-a.min(2)) > 30) | (a.min(2) < 150)
m = Image.fromarray((content*255).astype(np.uint8)).filter(ImageFilter.MedianFilter(9))
m = m.filter(ImageFilter.GaussianBlur(14)).point(lambda v: 255 if v > 40 else 0)
# fill holes: background = 0-pixels connected to border
z = np.array(m) == 0; H, W = z.shape; seen = np.zeros_like(z); q = deque()
for y in range(H):
    for x in (0, W-1):
        if z[y,x] and not seen[y,x]: seen[y,x]=1; q.append((y,x))
for x in range(W):
    for y in (0, H-1):
        if z[y,x] and not seen[y,x]: seen[y,x]=1; q.append((y,x))
while q:
    y,x = q.popleft()
    for yy,xx in ((y+1,x),(y-1,x),(y,x+1),(y,x-1)):
        if 0<=yy<H and 0<=xx<W and z[yy,xx] and not seen[yy,xx]: seen[yy,xx]=1; q.append((yy,xx))
alpha = Image.fromarray(((~seen.astype(bool))*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))
out = im.convert('RGBA'); out.putalpha(alpha); out.crop(alpha.getbbox()).save(sys.argv[2])
