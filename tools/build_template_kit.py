"""Build a sellable Template Kit from this project, with every client asset and identifier removed.

    python3 tools/build_template_kit.py <staging_dir>

- copies source, tools, fonts, SFX and music;
- rewrites client names / brand / phone number to neutral sample values (REPLACEMENTS);
- replaces character renders and logos with labelled placeholder PNGs of the same file names;
- replaces client VO with silent WAVs;
- leaves out client docs, renders, original assets and this script itself.
"""
import re
import shutil
import sys
import wave
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
DEST = Path(sys.argv[1]).resolve() / "AI_Agent_Video_Template_Kit"
FONT = ROOT / "public/fonts/Poppins-Bold.ttf"

# Longest keys first so substrings are never replaced before their full phrase.
REPLACEMENTS = [
    ("Ibu Rina-Pelanggan via WA", "Bu Ana"),
    ("Ownerbb mengetik pesan", "Owner typing"),
    ("Ownerbb-melihat pesan", "Owner reading"),
    ("Ownerbb-Melihatkan hp", "Owner present"),
    ("WA Logo No Background", "logo-wa"),
    ("Logo Insta No Background", "logo-ig"),
    ("Logo TikTok No Background", "logo-tiktok"),
    ("vo_scene10_tokobb_norm", "vo_scene10_norm"),
    ("Hasil master part 1A", "master_part1A"),
    ("Hasil master part 1", "master_part1"),
    ("DWA AGENT INTELLIGENT", "AI AGENT TEAM"),
    ("AI STAFF TOKO BB GOLD", "AI STAFF NAMA BISNIS"),
    ("TOKO BB GOLD", "NAMA BISNIS"),
    ("TOKO BB", "NAMA BISNIS"),
    ("D.W.A", "BRAND"),
    ("DWA", "BRAND"),
    ("0882000119208", "08xx xxxx xxxx"),
    ("BB App", "App"),
    ("'BB'", "'APP'"),
    (">BB<", ">APP<"),
    ("Ibu Wiwi", "Bu Dewi"),
    ("Bu Rina", "Bu Ana"),
    ("Bu Wiwi", "Bu Dewi"),
    ("Pak Tata", "Pak Budi"),
    ("Adrian", "Rio"),
    ("Bu Mila", "Hana"),
    ("Marzuki", "Rafi"),
    ("Acep", "Dimas"),
    ("Bambang", "Bima"),
    ("Angga", "Arya"),
    ("Fitri", "Nadia"),
    ("Wawan", "Raka"),
    ("Lilis", "Sari"),
    ("Baron", "Tegar"),
    ("Winda", "Lala"),
    ("Fajar", "Fikri"),
    ("Amanda", "Citra"),
]

# Internal ids / variable names (whole words only, so e.g. "similar" is untouched).
ID_RENAMES = {
    "mila": "hana", "marzuki": "rafi", "acep": "dimas", "bambang": "bima", "angga": "arya", "fitri": "nadia",
    "wawan": "raka", "lilis": "sari", "baron": "tegar", "winda": "lala", "fajar": "fikri", "amanda": "citra",
}

STAFF = ["Hana", "Rafi", "Dimas", "Bima", "Arya", "Nadia", "Raka", "Sari", "Tegar", "Lala", "Fikri", "Citra", "Penjaga Toko", "Kurir Toko"]
CUSTOMERS = ["Bu Ana", "Bu Dewi", "Pak Budi", "Rio"]
OWNERS = {"Owner typing": (0.82, 0.45), "Owner reading": (0.83, 0.42), "Owner present": (0.13, 0.46)}
LOGOS = {"logo-wa": ("WA", (37, 211, 102)), "logo-ig": ("IG", (225, 48, 108)), "logo-tiktok": ("TT", (20, 20, 20))}
VO_FILES = ["vo_scene01_norm.wav", "vo_scene02_norm.wav", "vo_scene10_norm.wav"]

COPY = ["src", "tools", "public/fonts", "public/sfx", "public/music", "package.json", "package-lock.json", "tsconfig.json", "remotion.config.ts"]
SKIP = {"build_template_kit.py"}


def scrub(text: str) -> str:
    for a, b in REPLACEMENTS:
        text = text.replace(a, b)
    for a, b in ID_RENAMES.items():
        text = re.sub(rf"\b{a}\b", b, text)
        text = re.sub(rf"\b{a.upper()}\b", b.upper(), text)
    return text


def font(size):
    return ImageFont.truetype(str(FONT), size)


def label(draw, w, y, lines, color=(255, 255, 255)):
    for i, (txt, size) in enumerate(lines):
        f = font(size)
        tw = draw.textlength(txt, font=f)
        draw.text(((w - tw) / 2, y + i * size * 1.25), txt, font=f, fill=color)


def robot_placeholder(name, size=(1086, 1448)):
    w, h = size
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.line([(w / 2, 90), (w / 2, 200)], fill=(230, 180, 60, 255), width=14)
    d.ellipse([w / 2 - 34, 56, w / 2 + 34, 124], fill=(230, 180, 60, 255))
    d.rounded_rectangle([170, 190, w - 170, 800], radius=220, fill=(236, 240, 252, 255), outline=(120, 130, 170, 255), width=10)
    d.rounded_rectangle([250, 300, w - 250, 690], radius=150, fill=(14, 20, 44, 255))
    for cx in (w / 2 - 120, w / 2 + 120):
        d.ellipse([cx - 60, 430, cx + 60, 550], outline=(120, 200, 255, 255), width=16)
    d.rounded_rectangle([230, 820, w - 230, 1400], radius=160, fill=(205, 212, 235, 255), outline=(120, 130, 170, 255), width=10)
    label(d, w, 960, [("GANTI GAMBAR", 70), (name, 92)], color=(14, 20, 44))
    return im


def person_placeholder(name, size, phone=None):
    w, h = size
    im = Image.new("RGBA", size, (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.ellipse([w / 2 - 190, 60, w / 2 + 190, 470], fill=(226, 200, 180, 255), outline=(110, 90, 80, 255), width=8)
    d.rounded_rectangle([110, 470, w - 110, h + 200], radius=260, fill=(40, 52, 96, 255), outline=(20, 26, 50, 255), width=8)
    if phone:
        px, py = phone[0] * w, phone[1] * h
        d.rounded_rectangle([px - 70, py - 130, px + 70, py + 130], radius=24, fill=(20, 20, 24, 255), outline=(200, 170, 90, 255), width=8)
    label(d, w, h * 0.55, [("GANTI GAMBAR", 64), (name, 84)])
    return im


def logo_placeholder(text, color):
    im = Image.new("RGBA", (1254, 1254), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([80, 80, 1174, 1174], radius=300, fill=color + (255,), outline=(255, 255, 255, 255), width=30)
    f = font(420)
    tw = d.textlength(text, font=f)
    d.text(((1254 - tw) / 2, 330), text, font=f, fill=(255, 255, 255))
    return im


def silent_wav(path, seconds=1.0, sr=48000):
    path.parent.mkdir(parents=True, exist_ok=True)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(sr)
        w.writeframes(b"\x00\x00" * int(sr * seconds))


def main():
    if DEST.exists():
        shutil.rmtree(DEST)
    DEST.mkdir(parents=True)
    for rel in COPY:
        src = ROOT / rel
        dst = DEST / rel
        if src.is_dir():
            shutil.copytree(src, dst, ignore=lambda d, names: [n for n in names if n in SKIP or n == "__pycache__"])
        else:
            dst.parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(src, dst)
    # scrub every text file
    for p in DEST.rglob("*"):
        if p.is_file() and p.suffix in {".ts", ".tsx", ".py", ".sh", ".json", ".md"} and p.name != "package-lock.json":
            p.write_text(scrub(p.read_text()))
    pkg = DEST / "package.json"
    pkg.write_text(pkg.read_text().replace('"dwa-agent-intelligent-part01"', '"ai-agent-video-template-kit"'))

    clean = DEST / "assets/clean"
    for n in STAFF:
        (clean / "staff").mkdir(parents=True, exist_ok=True)
        if n in ("Penjaga Toko", "Kurir Toko"):
            person_placeholder(n, (1086, 1448)).save(clean / f"staff/{n}.png")
        else:
            robot_placeholder(n).save(clean / f"staff/{n}.png")
    for n in CUSTOMERS:
        (clean / "customers").mkdir(parents=True, exist_ok=True)
        person_placeholder(n, (1086, 1448), phone=(0.8, 0.33)).save(clean / f"customers/{n}.png")
    for n, phone in OWNERS.items():
        (clean / "scene01").mkdir(parents=True, exist_ok=True)
        person_placeholder(n, (1024, 1536), phone=phone).save(clean / f"scene01/{n}.png")
    for n, (txt, col) in LOGOS.items():
        (clean / "logos").mkdir(parents=True, exist_ok=True)
        logo_placeholder(txt, col).save(clean / f"logos/{n}.png")
    for v in VO_FILES:
        silent_wav(DEST / "public/vo" / v)

    shutil.copy2(ROOT / "docs/SKILL_Video_Iklan_AI_Agent_2.5D.md", DEST / "SKILL.md")
    shutil.copy2(ROOT / "docs/template_kit/PANDUAN_PEMBELI.md", DEST / "README.md")
    (DEST / ".gitignore").write_text("node_modules/\nout/\npublic/clean/\n.remotion/\n")
    print("kit built at", DEST)


if __name__ == "__main__":
    main()
