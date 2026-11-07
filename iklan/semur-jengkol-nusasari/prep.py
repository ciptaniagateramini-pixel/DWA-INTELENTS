import sys, numpy as np
from PIL import Image, ImageFilter, ImageDraw
def outline(src, dst, r=16, pad=26):
    im = Image.open(src).convert('RGBA'); w,h = im.size
    big = Image.new('RGBA',(w+2*pad,h+pad),(0,0,0,0)); big.paste(im,(pad,pad))
    a = big.split()[3].point(lambda v:255 if v>8 else 0)
    d = a.filter(ImageFilter.GaussianBlur(r*0.55)).point(lambda v:255 if v>6 else 0).filter(ImageFilter.GaussianBlur(1.6))
    base = Image.new('RGBA',big.size,(255,255,255,0)); base.putalpha(d)
    base.alpha_composite(big); base.save(dst)
def clean(src, dst):
    im = Image.open(src).convert('RGB'); arr = np.array(im).astype(int)
    neutral = ((arr.max(2)-arr.min(2))<16)&(arr.min(2)>188)
    from collections import deque
    H,W = neutral.shape; seen = np.zeros_like(neutral); q = deque()
    for y in range(H):
        for x in (0,W-1):
            if neutral[y,x] and not seen[y,x]: seen[y,x]=1; q.append((y,x))
    for x in range(W):
        for y in (0,H-1):
            if neutral[y,x] and not seen[y,x]: seen[y,x]=1; q.append((y,x))
    while q:
        y,x = q.popleft()
        for yy,xx in ((y+1,x),(y-1,x),(y,x+1),(y,x-1)):
            if 0<=yy<H and 0<=xx<W and neutral[yy,xx] and not seen[yy,xx]:
                seen[yy,xx]=1; q.append((yy,xx))
    bg = seen.astype(np.uint8)*255
    bg = np.array(Image.fromarray(bg).filter(ImageFilter.MaxFilter(3)))
    alpha = Image.fromarray(255-bg).filter(ImageFilter.GaussianBlur(1.0))
    out = im.convert('RGBA'); out.putalpha(alpha)
    bbox = alpha.point(lambda v:255 if v>128 else 0).getbbox(); out.crop(bbox).save(dst)
{'outline':outline,'clean':clean}[sys.argv[1]](sys.argv[2], sys.argv[3])
