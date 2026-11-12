"""CV BUANA: portfolio catalog (3x3 showcase grid) like the Beezam catalog."""
import base64, io, os, sys
from PIL import Image
D = os.path.dirname(os.path.abspath(__file__)); H = os.path.join(D, 'hi')
GREEN, CREAM, BROWN, GOLD, INK = '#172D29', '#F4EFE6', '#7B4A1F', '#D9B57E', '#1B2421'

def enc(im, q=88):
    b = io.BytesIO(); im.convert('RGB').save(b, 'JPEG', quality=q); return base64.b64encode(b.getvalue()).decode()
def mob(f, y, h=844, w=780):
    im = Image.open(os.path.join(H, f)).convert('RGB'); s = 3
    return enc(im.crop((0, y * s, 390 * s, (y + h) * s)).resize((w, round(w * h / 390)), Image.LANCZOS))
def desk(y, h=900, w=1400):
    im = Image.open(os.path.join(H, 'd_home.png')).convert('RGB'); s = 2
    return enc(im.crop((0, y * s, 1440 * s, (y + h) * s)).resize((w, round(w * h / 1440)), Image.LANCZOS))
def pop(f):
    return enc(Image.open(os.path.join(H, f)).convert('RGB').resize((780, 1688), Image.LANCZOS))
lg = Image.open(os.path.join(H, 'logo.png')).convert('RGBA'); lg = lg.crop(lg.split()[3].point(lambda v: 255 if v > 20 else 0).getbbox()); lg.thumbnail((500, 500))
b = io.BytesIO(); lg.save(b, 'PNG'); LOGO = base64.b64encode(b.getvalue()).decode()

HEAD = '''<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=1080"><title>{t}</title><style>
*{{margin:0;padding:0;box-sizing:border-box}}body{{background:{bg}}}
.s{{position:relative;width:1080px;height:1350px;overflow:hidden;background:{bg};font-family:Inter,sans-serif;color:{fg}}}
.a{{position:absolute}}
.phone{{position:absolute;width:440px;height:952px;border-radius:64px;background:#0E1513;box-shadow:0 0 0 3px #2E4842,0 50px 100px rgba(0,0,0,.4)}}
.phone .sc{{position:absolute;left:16px;top:16px;width:408px;height:920px;border-radius:50px;overflow:hidden;background:#fff}}
.phone .sc img{{width:100%;display:block}}
.phone .isl{{position:absolute;left:160px;top:30px;width:120px;height:34px;border-radius:20px;background:#000;z-index:3}}
.win{{position:absolute;border-radius:22px;overflow:hidden;background:#fff;box-shadow:0 0 0 2px rgba(0,0,0,.08),0 50px 100px rgba(0,0,0,.35)}}
.win .bar{{height:52px;background:#EAE5DB;display:flex;align-items:center;gap:12px;padding-left:22px}}
.win .bar i{{width:16px;height:16px;border-radius:50%;display:block}}
.win .bar span{{margin-left:24px;flex:1;max-width:520px;height:30px;border-radius:15px;background:#fff;font-size:16px;line-height:30px;padding-left:16px;color:#6B6B6B}}
.win img{{display:block;width:100%}}
.cap{{left:64px;bottom:60px;font-weight:800;font-size:44px;letter-spacing:-1px;line-height:1.1}}
.cap small{{display:block;font-weight:700;font-size:20px;letter-spacing:4px;color:{acc};margin-bottom:10px}}
</style></head><body><div class="s">'''
def page(t, body, bg=GREEN, fg='#FFFFFF', acc=GOLD): return HEAD.format(t=t, bg=bg, fg=fg, acc=acc) + body + '</div></body></html>'
def a(css, html): return f'<div class="a" style="{css}">{html}</div>'
def phone(x, y, b64, rot=0, sc=1):
    return f'<div class="phone" style="left:{x}px;top:{y}px;transform:rotate({rot}deg) scale({sc});transform-origin:50% 50%"><div class="isl"></div><div class="sc"><img src="data:image/jpeg;base64,{b64}" alt=""></div></div>'
def win(x, y, w, b64, rot=0):
    return f'<div class="win" style="left:{x}px;top:{y}px;width:{w}px;transform:rotate({rot}deg)"><div class="bar"><i style="background:#FF5F57"></i><i style="background:#FEBC2E"></i><i style="background:#28C840"></i><span>buanasastradahana.online</span></div><img src="data:image/jpeg;base64,{b64}" alt=""></div>'
def cap(n, t): return a('', f'<div class="a cap"><small>{n}</small>{t}</div>').replace('<div class="a" style="">', '').rstrip('</div>') + '</div>' if False else f'<div class="a cap"><small>{n}</small>{t}</div>'
def glow(c, x, y, r, o=.35): return f'<div class="a" style="left:{x - r}px;top:{y - r}px;width:{2 * r}px;height:{2 * r}px;border-radius:50%;background:radial-gradient({c},transparent 70%);opacity:{o}"></div>'

T = {}
T['01_landing'] = lambda: page('Landing', glow('#D9B57E', 540, 560, 520) + win(-60, 190, 1160, desk(0), -3) + cap('01 · LANDING PAGE', 'Bangun lebih baik.<br>Lebih terencana.'))
T['02_mobile'] = lambda: page('Mobile', glow('#D9B57E', 540, 640, 480, .5) + phone(320, 120, mob('m_home.png', 0), 5) + cap('02 · MOBILE FIRST', 'Responsif di semua layar'), bg=CREAM, fg=INK, acc=BROWN)
T['03_layanan'] = lambda: page('Layanan', win(64, 150, 1160, desk(1690), 0) + cap('03 · LAYANAN', '6 layanan, 1 klik<br>ke WhatsApp'), bg=CREAM, fg=INK, acc=BROWN)
T['04_proyek'] = lambda: page('Proyek', glow('#D9B57E', 540, 520, 520) + win(64, 190, 1160, desk(2650), 2) + cap('04 · PORTOFOLIO PROYEK', 'Dokumentasi proyek<br>sekolah'))
T['05_estimasi'] = lambda: page('Estimasi', glow('#D9B57E', 540, 600, 500) + phone(560, 160, mob('m_estimasi.png', 100), 4) + phone(80, 230, mob('m_estimasi.png', 560), -5) + cap('05 · WEB APP', 'Estimasi biaya<br>konstruksi'))
T['06_akun'] = lambda: page('Akun', phone(70, 150, mob('m_register.png', 0), -4) + phone(570, 110, mob('m_login.png', 0), 4) + cap('06 · AKUN CLIENT', 'Daftar &amp; login'), bg=CREAM, fg=INK, acc=BROWN)
T['07_portal'] = lambda: page('Portal', glow('#D9B57E', 540, 600, 520) + win(64, 200, 1160, desk(5190), -2) + cap('07 · PORTAL CLIENT', 'Proyek, RAB &amp; dokumen<br>dalam satu portal'))
T['08_pwa'] = lambda: page('PWA', phone(120, 130, pop('v_install.png'), -4)
    + a('left:640px;top:330px;width:300px;height:300px;border-radius:72px;background:#fff;box-shadow:0 40px 80px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center', f'<img src="data:image/png;base64,{LOGO}" style="width:220px;height:220px;object-fit:contain" alt="Logo">')
    + a('left:640px;top:660px;width:300px;text-align:center;font-weight:700;font-size:30px;color:#1B2421', 'CV BUANA')
    + cap('08 · PWA', 'Pasang ke<br>homescreen'), bg=CREAM, fg=INK, acc=BROWN)
T['09_legal'] = lambda: page('Legal', glow('#D9B57E', 540, 600, 500) + phone(320, 110, mob('m_legalitas.png', 395), 4) + cap('09 · LEGALITAS', 'Identitas usaha<br>yang transparan'))

def catalog(paths):
    TW, TH, G = 290, 362, 14; X0 = (1080 - (3 * TW + 2 * G)) // 2; Y0 = 190
    tiles = ''
    for i, p in enumerate(paths):
        im = Image.open(p).convert('RGB').resize((580, 725), Image.LANCZOS)
        tiles += f'<img class="a" src="data:image/jpeg;base64,{enc(im)}" style="left:{X0 + (i % 3) * (TW + G)}px;top:{Y0 + (i // 3) * (TH + G)}px;width:{TW}px;height:{TH}px;border-radius:14px" alt="">'
    body = (f'<div class="a" style="left:0;top:0;width:1080px;height:10px;background:{GOLD}"></div>'
            + a(f'left:{X0}px;top:58px;font-weight:800;font-size:76px;letter-spacing:-1px;line-height:1', 'PORTFOLIO')
            + a(f'left:{X0 + 2}px;top:142px;font-weight:700;font-size:18px;letter-spacing:2px;color:{BROWN}', 'WEBSITE &amp; WEB APP DESIGN · CV BUANA SASTRA DAHANA')
            + a(f'left:{X0 + 3 * TW + 2 * G - 290}px;top:66px;width:290px;display:flex;align-items:center;gap:12px;justify-content:flex-end',
                f'<img src="data:image/png;base64,{LOGO}" style="width:58px;height:58px;object-fit:contain" alt=""><span style="font-weight:800;font-size:18px;line-height:1.2">CV BUANA<br>SASTRA DAHANA</span>')
            + tiles
            + a(f'left:0;top:{Y0 + 3 * TH + 2 * G + 18}px;width:1080px;text-align:center;font-weight:700;font-size:17px;letter-spacing:2px;color:{BROWN}', 'LANDING PAGE · RESPONSIVE · WEB APP · CLIENT PORTAL · PWA'))
    return page('Portfolio CV BUANA', body, bg='#FAF7F1', fg=INK, acc=BROWN)

if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    if len(sys.argv) > 2 and sys.argv[2] == 'catalog':
        open(os.path.join(out, 'catalog.html'), 'w').write(catalog([os.path.join(out, k + '.png') for k in T])); print('catalog')
    else:
        for k, f in T.items(): open(os.path.join(out, k + '.html'), 'w').write(f()); print(k)
