"""Portfolio Beezam v2: varied backgrounds & compositions using new photo assets."""
import base64, math, os, sys
D = os.path.dirname(os.path.abspath(__file__))
def b64(f): return base64.b64encode(open(os.path.join(D, f), 'rb').read()).decode()
from PIL import Image
def size(f): return Image.open(os.path.join(D, f)).size

HEAD = '''<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=1080">
<meta name="hz:slide-selector" content=".slide"><title>{title}</title>
<link rel="stylesheet" href="https://use.typekit.net/iev1bgo.css"><link rel="stylesheet" href="https://use.typekit.net/ibn3qmg.css">
<style>*{{margin:0;padding:0;box-sizing:border-box}}body{{background:{bg}}}
.slide{{position:relative;width:1080px;height:1350px;overflow:hidden;background:{bg};font-family:"poppins",sans-serif;color:#2B1A04}}
.abs{{position:absolute}}
.fun{{font-family:"dynapuff",sans-serif;font-weight:700}}
.q{{font-family:"quicksand",sans-serif;font-weight:700}}
.lbl{{font-weight:600;font-size:26px;letter-spacing:12px}}
.pill{{text-align:center;font-family:"dynapuff",sans-serif;font-weight:500;font-size:30px;padding:14px 30px;border-radius:40px}}
.card{{font-family:"quicksand",sans-serif;font-weight:700;font-size:24px;line-height:1.3;background:#FFFFFF;color:#2B1A04;padding:14px 20px;border-radius:18px}}
.card span{{display:block;font-family:"dynapuff",sans-serif;font-weight:700;font-size:34px;color:#C27A00}}
</style></head><body><div class="slide" data-canvas-width="1080" data-canvas-height="1350">'''
TAIL = '</div></body></html>'

def P(pts): return ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)
def hexp(x, y, r, rot=30): return P([(x + r * math.cos(math.radians(60 * i + rot)), y + r * math.sin(math.radians(60 * i + rot))) for i in range(6)])
def comb(stroke, op, r=70, sw=3):
    w = math.sqrt(3) * r; cells = []
    for row in range(-1, 14):
        for col in range(-1, 10):
            cells.append(f'<polygon points="{hexp(col * w + (row % 2) * w / 2, row * 1.5 * r, r - 4)}"/>')
    return f'<g fill="none" stroke="{stroke}" stroke-opacity="{op}" stroke-width="{sw}">' + ''.join(cells) + '</g>'
def svg(inner, defs=''):
    return f'<svg class="abs" style="left:0;top:0" width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg"><defs>{defs}</defs>{inner}</svg>'
def img(f, left, top, w=None, h=None, extra='', alt='Produk madu Beezam'):
    W, H = size(f)
    if w and not h: h = round(H * w / W)
    if h and not w: w = round(W * h / H)
    return f'<img class="abs" src="data:image/png;base64,{b64(f)}" style="left:{left}px;top:{top}px;width:{w}px;height:{h}px{extra}" alt="{alt}">'
def div(cls, css, html): return f'<div class="abs {cls}" style="{css}">{html}</div>'
GLOW = lambda id_, c, o: f'<radialGradient id="{id_}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="{c}" stop-opacity="{o}"/><stop offset="1" stop-color="{c}" stop-opacity="0"/></radialGradient>'
SHADOW = GLOW('sh', '#3A2000', 0.45)

T = {}

def t1_swirl():  # dark hero
    bg = '#24160A'
    s = svg(f'<rect width="1080" height="1350" fill="url(#bgd)"/>{comb("#F2B400", 0.08)}<ellipse cx="540" cy="860" rx="520" ry="520" fill="url(#gl)"/>',
            '<linearGradient id="bgd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3A230C"/><stop offset="1" stop-color="#140B03"/></linearGradient>' + GLOW('gl', '#F59E0B', 0.55))
    body = (s + img('a2/swirl.png', 99, 300, w=882)
            + div('lbl', 'left:0;top:84px;width:1080px;text-align:center;color:#F2C24B', 'BEEZAM')
            + div('', 'left:0;top:128px;width:1080px;text-align:center;font-weight:800;font-size:100px;line-height:1.02;color:#FFFFFF', 'Madu Hutan Asli')
            + div('q', 'left:0;top:248px;width:1080px;text-align:center;font-size:32px;color:#F7D98B', 'Manisnya pas, warnanya keemasan')
            + div('pill', 'left:340px;top:1262px;width:400px;background:#FFC82E;color:#24160A', '100% madu asli'))
    return 'Beezam - Hero Swirl', bg, body
T['t1_swirl'] = t1_swirl

def t2_hands():  # yellow, hands tearing sachet
    bg = '#FFC82E'
    s = svg(f'<rect width="1080" height="1350" fill="url(#by)"/>{comb("#FFFFFF", 0.28)}<ellipse cx="540" cy="760" rx="460" ry="380" fill="url(#gw)"/>',
            '<linearGradient id="by" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD54A"/><stop offset="1" stop-color="#F5B000"/></linearGradient>' + GLOW('gw', '#FFFFFF', 0.6))
    body = (s + img('a2/hands.png', 80, 350, w=920)
            + div('lbl', 'left:70px;top:84px;color:#7A4A00', 'BEEZAM')
            + div('fun', 'left:66px;top:126px;width:960px;font-size:118px;line-height:1.0;color:#2B1A04', 'Sobek,')
            + div('fun', 'left:66px;top:244px;width:960px;font-size:84px;line-height:1.0;color:#FFFFFF', 'langsung nikmat!')
            + div('pill', 'left:70px;top:1262px;background:#2B1A04;color:#FFFFFF', 'Sachet praktis'))
    return 'Beezam - Sobek', bg, body
T['t2_hands'] = t2_hands

def t4_flat():  # white flatlay
    bg = '#FFFDF7'
    s = svg(f'{comb("#F2B400", 0.14)}<ellipse cx="560" cy="760" rx="560" ry="260" fill="url(#gy)"/>', GLOW('gy', '#FFD54A', 0.45))
    body = (s + img('a2/flat.png', -10, 480, w=1100, extra=';transform:rotate(-8deg)')
            + div('lbl', 'left:0;top:84px;width:1080px;text-align:center;color:#C27A00', 'BEEZAM')
            + div('fun', 'left:0;top:130px;width:1080px;text-align:center;font-size:104px;line-height:1.02;color:#2B1A04', 'Setetes pun')
            + div('fun', 'left:0;top:236px;width:1080px;text-align:center;font-size:104px;line-height:1.02;color:#E89A00', 'berharga.')
            + div('q', 'left:140px;top:1110px;width:800px;text-align:center;font-size:34px;line-height:1.35;color:#5A3A0A', 'Madu hutan asli, cocok untuk teh, roti, dan camilan favoritmu')
            + div('pill', 'left:340px;top:1262px;width:400px;background:#2B1A04;color:#FFFFFF', 'Madu Hutan Asli'))
    return 'Beezam - Setetes', bg, body
T['t4_flat'] = t4_flat

def t5_girl():  # amber, girl with sachet
    bg = '#F29F05'
    s = svg(f'<rect width="1080" height="1350" fill="url(#ba)"/><circle cx="740" cy="760" r="430" fill="#FFD54A" opacity="0.55"/><polygon points="{hexp(140, 1120, 70)}" fill="none" stroke="#FFFFFF" stroke-width="5" opacity=".6"/><polygon points="{hexp(230, 1190, 40)}" fill="#FFFFFF" opacity=".5"/>',
            '<linearGradient id="ba" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFB627"/><stop offset="1" stop-color="#E07B00"/></linearGradient>')
    body = (s + img('a2/girl1.png', 380, 160, h=1190, alt='Anak memegang sachet madu Beezam')
            + div('lbl', 'left:70px;top:84px;color:#FFF4D2', 'BEEZAM')
            + div('fun', 'left:66px;top:150px;width:460px;font-size:108px;line-height:1.0;color:#FFFFFF', 'Teman bekal')
            + div('fun', 'left:66px;top:376px;width:460px;font-size:108px;line-height:1.0;color:#2B1A04', 'si kecil!')
            + div('q', 'left:70px;top:620px;width:380px;font-size:32px;line-height:1.35;color:#FFFFFF', 'Sachet mungil, muat di kotak bekal & tas sekolah.')
            + div('pill', 'left:70px;top:1262px;background:#2B1A04;color:#FFFFFF', 'Tinggal sobek'))
    return 'Beezam - Bekal', bg, body
T['t5_girl'] = t5_girl

def t7_typo():  # dark brown typography
    bg = '#2B1A04'
    s = svg(f'{comb("#F2B400", 0.1)}<ellipse cx="840" cy="1120" rx="300" ry="220" fill="url(#g)"/>', GLOW('g', '#F59E0B', 0.5))
    body = (s + img('sachet.png', 690, 880, h=420, alt='Box dan sachet madu Beezam')
            + div('lbl', 'left:70px;top:84px;color:#F2C24B', 'BEEZAM')
            + div('fun', 'left:66px;top:150px;width:960px;font-size:150px;line-height:0.98;color:#FFFFFF', 'Manisnya<br>pas,')
            + div('fun', 'left:66px;top:460px;width:640px;font-size:112px;line-height:1.0;color:#FFC82E', 'nggak bikin eneg.')
            + div('q', 'left:70px;top:1010px;width:560px;font-size:32px;line-height:1.35;color:#F7D98B', 'Rasanya enak, mau dinikmati langsung atau dicampur.')
            + div('pill', 'left:70px;top:1262px;background:#FFC82E;color:#2B1A04', 'Madu Hutan Asli'))
    return 'Beezam - Typo', bg, body
T['t7_typo'] = t7_typo

def t8_family():  # split cream/yellow, girl with products
    bg = '#FFF6DE'
    s = svg(f'<rect x="0" y="0" width="1080" height="1350" fill="#FFF6DE"/><path d="M0,760 C300,690 760,830 1080,720 L1080,1350 L0,1350 Z" fill="#FFC82E"/>{comb("#F2B400", 0.12)}'
            f'<polygon points="{hexp(120, 420, 46)}" fill="none" stroke="#E2A600" stroke-width="5"/><polygon points="{hexp(960, 470, 34)}" fill="#FFD54A"/>')
    body = (s + img('a2/girl2.png', 190, 300, h=1050, alt='Anak dengan box, sachet, dan botol madu Beezam')
            + div('lbl', 'left:0;top:84px;width:1080px;text-align:center;color:#C27A00', 'BEEZAM')
            + div('fun', 'left:0;top:128px;width:1080px;text-align:center;font-size:92px;line-height:1.05;color:#2B1A04', 'Botol atau Sachet?')
            + div('q', 'left:0;top:236px;width:1080px;text-align:center;font-size:32px;color:#5A3A0A', 'Dua kemasan, satu rasa madu hutan asli')
            + div('card', 'left:70px;top:1050px;width:230px;text-align:center', '<span>Botol</span>Stok di rumah')
            + div('card', 'left:780px;top:1050px;width:230px;text-align:center', '<span>Sachet</span>Bawa ke mana aja'))
    return 'Beezam - Botol atau Sachet', bg, body
T['t8_family'] = t8_family

def t9_order():  # yellow CTA
    bg = '#FFC82E'
    steps = [('1', 'Pilih kemasan'), ('2', 'DM Instagram'), ('3', 'Pesanan diproses')]
    cards = ''.join(div('card', f'left:{70 + i * 320}px;top:330px;width:290px;text-align:center', f'<span>{n}</span>{t}') for i, (n, t) in enumerate(steps))
    s = svg(f'{comb("#FFFFFF", 0.3)}<ellipse cx="540" cy="900" rx="460" ry="360" fill="url(#gw)"/><ellipse cx="560" cy="1190" rx="380" ry="40" fill="url(#sh)"/>', GLOW('gw', '#FFFFFF', 0.65) + SHADOW)
    body = (s + img('jar.png', 250, 560, h=640) + img('sachet.png', 560, 690, h=510, extra=';transform:rotate(6deg)')
            + div('lbl', 'left:0;top:84px;width:1080px;text-align:center;color:#7A4A00', 'BEEZAM') + cards
            + div('fun', 'left:0;top:128px;width:1080px;text-align:center;font-size:110px;line-height:1.05;color:#2B1A04', 'Yuk, Order!')
            + div('pill', 'left:240px;top:1262px;width:600px;background:#2B1A04;color:#FFFFFF', 'DM Instagram: beezam honey'))
    return 'Beezam - Order', bg, body
T['t9_order'] = t9_order

if __name__ == '__main__':
    out = sys.argv[1]
    for k, f in T.items():
        title, bg, body = f()
        open(os.path.join(out, k + '.html'), 'w').write(HEAD.format(title=title, bg=bg) + body + TAIL)
        print(k)
