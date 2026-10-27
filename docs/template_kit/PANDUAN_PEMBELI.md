# AI Agent Video Template Kit — Panduan Pembeli

Template untuk membuat video iklan vertikal (1080×1920, 30 fps) bergaya **2.5D Dynamic Tech Motion**:
Owner bisnis memberi perintah lewat HP, lalu tim "AI staff" menyala, mengalirkan energi, dan menyelesaikan pekerjaan.

Isi kit:
- **12 scene siap pakai** (`src/scenes/Scene01.tsx` … `Scene12.tsx`) + master gabungan.
- **Komponen animasi** (`src/components/`): kartu agen, aliran energi, bubble chat, kamera, judul, ikon.
- **Skrip produksi** (`tools/`): hapus latar gambar, buat SFX & musik, gabung master, naikkan volume.
- **Font Poppins** (OFL), **SFX & musik** buatan sendiri (bebas komersial).
- **SKILL.md** — panduan lengkap untuk Claude Code (taruh di `.claude/skills/video-iklan-ai-agent-25d/SKILL.md`).

Semua gambar karakter & logo di kit ini adalah **gambar contoh bertulisan "GANTI GAMBAR"**. VO di kit ini adalah **audio hening**.

---

## 1. Yang perlu disiapkan

| Kebutuhan | Keterangan |
|---|---|
| Node.js 18+ dan FFmpeg | untuk render video |
| Python 3 + `pip install "rembg[cpu]" pillow numpy` | untuk hapus latar gambar (opsional) |
| Claude Code (disarankan) | supaya tinggal memberi perintah dalam bahasa biasa |
| Gambar karakter kamu | Owner (3 pose: memperlihatkan HP, mengetik, membaca pesan) + staf/robot |
| Logo kanal | WA / IG / TikTok / aplikasi kamu |
| Suara (opsional) | akun ElevenLabs berbayar, atau rekaman suara sendiri |

## 2. Mulai cepat

```bash
npm install
npm run studio                                   # pratinjau semua scene di browser
npx remotion render src/index.ts Scene04 out/Scene04.mp4
```

## 3. Mengganti aset

Taruh gambar kamu (PNG transparan) dengan **nama file yang sama** seperti gambar contoh:

| Folder | Isi |
|---|---|
| `assets/clean/scene01/` | `Owner present.png`, `Owner typing.png`, `Owner reading.png` |
| `assets/clean/staff/` | 12 staf/robot (Hana, Rafi, Dimas, Bima, Arya, Nadia, Raka, Sari, Tegar, Lala, Fikri, Citra) + `Penjaga Toko.png`, `Kurir Toko.png` |
| `assets/clean/customers/` | `Bu Ana.png`, `Bu Dewi.png`, `Pak Budi.png`, `Rio.png` |
| `assets/clean/logos/` | `logo-wa.png`, `logo-ig.png`, `logo-tiktok.png` |

Gambar masih berlatar putih? Jalankan:
```bash
python3 tools/remove_bg.py "path/ke/gambar.png"      # hasil RGBA bersih, tanpa halo putih
python3 tools/qa_matte.py "assets/clean/staff/Hana.png" cek.jpg   # cek tepi di latar gelap/terang
```

Ingin memakai nama karakter sendiri? Ubah nama di file scene (cari nama lama, ganti) **dan** samakan nama file gambarnya.
Posisi HP di tiap pose Owner diatur di `src/components/OwnerFront.tsx` (`OWNER_POSES`) — sesuaikan jika HP di gambarmu berada di posisi lain.

## 4. Mengganti teks

Semua teks ada di file scene masing-masing (judul, bubble chat, label peran, CTA). Contoh:
- Nama bisnis & brand: cari `NAMA BISNIS` dan `BRAND`.
- Nomor WA di end card: `WA_NUMBER` di `src/scenes/Scene12.tsx`.
- Balasan robot: `REPLIES` di `src/scenes/Scene10.tsx`.

## 5. Mengganti suara

Taruh file suara di `public/vo/` dengan nama yang sama (`vo_scene01_norm.wav`, `vo_scene02_norm.wav`, `vo_scene10_norm.wav`), atau ubah path-nya di scene.
Samakan volume dulu:
```bash
ffmpeg -i suara-asli.m4a -af "highpass=f=70,loudnorm=I=-16:TP=-1.5" -ar 48000 -ac 1 public/vo/vo_scene01_norm.wav
```
Scene 09 punya slot VO opsional: isi `VO_FILE` di `src/scenes/Scene09.tsx`.

## 6. Render & gabung master

```bash
npm run assets                                    # salin assets/clean -> public/clean
for s in 01 02 03 04 05 06 07 08; do npx remotion render src/index.ts Scene$s out/Scene$s.mp4; done
tools/assemble_master.sh                          # -> out/master_part1.mp4 (55 detik)
tools/loudness.sh out/master_part1.mp4 out/master_part1_final.mp4   # volume standar sosial (-14 LUFS)
```
Gabungan lain: `tools/assemble.sh out/NAMA.mp4 09:8 10:12 11:12 12:10` (nomor scene : detik).

SFX & musik bisa dibuat ulang/divariasikan:
```bash
python3 tools/make_sfx.py      # whoosh, pop, typing, ting, zap, hum, sync, send
python3 tools/make_music.py    # musik outro 10 detik
```

## 7. Memakai dengan Claude Code

1. Salin `SKILL.md` ke `.claude/skills/video-iklan-ai-agent-25d/SKILL.md` di proyekmu.
2. Beri Claude storyboard per scene (durasi, siapa tampil, teks persis, VO ya/tidak).
3. Claude akan mengaudit aset, membuat tes 3 detik, lalu memproduksi scene sesuai metode di skill.

## 8. Lisensi

- Kode, skrip, SFX, dan musik dalam kit ini: boleh dipakai untuk proyek komersial kamu dan klienmu.
- Font Poppins: SIL Open Font License (`public/fonts/OFL.txt`).
- **Tidak boleh** menjual ulang kit ini sebagai template/produk digital.
- Gambar karakter, logo, foto, dan suara yang kamu masukkan adalah tanggung jawab dan milikmu/klienmu.
- Logo platform (WhatsApp, Instagram, TikTok) tunduk pada pedoman merek masing-masing platform.
