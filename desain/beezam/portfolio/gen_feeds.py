"""Generate Beezam portfolio feeds (studio key style v4) as HTML, then PNG via Playwright."""
import base64, math, os, sys
D = os.path.dirname(os.path.abspath(__file__))
b64 = lambda f: base64.b64encode(open(os.path.join(D, f), 'rb').read()).decode()
JAR, SACHET = b64('jar.png'), b64('sachet.png')
JAR_R, SACHET_R = 585 / 1000, 766 / 1057

HEAD = '''<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=1080">
<meta name="hz:slide-selector" content=".slide"><title>{title}</title>
<link rel="stylesheet" href="https://use.typekit.net/iev1bgo.css"><link rel="stylesheet" href="https://use.typekit.net/ibn3qmg.css">
<style>*{{margin:0;padding:0;box-sizing:border-box}}body{{background:#F7EBD0}}
.slide{{position:relative;width:1080px;height:1350px;overflow:hidden;background:#F7EBD0;font-family:"poppins",sans-serif;color:#2B1A04}}
.abs{{position:absolute}}
.brand{{left:0;top:84px;width:1080px;text-align:center;font-weight:600;font-size:26px;letter-spacing:12px;color:#9A6A12}}
.card{{font-family:"quicksand",sans-serif;font-weight:700;font-size:24px;line-height:1.3;color:#2B1A04;background:#FFFFFF;padding:14px 22px;border-radius:18px}}
.card span{{display:block;font-family:"dynapuff",sans-serif;font-weight:700;font-size:34px;color:#C27A00}}
.pill{{text-align:center;font-family:"dynapuff",sans-serif;font-weight:500;font-size:30px;color:#FFFFFF;background:#2B1A04;padding:14px 26px;border-radius:40px}}
.fun{{font-family:"dynapuff",sans-serif;font-weight:700}}
.q{{font-family:"quicksand",sans-serif;font-weight:700}}
{css}</style></head><body><div class="slide" data-canvas-width="1080" data-canvas-height="1350">'''
TAIL = '</div></body></html>'


def P(pts): return ' '.join(f'{x:.1f},{y:.1f}' for x, y in pts)
def hexp(x, y, r, rot=30): return P([(x + r * math.cos(math.radians(60 * i + rot)), y + r * math.sin(math.radians(60 * i + rot))) for i in range(6)])


def backdrop(podiums=(), accents=True, spot=(540, 640)):
    out = ['''<svg class="abs" style="left:0;top:0" width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg"><defs>
<linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFFDF7"/><stop offset="0.55" stop-color="#FCEFCF"/><stop offset="0.72" stop-color="#F7DFA6"/><stop offset="1" stop-color="#F3D287"/></linearGradient>
<radialGradient id="spot" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.6" stop-color="#FFF8E6" stop-opacity="0.55"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient>
<radialGradient id="warm" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFC93C" stop-opacity="0.55"/><stop offset="1" stop-color="#FFC93C" stop-opacity="0"/></radialGradient>
<radialGradient id="vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.6" stop-color="#7A4A00" stop-opacity="0"/><stop offset="1" stop-color="#7A4A00" stop-opacity="0.22"/></radialGradient>
<linearGradient id="ptop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="0.5" stop-color="#FFF4D2"/><stop offset="1" stop-color="#FFE08A"/></linearGradient>
<linearGradient id="pf1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFD54A"/><stop offset="1" stop-color="#E9A400"/></linearGradient>
<linearGradient id="pf2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE48A"/><stop offset="1" stop-color="#F2B90F"/></linearGradient>
<linearGradient id="pf3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F5B820"/><stop offset="1" stop-color="#CC8A00"/></linearGradient>
<radialGradient id="shadow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#5A3500" stop-opacity="0.45"/><stop offset="1" stop-color="#5A3500" stop-opacity="0"/></radialGradient>
</defs><rect width="1080" height="1350" fill="url(#wall)"/>''',
           f'<ellipse cx="{spot[0]}" cy="{spot[1]}" rx="520" ry="560" fill="url(#spot)"/>',
           f'<ellipse cx="{spot[0]}" cy="{spot[1] + 120}" rx="330" ry="360" fill="url(#warm)"/>']
    for (cx, cy, rx, ry, H) in podiums:
        V = [(cx + rx * math.cos(math.radians(a)), cy + ry * math.sin(math.radians(a))) for a in range(0, 360, 60)]
        face = lambda i, j: P([V[i], V[j], (V[j][0], V[j][1] + H), (V[i][0], V[i][1] + H)])
        out.append(f'<ellipse cx="{cx}" cy="{cy + ry + H + 10}" rx="{rx * 1.45:.0f}" ry="{ry * 0.85:.0f}" fill="url(#shadow)"/>')
        out.append(f'<polygon points="{face(2, 3)}" fill="url(#pf3)"/><polygon points="{face(1, 2)}" fill="url(#pf2)"/><polygon points="{face(0, 1)}" fill="url(#pf1)"/>')
        out.append(f'<polygon points="{P(V)}" fill="url(#ptop)" stroke="#FFFFFF" stroke-width="3"/>')
        out.append(f'<path d="M{V[2][0] + 6:.1f},{V[2][1] + 4:.1f} L{V[1][0] - 6:.1f},{V[1][1] + 4:.1f}" stroke="#FFFFFF" stroke-opacity="0.9" stroke-width="5" stroke-linecap="round"/>')
        out.append(f'<path d="M{V[2][0] + 18:.1f},{V[2][1] + 30:.1f} L{V[2][0] + 18:.1f},{V[2][1] + H - 20:.1f}" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="8" stroke-linecap="round"/>')
        out.append(f'<ellipse cx="{cx + 5}" cy="{cy + 10}" rx="{rx * 0.58:.0f}" ry="{ry * 0.3:.0f}" fill="url(#shadow)"/>')
    if accents:
        out.append(f'<polygon points="{hexp(150, 420, 34)}" fill="none" stroke="#E2A600" stroke-width="4"/><polygon points="{hexp(190, 488, 22)}" fill="#FFD54A"/>'
                   f'<polygon points="{hexp(930, 470, 28)}" fill="#FFD54A"/><polygon points="{hexp(975, 530, 40)}" fill="none" stroke="#E2A600" stroke-width="4"/>')
    out.append('<rect width="1080" height="1350" fill="url(#vig)"/></svg>')
    return ''.join(out)


def prod(kind, cx, base, h, rot=0):
    src, r = (JAR, JAR_R) if kind == 'jar' else (SACHET, SACHET_R)
    w = round(h * r)
    t = f';transform:rotate({rot}deg)' if rot else ''
    return f'<img class="abs" src="data:image/png;base64,{src}" style="left:{cx - w // 2}px;top:{base - h}px;width:{w}px;height:{h}px{t}" alt="Produk madu Beezam">'


def div(cls, css, html): return f'<div class="abs {cls}" style="{css}">{html}</div>'


FEEDS = {}

# D. Cek label (callouts on jar label)
def cek_label():
    h = 820; w = round(h * JAR_R); left = 300 - w // 2 + 40; top = 1250 - h; s = h / 1000
    J = lambda x, y: (left + x * s, top + y * s)
    # (dot on feature edge in jar coords, extra waypoints in jar coords, card)
    calls = [((478, 503), [], (840, 470, '100%', 'Madu asli')),
             ((500, 711), [], (840, 660, 'Halal', 'Indonesia')),
             ((388, 785), [], (840, 850, 'P-IRT', 'Terdaftar')),
             ((111, 760), [(111, 930), (560, 930)], (840, 1040, '140 g', 'Berat bersih'))]
    lines, cards = [], []
    for (fx, fy), way, (tx, ty, big, small) in calls:
        X, Y = J(fx, fy)
        pts = [(X, Y)] + [J(a, b) for a, b in way] + [(tx - 40, ty + 40), (tx - 8, ty + 40)]
        d = 'M' + ' L'.join(f'{a:.0f},{b:.0f}' for a, b in pts)
        lines.append(f'<path d="{d}" stroke="#2B1A04" stroke-width="4" fill="none" stroke-dasharray="2 9" stroke-linecap="round" stroke-linejoin="round"/><circle cx="{X:.0f}" cy="{Y:.0f}" r="9" fill="#2B1A04" stroke="#FFFFFF" stroke-width="4"/>')
        cards.append(div('card', f'left:{tx}px;top:{ty}px;width:190px', f'<span>{big}</span>{small}'))
    svg = '<svg class="abs" style="left:0;top:0" width="1080" height="1350" viewBox="0 0 1080 1350">' + ''.join(lines) + '</svg>'
    body = (backdrop(accents=False, spot=(380, 760)) + prod('jar', left + w // 2, 1250, h) + svg + ''.join(cards)
            + div('brand', '', 'BEEZAM') + div('fun', 'left:70px;top:130px;width:940px;font-size:92px;line-height:1.05', 'Cek Labelnya!')
            + div('q', 'left:70px;top:250px;width:760px;font-size:34px;color:#5A3A0A', 'Semua yang kamu perlu tahu ada di kemasan'))
    return 'Beezam - Cek Label', '.brand{text-align:left;left:72px}', body
FEEDS['d_cek_label'] = cek_label

# E. Typography poster
def typo():
    body = (backdrop(podiums=[(820, 1120, 190, 48, 100)], accents=False, spot=(780, 900))
            + prod('jar', 822, 1132, 420)
            + div('brand', '', 'BEEZAM')
            + div('fun', 'left:70px;top:170px;width:960px;font-size:150px;line-height:0.98', 'Manisnya<br>pas,')
            + div('fun', 'left:70px;top:480px;width:620px;font-size:118px;line-height:1.0;color:#C27A00', 'nggak bikin eneg.')
            + div('q', 'left:74px;top:1010px;width:520px;font-size:34px;line-height:1.35;color:#5A3A0A', 'Madu hutan asli dengan rasa yang enak sampai tetes terakhir.')
            + div('pill', 'left:70px;top:1240px', 'Madu Hutan Asli'))
    return 'Beezam - Typography', '.brand{text-align:left;left:72px}', body
FEEDS['e_typo'] = typo

# C. Dua pilihan kemasan
def dua():
    body = (backdrop(podiums=[(540, 1020, 420, 90, 140)], accents=True)
            + prod('jar', 360, 1040, 600) + prod('sachet', 730, 1050, 560)
            + div('brand', '', 'BEEZAM')
            + div('fun', 'left:0;top:128px;width:1080px;text-align:center;font-size:92px;line-height:1.05', 'Pilih Kemasanmu')
            + div('q', 'left:140px;top:246px;width:800px;text-align:center;font-size:32px;line-height:1.35;color:#5A3A0A', 'Botol untuk stok di rumah, sachet untuk dibawa pergi')
            + div('card', 'left:200px;top:1236px;width:290px;text-align:center', '<span>Botol</span>140 g')
            + div('card', 'left:590px;top:1236px;width:290px;text-align:center', '<span>Sachet</span>Praktis dibawa'))
    return 'Beezam - Pilih Kemasan', '.card{padding:8px 18px}.card span{font-size:30px}', body
FEEDS['c_dua'] = dua

# F. Paling enak dipadukan dengan...
def paduan():
    chips = [('Teh hangat', 80, 470), ('Roti panggang', 80, 650), ('Yogurt', 760, 560), ('Pancake', 760, 740)]
    c = ''.join(div('card', f'left:{x}px;top:{y}px;width:250px;text-align:center', f'<span>{t}</span>') for t, x, y in chips)
    body = (backdrop(podiums=[(540, 1020, 320, 80, 150)], accents=False)
            + prod('jar', 540, 1022, 600) + c
            + div('brand', '', 'BEEZAM')
            + div('fun', 'left:0;top:128px;width:1080px;text-align:center;font-size:84px;line-height:1.05', 'Enaknya Dipadukan<br>dengan Apa?')
            + div('pill', 'left:250px;top:1262px;width:580px', 'Kamu paling suka yang mana?'))
    return 'Beezam - Paduan', '.card span{font-size:28px;white-space:nowrap}.card{padding:16px 14px}', body
FEEDS['f_paduan'] = paduan

# G. Engagement: Tim Botol vs Tim Sachet
def tim():
    vs = '<svg class="abs" style="left:0;top:0" width="1080" height="1350" viewBox="0 0 1080 1350">' + f'<polygon points="{hexp(540, 700, 92)}" fill="#2B1A04" stroke="#FFD54A" stroke-width="8"/>' + '</svg>'
    body = (backdrop(podiums=[(290, 1030, 210, 55, 120), (790, 1030, 210, 55, 120)], accents=False)
            + prod('jar', 290, 1042, 560) + prod('sachet', 790, 1050, 470) + vs
            + div('fun', 'left:470px;top:648px;width:140px;text-align:center;font-size:66px;color:#FFD54A', 'VS')
            + div('brand', '', 'BEEZAM')
            + div('fun', 'left:0;top:128px;width:1080px;text-align:center;font-size:96px;line-height:1.05', 'Kamu Tim yang Mana?')
            + div('card', 'left:150px;top:1240px;width:280px;text-align:center', '<span>Tim Botol</span>')
            + div('card', 'left:650px;top:1240px;width:280px;text-align:center', '<span>Tim Sachet</span>')
            + div('q', 'left:0;top:250px;width:1080px;text-align:center;font-size:32px;color:#5A3A0A', 'Jawab di kolom komentar ya!'))
    return 'Beezam - Tim Mana', '.card{padding:10px 18px}', body
FEEDS['g_tim'] = tim

# I. Kenalan / brand intro
def kenalan():
    body = (backdrop(podiums=[(540, 1060, 360, 85, 130)], accents=True, spot=(540, 700))
            + prod('sachet', 700, 1075, 520) + prod('jar', 420, 1085, 640)
            + div('brand', '', 'KENALAN DENGAN')
            + div('fun', 'left:0;top:128px;width:1080px;text-align:center;font-size:120px;line-height:1.0', 'BEEZAM')
            + div('q', 'left:140px;top:262px;width:800px;text-align:center;font-size:34px;line-height:1.35;color:#5A3A0A', 'Madu hutan asli, dalam botol &amp; sachet')
            + div('pill', 'left:290px;top:1262px;width:500px', 'IG &amp; FB: beezam honey'))
    return 'Beezam - Kenalan', '', body
FEEDS['i_kenalan'] = kenalan

# H. CTA order
def order():
    steps = [('1', 'Pilih kemasan'), ('2', 'DM Instagram'), ('3', 'Pesanan diproses')]
    s = ''.join(div('card', f'left:{70 + i * 320}px;top:330px;width:290px;text-align:center', f'<span>{n}</span>{t}') for i, (n, t) in enumerate(steps))
    body = (backdrop(podiums=[(540, 1040, 360, 85, 140)], accents=False, spot=(540, 820))
            + prod('jar', 430, 1060, 560) + prod('sachet', 700, 1068, 470, rot=6) + s
            + div('brand', '', 'BEEZAM')
            + div('fun', 'left:0;top:128px;width:1080px;text-align:center;font-size:104px;line-height:1.05', 'Yuk, Order!')
            + div('pill', 'left:240px;top:1262px;width:600px', 'DM Instagram: beezam honey'))
    return 'Beezam - Order', '.card{padding:12px 18px}', body
FEEDS['h_order'] = order

if __name__ == '__main__':
    out = sys.argv[1]
    for k, f in FEEDS.items():
        title, css, body = f()
        open(os.path.join(out, k + '.html'), 'w').write(HEAD.format(title=title, css=css) + body + TAIL)
        print(k)
