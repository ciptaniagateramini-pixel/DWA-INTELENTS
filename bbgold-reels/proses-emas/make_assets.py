# Pembuat aset SVG "proses emas" (2D flat + sedikit 2.5D, palet bb gold).
# Aset beranimasi memakai SMIL; mesin zig-zag mengatur waktunya per frame (setCurrentTime),
# jadi hasil render tetap deterministik. Jalankan: python3 proses-emas/make_assets.py
import math, os

B, M, MM, K, A = "#082A59", "#E5B527", "#F6DC7A", "#FBF7EC", "#55637E"
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "proses-emas")
os.makedirs(OUT, exist_ok=True)
EASE = 'calcMode="spline" keyTimes="0;1" keySplines=".16 1 .3 1"'
INOUT = 'calcMode="spline" keyTimes="0;1" keySplines=".65 0 .35 1"'
SW = 'stroke="%s" stroke-width="7" stroke-linejoin="round" stroke-linecap="round"' % B


def svg(name, w, h, body):
    s = f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{body}</svg>'
    open(os.path.join(OUT, name + ".svg"), "w").write(s)


def an(attr, frm, to, begin, dur, ease=EASE):
    return f'<animate attributeName="{attr}" from="{frm}" to="{to}" begin="{begin}s" dur="{dur}s" fill="freeze" {ease}/>'


def move(frm, to, begin, dur, ease=EASE):
    return f'<animateTransform attributeName="transform" type="translate" from="{frm}" to="{to}" begin="{begin}s" dur="{dur}s" fill="freeze" additive="sum" {ease}/>'


def shadow(cx, cy, rx, ry=14):
    return f'<ellipse cx="{cx}" cy="{cy}" rx="{rx}" ry="{ry}" fill="{B}" opacity=".15"/>'


def text(x, y, s, size, fill=B, anchor="middle", weight=700):
    return f'<text x="{x}" y="{y}" font-family="Poppins" font-weight="{weight}" font-size="{size}" fill="{fill}" text-anchor="{anchor}">{s}</text>'


def ring(cx, cy, r, worn=False, stone=False):
    g = f'<ellipse cx="{cx}" cy="{cy}" rx="{r}" ry="{r*0.62}" fill="none" stroke="{B}" stroke-width="{r*0.42}"/>'
    g += f'<ellipse cx="{cx}" cy="{cy}" rx="{r}" ry="{r*0.62}" fill="none" stroke="{M}" stroke-width="{r*0.26}"/>'
    g += f'<path d="M {cx-r*0.8} {cy-r*0.36} Q {cx} {cy-r*0.8} {cx+r*0.8} {cy-r*0.36}" fill="none" stroke="{MM}" stroke-width="{r*0.09}" stroke-linecap="round"/>'
    if worn:
        for dx, dy in ((-0.55, 0.42), (0.35, 0.5), (0.85, 0.05)):
            g += f'<path d="M {cx+dx*r} {cy+dy*r} l {r*0.12} {-r*0.05}" stroke="{A}" stroke-width="{r*0.06}" stroke-linecap="round"/>'
    if stone:
        hx, hy, hr = cx, cy - r * 0.78, r * 0.34
        pts = " ".join(f"{hx+hr*math.cos(math.radians(60*i-90)):.1f},{hy+hr*math.sin(math.radians(60*i-90)):.1f}" for i in range(6))
        g += f'<polygon points="{pts}" fill="{K}" {SW}/>'
    return g


def hexagon(cx, cy, r, fill, extra=""):
    pts = " ".join(f"{cx+r*math.cos(math.radians(60*i-90)):.1f},{cy+r*math.sin(math.radians(60*i-90)):.1f}" for i in range(6))
    return f'<polygon points="{pts}" fill="{fill}" {SW} {extra}/>'


def chain(x0, y0, n, step, broken_at=None):
    g = ""
    for i in range(n):
        if broken_at is not None and i == broken_at:
            continue
        x = x0 + i * step
        y = y0 + 10 * math.sin(i * 0.6)
        if i % 2 == 0:
            g += f'<ellipse cx="{x}" cy="{y}" rx="{step*0.62}" ry="{step*0.36}" fill="none" stroke="{B}" stroke-width="9"/><ellipse cx="{x}" cy="{y}" rx="{step*0.62}" ry="{step*0.36}" fill="none" stroke="{M}" stroke-width="5"/>'
        else:
            g += f'<rect x="{x-3}" y="{y-step*0.4}" width="7" height="{step*0.8}" rx="3" fill="{M}" stroke="{B}" stroke-width="3"/>'
    return g


# ---- K1: meja toko + perhiasan lama ----
svg("meja-toko", 820, 420,
    shadow(410, 400, 380) +
    f'<rect x="40" y="150" width="740" height="240" rx="18" fill="{A}" {SW}/>' +
    f'<rect x="20" y="110" width="780" height="60" rx="16" fill="{K}" {SW}/>' +
    f'<rect x="120" y="215" width="580" height="120" rx="14" fill="{B}"/>' +
    text(410, 290, "JUAL BELI EMAS", 46, K) +
    f'<rect x="150" y="70" width="520" height="54" rx="27" fill="{MM}" {SW}/>')
svg("cincin-lama", 240, 200, shadow(120, 178, 90, 10) + ring(120, 100, 80, worn=True))
svg("kalung-lama", 340, 200, shadow(170, 178, 140, 10) + chain(40, 100, 12, 24, broken_at=7))
svg("anting-lama", 160, 220,
    shadow(80, 200, 50, 8) +
    f'<path d="M 80 20 q 30 0 30 30 q 0 22 -30 30" fill="none" stroke="{B}" stroke-width="10" stroke-linecap="round"/>' +
    f'<path d="M 80 20 q 30 0 30 30 q 0 22 -30 30" fill="none" stroke="{M}" stroke-width="5" stroke-linecap="round"/>' +
    hexagon(80, 130, 52, M) +
    f'<path d="M 58 118 l 14 -10" stroke="{A}" stroke-width="6" stroke-linecap="round"/>')

# ---- K2: tungku peleburan (animasi) ----
flames = ""
for i, (fx, h, c) in enumerate(((310, 110, M), (350, 140, MM), (390, 105, M))):
    flames += (f'<g transform="translate({fx} 760)"><path d="M -26 0 Q -30 {-h*0.55} 0 {-h} Q 30 {-h*0.55} 26 0 Z" fill="{c}" stroke="{B}" stroke-width="5">'
               f'<animateTransform attributeName="transform" type="scale" values="1 1;1.08 0.86;0.94 1.08;1 1" dur="{0.5+i*0.12:.2f}s" repeatCount="indefinite"/></path></g>')
falling = (f'<g>{move("0 -520", "0 0", 0.2, 0.6)}'
           f'<g>{an("opacity", 1, 0, 1.0, 0.9, INOUT)}'
           f'{ring(320, 250, 30)}{chain(350, 250, 5, 16)}</g></g>')
liquid = (f'<ellipse cx="350" cy="262" rx="0" ry="0" fill="{MM}" stroke="{B}" stroke-width="5">'
          f'{an("rx", 0, 92, 0.9, 1.2)}{an("ry", 0, 20, 0.9, 1.2)}</ellipse>')
waves = ""
for i, x in enumerate((300, 350, 400)):
    waves += (f'<path d="M {x} 200 q 14 -22 0 -44 q -14 -22 0 -44" fill="none" stroke="{K}" stroke-width="7" stroke-linecap="round" opacity="0">'
              f'{an("opacity", 0, 0.9, 1.1 + i*0.15, 0.4)}'
              f'<animateTransform attributeName="transform" type="translate" values="0 10;0 -18" dur="0.9s" begin="{1.1+i*0.15}s" repeatCount="indefinite"/></path>')
svg("tungku", 700, 900,
    shadow(350, 870, 260) +
    f'<rect x="150" y="430" width="400" height="430" rx="22" fill="{A}" {SW}/>' +
    f'<polygon points="150,430 200,400 600,400 550,430" fill="{B}" {SW}/>' +
    f'<rect x="200" y="400" width="350" height="34" fill="{K}" {SW}/>' +
    f'<rect x="250" y="580" width="200" height="200" rx="16" fill="{B}" {SW}/>' + flames +
    f'<rect x="240" y="790" width="220" height="22" rx="8" fill="{K}" {SW}/>' +
    falling +
    f'<polygon points="250,262 450,262 420,402 280,402" fill="{K}" {SW}/>' +
    f'<ellipse cx="350" cy="262" rx="100" ry="24" fill="{B}" {SW}/>' + liquid + waves)

# ---- K3a: pemurnian (tampak atas, animasi) ----
specks = ""
for i, (x, y) in enumerate(((290, 300), (400, 270), (330, 420), (430, 390), (260, 380), (370, 340))):
    specks += (f'<circle cx="{x}" cy="{y}" r="16" fill="{A}" {SW.replace("7", "4")}>'
               f'{an("cx", x, 505 + (i % 3) * 8, 0.25 + i*0.05, 0.9)}{an("cy", y, 330 + (i % 3) * 20, 0.25 + i*0.05, 0.9)}'
               f'{an("opacity", 1, 0, 1.55, 0.35, INOUT)}</circle>')
ladle = (f'<g transform="translate(700 120) rotate(30)">{move("0 0", "-150 140", 0.9, 0.6, INOUT)}'
         f'<rect x="-14" y="-10" width="28" height="300" rx="14" fill="{K}" {SW}/><circle cx="0" cy="300" r="46" fill="{K}" {SW}/>'
         f'<circle cx="0" cy="300" r="28" fill="{B}"/></g>')
svg("murni", 720, 720,
    shadow(360, 690, 260) +
    f'<circle cx="360" cy="350" r="290" fill="{K}" {SW}/><circle cx="360" cy="350" r="250" fill="{B}"/>' +
    f'<circle cx="360" cy="350" r="232" fill="{MM}" {SW}/>' +
    f'<path d="M 200 290 q 60 -40 120 0" fill="none" stroke="{K}" stroke-width="10" stroke-linecap="round" opacity=".8"/>' +
    specks + ladle)

# ---- K3b: dituang ke cetakan jadi cukim (animasi) ----
stream = (f'<rect x="330" y="300" width="34" height="0" rx="17" fill="{MM}" stroke="{B}" stroke-width="5">'
          f'{an("height", 0, 270, 0.1, 0.4)}{an("y", 300, 570, 1.3, 0.35, INOUT)}{an("height", 270, 0, 1.3, 0.35, INOUT)}</rect>')
fill = (f'<rect x="200" y="660" width="500" height="0" fill="{MM}">{an("y", 660, 590, 0.3, 1.1)}{an("height", 0, 70, 0.3, 1.1)}</rect>'
        f'<rect x="200" y="590" width="500" height="70" fill="{M}" opacity="0">{an("opacity", 0, 1, 1.6, 1.0, INOUT)}</rect>'
        f'<path d="M 230 610 h 180" stroke="{MM}" stroke-width="10" stroke-linecap="round" opacity="0">{an("opacity", 0, 1, 2.2, 0.5)}</path>')
stamp = (f'<g opacity="0">{an("opacity", 0, 1, 3.55, 0.05)}{move("0 -40", "0 0", 3.55, 0.15)}'
         f'{hexagon(560, 625, 26, MM)}</g>')
svg("cetak", 900, 800,
    shadow(450, 770, 330) +
    f'<g transform="rotate(-38 300 260)">'
    f'<polygon points="200,180 400,180 370,320 230,320" fill="{K}" {SW}/><ellipse cx="300" cy="180" rx="100" ry="22" fill="{B}" {SW}/>'
    f'<ellipse cx="300" cy="182" rx="80" ry="15" fill="{MM}"/></g>' + stream +
    f'<polygon points="150,580 750,580 790,560 190,560" fill="{K}" {SW}/>' +
    f'<rect x="150" y="580" width="600" height="160" rx="18" fill="{A}" {SW}/>' +
    f'<rect x="200" y="590" width="500" height="70" rx="10" fill="{B}"/>' + fill + stamp +
    f'<rect x="200" y="590" width="500" height="70" rx="10" fill="none" {SW}/>')

# ---- K4: pengrajin menggiling dan membentuk (animasi) ----
def roller(cy):
    spokes = "".join(f'<path d="M 0 0 L {70*math.cos(math.radians(a)):.1f} {70*math.sin(math.radians(a)):.1f}" stroke="{B}" stroke-width="6"/>' for a in (0, 60, 120, 180, 240, 300))
    return (f'<g transform="translate(380 {cy})"><g><circle r="86" fill="{K}" {SW}/>{spokes}<circle r="16" fill="{B}"/>'
            f'<animateTransform attributeName="transform" type="rotate" from="0" to="{720 if cy < 400 else -720}" begin="0s" dur="1.8s" fill="freeze"/></g></g>')
bar_in = (f'<rect x="40" y="360" width="190" height="52" rx="10" fill="{M}" {SW}>{move("0 0", "250 0", 0, 0.7)}'
          f'{an("width", 190, 0, 0.6, 0.9)}</rect>')
strip = (f'<rect x="380" y="370" width="0" height="32" rx="12" fill="{M}" {SW}>{an("width", 0, 420, 0.6, 1.0)}'
         f'{an("height", 32, 18, 0.6, 1.0)}{an("y", 370, 377, 0.6, 1.0)}{an("opacity", 1, 0, 1.9, 0.4, INOUT)}</rect>')
circ = 2 * math.pi * 95
forming = (f'<circle cx="640" cy="640" r="95" fill="none" stroke="{B}" stroke-width="30" stroke-dasharray="{circ:.1f}" stroke-dashoffset="{circ:.1f}" transform="rotate(-90 640 640)">'
           f'{an("stroke-dashoffset", f"{circ:.1f}", 0, 1.8, 1.0)}</circle>'
           f'<circle cx="640" cy="640" r="95" fill="none" stroke="{M}" stroke-width="18" stroke-dasharray="{circ:.1f}" stroke-dashoffset="{circ:.1f}" transform="rotate(-90 640 640)">'
           f'{an("stroke-dashoffset", f"{circ:.1f}", 0, 1.8, 1.0)}</circle>')
svg("pengrajin", 900, 800,
    shadow(450, 780, 360) +
    f'<rect x="250" y="160" width="260" height="440" rx="24" fill="{A}" {SW}/>' +
    roller(300) + roller(470) + bar_in + strip +
    f'<rect x="500" y="740" width="280" height="24" rx="10" fill="{K}" {SW}/>' + forming)

svg("perhiasan-baru", 720, 500,
    shadow(360, 480, 300) +
    f'<rect x="90" y="360" width="540" height="110" rx="20" fill="{K}" {SW}/>' +
    f'<polygon points="90,360 130,330 590,330 630,360" fill="{MM}" {SW}/>' +
    ring(230, 270, 78, stone=True) +
    f'<path d="M 400 90 Q 480 300 560 90" fill="none" stroke="{B}" stroke-width="12"/>'
    f'<path d="M 400 90 Q 480 300 560 90" fill="none" stroke="{M}" stroke-width="6" stroke-dasharray="10 8"/>' +
    hexagon(480, 250, 46, M) + hexagon(480, 250, 22, K))

# ---- K5: alur biaya ----
def chip_icon(x, kind):
    g = f'<rect x="{x-80}" y="40" width="160" height="160" rx="28" fill="{K}" {SW}/>'
    if kind == "api":
        g += f'<path d="M {x-26} 160 Q {x-34} 100 {x} 70 Q {x+34} 100 {x+26} 160 Z" fill="{M}" {SW}/>'
    elif kind == "bar":
        g += f'<polygon points="{x-50},150 {x+50},150 {x+36},100 {x-36},100" fill="{M}" {SW}/>'
    else:
        g += ring(x, 125, 42)
    return g
tags = ""
for i, x in enumerate((140, 450, 760)):
    b0 = 0.6 + i * 0.6
    tags += (f'<g opacity="0">{an("opacity", 0, 1, b0, 0.25)}{move("0 24", "0 0", b0, 0.35)}'
             f'<rect x="{x-92}" y="230" width="184" height="62" rx="31" fill="{B}"/>{text(x, 272, "+ biaya", 34, K)}</g>')
arrows = "".join(f'<path d="M {x} 120 h 70 m -18 -18 l 18 18 l -18 18" fill="none" stroke="{B}" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>' for x in (240, 550))
svg("alur-biaya", 900, 320, chip_icon(140, "api") + chip_icon(450, "bar") + chip_icon(760, "ring") + arrows + tags)
for name, label in (("chip-pengrajin", "Biaya pengrajin"), ("chip-produksi", "Biaya produksi")):
    svg(name, 640, 130, shadow(320, 118, 260, 9) + f'<rect x="20" y="10" width="600" height="100" rx="50" fill="{K}" {SW}/>' +
        f'<circle cx="80" cy="60" r="30" fill="{M}" {SW}/>{text(80, 74, "+", 40, B)}' + text(350, 76, label, 46))

# ---- K6: selisih harga (spread) ----
svg("spread", 880, 640,
    text(40, 90, "Saat kamu beli", 44, B, "start") +
    f'<rect x="40" y="120" width="0" height="90" rx="20" fill="{B}">{an("width", 0, 780, 0.3, 1.0)}</rect>' +
    text(40, 330, "Saat kamu jual", 44, B, "start") +
    f'<rect x="40" y="360" width="0" height="90" rx="20" fill="{K}" {SW}>{an("width", 0, 520, 0.8, 1.0)}</rect>' +
    f'<g opacity="0">{an("opacity", 0, 1, 4.3, 0.3)}'
    f'<path d="M 560 230 V 520 M 820 230 V 520" stroke="{B}" stroke-width="6" stroke-dasharray="14 12"/>'
    f'<path d="M 560 560 h 260 M 560 540 v 40 M 820 540 v 40" stroke="{B}" stroke-width="8" stroke-linecap="round"/>'
    f'<rect x="575" y="582" width="230" height="56" rx="28" fill="{MM}" {SW}/>{text(690, 621, "selisih", 34)}</g>')
print("aset ditulis ke", os.path.abspath(OUT))
