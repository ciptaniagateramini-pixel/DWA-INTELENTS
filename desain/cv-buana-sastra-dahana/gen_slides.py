"""CV BUANA SASTRA DAHANA: portfolio + web app guide carousel (1080x1350)."""
import base64, io, os, sys
from PIL import Image
D = os.path.dirname(os.path.abspath(__file__)); H = os.path.join(D, 'hi')
GREEN, GREEN2, CREAM, BROWN, GOLD, INK = '#172D29', '#21403A', '#F4EFE6', '#7B4A1F', '#D9B57E', '#1B2421'

def crop_b64(f, y_css, h_css=844, w_css=390, scale=3, q=88):
    im = Image.open(os.path.join(H, f)).convert('RGB')
    box = (0, int(y_css * scale), int(w_css * scale), int((y_css + h_css) * scale))
    im = im.crop(box).resize((780, int(780 * h_css / w_css)), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=q); return base64.b64encode(b.getvalue()).decode()
def file_b64(path, fmt='PNG', size=None):
    im = Image.open(path)
    if size: im = im.resize(size, Image.LANCZOS)
    b = io.BytesIO(); (im.convert('RGB') if fmt == 'JPEG' else im).save(b, fmt, quality=88); return base64.b64encode(b.getvalue()).decode()
_lg = Image.open(os.path.join(H, 'logo.png')).convert('RGBA'); _lg = _lg.crop(_lg.split()[3].point(lambda v: 255 if v > 20 else 0).getbbox()); _lg.thumbnail((400, 400)); _b = io.BytesIO(); _lg.save(_b, 'PNG'); LOGO = base64.b64encode(_b.getvalue()).decode()

HEAD = '''<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=1080"><title>{t}</title>
<style>*{{margin:0;padding:0;box-sizing:border-box}}body{{background:{bg}}}
.s{{position:relative;width:1080px;height:1350px;overflow:hidden;background:{bg};font-family:Inter,sans-serif;color:{fg}}}
.a{{position:absolute}}
.k{{font-weight:700;font-size:20px;letter-spacing:4px;color:{acc}}}
.h{{font-weight:800;letter-spacing:-1.5px;line-height:1.04}}
.h em{{font-style:normal;color:{acc}}}
.p{{font-weight:500;font-size:28px;line-height:1.45;opacity:.85}}
.badge{{display:inline-block;background:{acc};color:{GREEN};font-weight:800;font-size:22px;letter-spacing:3px;padding:10px 22px;border-radius:40px}}
.phone{{position:absolute;width:440px;height:952px;border-radius:64px;background:#0E1513;box-shadow:0 0 0 3px #2E4842,0 50px 90px rgba(0,0,0,.45)}}
.phone .sc{{position:absolute;left:16px;top:16px;width:408px;height:920px;border-radius:50px;overflow:hidden;background:#fff}}
.phone .sc img{{width:100%;display:block}}
.phone .isl{{position:absolute;left:160px;top:30px;width:120px;height:34px;border-radius:20px;background:#000;z-index:3}}
.li{{display:flex;gap:18px;align-items:flex-start;font-weight:600;font-size:26px;line-height:1.35;margin-bottom:18px}}
.li b{{flex:none;width:44px;height:44px;border-radius:50%;background:{acc};color:{GREEN};display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800}}
.tap{{position:absolute;width:70px;height:70px;margin:-35px 0 0 -35px;border-radius:50%;border:5px solid {GOLD};background:rgba(217,181,126,.35);z-index:4}}
.ft{{left:70px;right:70px;bottom:48px;display:flex;justify-content:space-between;align-items:center;font-weight:600;font-size:20px;letter-spacing:2px;opacity:.7}}
.logo{{display:flex;align-items:center;gap:14px;font-weight:800;font-size:22px;letter-spacing:1px;line-height:1.15}}
.logo img{{width:72px;height:72px;background:#fff;border-radius:16px;padding:7px;object-fit:contain}}
.li strong{{font-weight:800}}
</style></head><body><div class="s">'''

def page(t, body, bg=GREEN, fg='#FFFFFF', acc=GOLD):
    return HEAD.format(t=t, bg=bg, fg=fg, acc=acc, GREEN=GREEN, GOLD=GOLD) + body + '</div></body></html>'
def a(css, html, cls=''): return f'<div class="a {cls}" style="{css}">{html}</div>'
def phone(x, y, b64, extra='', rot=0):
    r = f'transform:rotate({rot}deg);' if rot else ''
    return f'<div class="phone" style="left:{x}px;top:{y}px;{r}"><div class="isl"></div><div class="sc"><img src="data:image/jpeg;base64,{b64}" alt="">{extra}</div></div>'
def logo_row(css, dark=False):
    c = INK if dark else '#FFFFFF'
    return a(css + f';color:{c}', f'<div class="logo"><img src="data:image/png;base64,{LOGO}" alt="Logo CV BUANA SASTRA DAHANA"><div>CV BUANA<br>SASTRA DAHANA</div></div>')
def footer(n, total, dark=False):
    return a('', f'<span>buanasastradahana.online</span><span>{n} / {total}</span>', 'ft')

SL = {}
TOTAL = 8

# 1. Cover guide
SL['g1_cover'] = lambda: page('Panduan', logo_row('left:70px;top:70px')
    + a('left:70px;top:250px;width:560px', 'PANDUAN WEB APP', 'k')
    + a('left:66px;top:300px;width:560px;font-size:92px', 'Cara pakai<br><em>web app</em><br>CV BUANA.', 'h')
    + a('left:70px;top:660px;width:520px',
        ''.join(f'<div class="li"><b>{i}</b>{t}</div>' for i, t in enumerate(['Lihat layanan &amp; konsultasi', 'Hitung estimasi biaya', 'Daftar akun client', 'Masuk portal client', 'Pasang ke homescreen', 'Cek legalitas'], 1)))
    + phone(600, 230, crop_b64('m_home.png', 0), rot=4) + footer(1, TOTAL))

def step(n, total, kicker, title, text, items, img, taps='', bg=GREEN, fg='#FFFFFF', flip=False):
    dark = bg != GREEN
    px, tx = (70, 560) if flip else (580, 70)
    return page(kicker, logo_row('left:70px;top:60px' if not flip else 'left:560px;top:60px', dark)
        + a(f'left:{tx}px;top:200px;width:460px', f'<span class="badge">LANGKAH {n}</span>')
        + a(f'left:{tx - 3}px;top:280px;width:470px;font-size:68px', title, 'h')
        + a(f'left:{tx}px;top:{520 if title.count("<br>") < 2 else 600}px;width:450px', text, 'p')
        + a(f'left:{tx}px;top:{800 if title.count("<br>") < 2 else 860}px;width:450px', ''.join(f'<div class="li"><b>{i}</b>{t}</div>' for i, t in enumerate(items, 1)))
        + phone(px, 250, img, taps) + footer(n + 1, total), bg=bg, fg=fg, acc=(BROWN if dark else GOLD))

def tap(x_css, y_css): return f'<div class="tap" style="left:{x_css * 408 / 390:.0f}px;top:{y_css * 408 / 390:.0f}px"></div>'

SL['g2_layanan'] = lambda: step(1, TOTAL, 'Layanan', 'Lihat layanan,<br><em>konsultasi</em><br>via WA.', 'Pilih layanan di menu <b>Layanan</b>, lalu ketuk <b>Konsultasikan kebutuhan</b>. Pesan WhatsApp terisi otomatis.',
    ['Pembangunan baru', 'Renovasi rumah, gedung &amp; sekolah', 'Aluminium &amp; supply material'], crop_b64('m_home.png', 1795), tap(70, 383))
SL['g3_estimasi'] = lambda: step(2, TOTAL, 'Estimasi', 'Hitung<br><em>estimasi</em><br>biaya.', 'Buka <b>Estimasi Biaya</b>. Sistem tidak mengarang harga: jika master harga belum ada, hasil ditandai <b>PERLU SURVEY</b>.',
    ['Pilih jenis pekerjaan', 'Isi luas tanah, bangunan &amp; budget', 'Ketuk <strong>Proses Estimasi</strong>'], crop_b64('m_estimasi.png', 120), bg=CREAM, fg=INK, flip=True)
SL['g4_daftar'] = lambda: step(3, TOTAL, 'Daftar', 'Buat<br><em>akun</em><br>client.', 'Di halaman Login Client, ketuk <b>Daftar</b>.',
    ['Isi nama lengkap &amp; nomor WhatsApp', 'Isi email &amp; password', 'Ketuk <strong>Buat Akun</strong>'], crop_b64('m_register.png', 0), tap(195, 618))
SL['g5_login'] = lambda: step(4, TOTAL, 'Login', 'Masuk<br><em>portal</em><br>client.', 'Login dengan email &amp; password. Satu pintu untuk informasi proyek yang tersedia di akun Anda.',
    ['Informasi proyek', 'RAB &amp; kontrak', 'Pembayaran &amp; dokumen'], crop_b64('m_login.png', 0), tap(195, 453), bg=CREAM, fg=INK, flip=True)
SL['g6_install'] = lambda: step(5, TOTAL, 'Install', 'Pasang ke<br><em>homescreen</em>.', 'Ketuk <b>Unduh Aplikasi</b> di halaman login. Akses akun tetap perlu internet.',
    ['<span><b style="display:inline;background:none;color:inherit;width:auto;height:auto">Android:</b> Chrome → menu ⋮ → Instal aplikasi</span>', '<span><b style="display:inline;background:none;color:inherit;width:auto;height:auto">iPhone:</b> Safari → Bagikan → Tambahkan ke Layar Utama</span>'],
    file_b64(os.path.join(H, 'v_install.png'), 'JPEG', (780, 1688)))
SL['g7_legal'] = lambda: step(6, TOTAL, 'Legalitas', 'Cek<br><em>legalitas</em><br>perusahaan.', 'Menu <b>Legalitas</b> memuat identitas usaha untuk dasar kerja sama.',
    ['NIB, NPWP &amp; pengesahan AHU', 'Akta pendirian &amp; KBLI', 'Alamat &amp; kontak resmi'], crop_b64('m_legalitas.png', 395), bg=CREAM, fg=INK, flip=True)

# Portfolio showcase (separate page)
def porto():
    dk = file_b64(os.path.join(H, 'd_home.png'), 'JPEG', None) if False else None
    im = Image.open(os.path.join(H, 'd_home.png')).convert('RGB').crop((0, 0, 2880, 1800)).resize((1200, 750), Image.LANCZOS)
    b = io.BytesIO(); im.save(b, 'JPEG', quality=88); dk = base64.b64encode(b.getvalue()).decode()
    laptop = (f'<div class="a" style="left:130px;top:430px;width:820px;height:520px;border-radius:26px;background:#0E1513;box-shadow:0 0 0 3px #2E4842,0 50px 90px rgba(0,0,0,.45)">'
              f'<img src="data:image/jpeg;base64,{dk}" style="position:absolute;left:18px;top:18px;width:784px;height:484px;border-radius:12px;object-fit:cover;object-position:top" alt="Desktop">'
              f'</div><div class="a" style="left:60px;top:948px;width:960px;height:26px;border-radius:0 0 26px 26px;background:linear-gradient(#3A524C,#1C2B28)"></div>')
    sw = ''.join(f'<div style="display:flex;align-items:center;gap:12px;font-weight:700;font-size:18px"><span style="width:38px;height:38px;border-radius:10px;background:{c};box-shadow:0 0 0 2px rgba(255,255,255,.25)"></span>{c}</div>' for c in [GREEN, CREAM, BROWN, GOLD])
    small = lambda x, y, f, yc, rot: (f'<div class="phone" style="left:{x}px;top:{y}px;transform:scale(.52) rotate({rot}deg);transform-origin:0 0"><div class="isl"></div><div class="sc"><img src="data:image/jpeg;base64,{crop_b64(f, yc)}" alt=""></div></div>')
    body = (a('left:70px;top:64px', 'PORTFOLIO', 'k')
            + a('left:66px;top:104px;width:720px;font-size:64px', 'Website &amp;<br><em>Web App</em> Design', 'h')
            + a('left:70px;top:252px;width:900px', 'CV BUANA SASTRA DAHANA · Konstruksi &amp; Supply Material', 'p')
            + a('left:70px;top:318px;display:flex;gap:28px', sw)
            + laptop + small(800, 560, 'm_home.png', 0, 3)
            + a('left:70px;top:1050px;width:940px;display:grid;grid-template-columns:1fr 1fr;gap:6px 40px',
                ''.join(f'<div class="li" style="font-size:24px;margin-bottom:10px"><b>✓</b>{t}</div>' for t in ['Company profile responsif', 'Estimasi biaya awal', 'Daftar &amp; portal client', 'PWA: pasang ke homescreen', 'Halaman legalitas', 'CTA WhatsApp per layanan']))
            + footer('', '').replace('<span> / </span>', '<span>Konstruksi · Renovasi · Aluminium</span>'))
    return page('Portfolio CV BUANA', logo_row('left:820px;top:56px') + body)
SL['p0_portfolio'] = porto

if __name__ == '__main__':
    out = sys.argv[1]; os.makedirs(out, exist_ok=True)
    for k, f in SL.items():
        open(os.path.join(out, k + '.html'), 'w').write(f()); print(k)
