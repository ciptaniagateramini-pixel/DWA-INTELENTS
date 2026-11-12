#!/usr/bin/env python3
"""Buat feed IG Beezam (gaya kunci v4 "studio foto produk") dari file JSON.

  python3 build_feed.py contoh.json -o hasil.html [--png hasil.png]

JSON berisi teks dan foto produk (PNG transparan). Lihat examples/madu-hutan-asli.json.
"""
import argparse, base64, html, io, json, os, re, subprocess, sys

from PIL import Image, ImageOps
import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
BOX_W, BOX_H = 380, 650          # kotak maksimal foto produk
CX, BASE_Y = 540, 1022           # titik tengah & dasar produk (permukaan atas podium)
REFLECT_H = 70                   # tinggi pantulan di permukaan podium


def b64png(im):
    buf = io.BytesIO(); im.save(buf, 'PNG', optimize=True); return base64.b64encode(buf.getvalue()).decode()


def prep_product(path):
    im = Image.open(path).convert('RGBA')
    bbox = im.split()[3].point(lambda v: 255 if v > 10 else 0).getbbox()
    if not bbox:
        sys.exit('Foto produk tidak punya transparansi. Hapus background dulu (PNG transparan).')
    im = im.crop(bbox)
    s = min(BOX_W / im.width, BOX_H / im.height)
    w, h = round(im.width * s), round(im.height * s)
    big = im.resize((w * 2, h * 2), Image.LANCZOS)   # simpan 2x supaya tajam di Express
    ref = ImageOps.flip(big)
    rh = min(ref.height, REFLECT_H * 2)
    a = np.array(ref.crop((0, 0, ref.width, rh))).astype(float)
    a[:, :, 3] *= (np.linspace(1.4, 0, rh).clip(0, 1) ** 1.6 * 0.32)[:, None]
    ref = Image.fromarray(a.clip(0, 255).astype('uint8'), 'RGBA')
    return big, ref, w, h


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('spec'); ap.add_argument('-o', '--out', required=True); ap.add_argument('--png')
    a = ap.parse_args()
    spec = json.load(open(a.spec, encoding='utf-8'))
    base = os.path.dirname(os.path.abspath(a.spec))
    prod, ref, w, h = prep_product(os.path.join(base, spec['product_image']))
    t = open(os.path.join(HERE, 'assets', 'template.html'), encoding='utf-8').read()
    e = lambda k: html.escape(spec[k])
    # SUB: teks biasa, bagian di dalam *...* jadi tebal (satu kotak teks di Express tetap utuh)
    sub = re.sub(r'\*(.+?)\*', r'<b>\1</b>', html.escape(spec['sub']))
    vals = {'BRAND': e('brand'), 'TITLE': e('title'), 'SUB_HTML': sub,
            'TAG_L_BIG': e('tag_left_big'), 'TAG_L_SMALL': e('tag_left_small'),
            'TAG_R_BIG': e('tag_right_big'), 'TAG_R_SMALL': e('tag_right_small'),
            'PILL': e('pill'), 'DOC_TITLE': e('doc_title'), 'PRODUCT_ALT': e('product_alt'),
            'PRODUCT_B64': b64png(prod), 'REFLECT_B64': b64png(ref)}
    for k, v in vals.items():
        t = t.replace('{{%s}}' % k, v)
    left, top = CX - w // 2, BASE_Y - h
    t = t.replace('style="left:350px;top:372px;width:380px;height:650px"',
                  f'style="left:{left}px;top:{top}px;width:{w}px;height:{h}px"')
    t = t.replace('style="left:350px;top:1018px;width:380px;height:70px"',
                  f'style="left:{left}px;top:{BASE_Y - 4}px;width:{w}px;height:{REFLECT_H}px"')
    assert '{{' not in t, 'placeholder belum terisi'
    open(a.out, 'w', encoding='utf-8').write(t)
    print('HTML:', a.out, f'({os.path.getsize(a.out)//1024} KB)')
    if a.png:
        font = os.path.join(HERE, 'assets', 'Poppins-Bold.ttf')
        prev = a.out + '.preview.html'
        open(prev, 'w', encoding='utf-8').write(t.replace('<style>', '<style>@font-face{font-family:"poppins";src:url("file://%s");font-weight:100 900}' % font, 1))
        js = ("const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();"
              "const p=await b.newPage({viewport:{width:1080,height:1350}});await p.goto('file://%s');"
              "await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(300);"
              "await p.screenshot({path:'%s'});await b.close()})()") % (os.path.abspath(prev), os.path.abspath(a.png))
        subprocess.check_call(['node', '-e', js]); os.remove(prev)
        print('Preview:', a.png)


if __name__ == '__main__':
    main()
