# DWA AGENT INTELLIGENT — PART 01 · Audit Aset (Quality Gate A)

Tanggal: 2026-10-27 · Sumber: Google Drive folder `PART 01 — INTRODUCTION` (diakses via konektor Google Drive).
File asli tidak diubah. Turunan transparan ada di `assets/clean/` (PNG RGBA).

Metode: alpha diperiksa per-piksel (bukan dari ekstensi file). Latar dihapus dengan rembg **BiRefNet-general**
+ dekontaminasi warna tepi (menghapus sisa putih pada piksel semi-transparan). QA: tiap cutout dicek
di latar navy gelap, kuning, dan terang, serta crop tepi 200% (rambut, tangan/jari, aksesori).

## Scene 01 — Owner (folder `SCENE 01 — OWNER`)

| File asli | Format / ukuran | Alpha asli | Status | Turunan bersih | Catatan |
|---|---|---|---|---|---|
| Ownerbb-Melihatkan hp.jpeg | JPEG RGB 1024×1536 | tidak ada (latar putih) | FIX → PASS | `assets/clean/scene01/Ownerbb-Melihatkan hp.png` | Rambut & jari bersih, tanpa halo. Figur terpotong di pinggang & tangan kiri menyentuh tepi kiri sejak file asli. |
| Ownerbb mengetik pesan.png | PNG RGB 1024×1536 | tidak ada (latar putih) | FIX → PASS | `assets/clean/scene01/Ownerbb mengetik pesan.png` | Bersih. Terpotong di pinggang (asli). |
| Ownerbb-melihat pesan.png | PNG RGB 1024×1536 | tidak ada (latar putih) | FIX → PASS | `assets/clean/scene01/Ownerbb-melihat pesan.png` | Bersih. Terpotong di pinggang (asli). |

## Scene 02 / 03 — AI Staff + peran toko (folder `SCENE 02 — AI STAFF`, `SCENE 03 — STRUKTUR`)

| File asli | Format / ukuran | Alpha asli | Status | Turunan bersih | Catatan |
|---|---|---|---|---|---|
| Acep.png | PNG RGB 1086×1448 | tidak ada | FIX → PASS | `assets/clean/staff/Acep.png` | |
| Marzuki.png | PNG RGB 1086×1448 | tidak ada | FIX → PASS | `assets/clean/staff/Marzuki.png` | |
| Bu Mila.png | PNG RGB 1086×1448 | tidak ada | FIX → PASS | `assets/clean/staff/Bu Mila.png` | |
| Fitri.png | PNG RGB 1086×1448 | tidak ada | FIX → PASS | `assets/clean/staff/Fitri.png` | |
| Wawan.png | PNG RGB 1086×1448 | tidak ada | FIX → PASS | `assets/clean/staff/Wawan.png` | Bantal biru menyentuh tepi kiri/kanan (asli). |
| Lilis.png | PNG RGB 1086×1448 | tidak ada | FIX → PASS | `assets/clean/staff/Lilis.png` | Figur anak kecil di pelukan Lilis adalah bagian aset, dipertahankan. |
| Baron.png | PNG RGB 1086×1448 | tidak ada | FIX → PASS | `assets/clean/staff/Baron.png` | |
| Angga.png | PNG RGB 1086×1448 | tidak ada | FIX → PASS | `assets/clean/staff/Angga.png` | |
| Winda.png | PNG RGB 1086×1448 | tidak ada | FIX → PASS | `assets/clean/staff/Winda.png` | |
| Fajar.png | PNG RGB 1086×1448 | tidak ada | FIX → PASS | `assets/clean/staff/Fajar.png` | |
| Amanda.png | PNG RGB 1086×1448 | tidak ada | FIX → PASS | `assets/clean/staff/Amanda.png` | |
| Bambang.png | PNG RGBA 1143×1376 | **ada, valid** (42% transparan) | PASS | `assets/clean/staff/Bambang.png` | Alpha asli dipakai. Figur menyentuh 4 tepi kanvas asli → turunan diberi margin transparan 40 px agar bayangan tidak terpotong. Gaya visual berbeda (robot merah full-body) dari 11 robot lain — sesuai aset asli, tidak diubah. |
| Penjaga Toko.png | PNG RGBA 1024×1536 | **ada, valid** (46% transparan) | PASS | `assets/clean/staff/Penjaga Toko.png` | Manusia (peran toko), bukan robot. Terpotong di paha (asli). |
| Kurir Toko.png | PNG RGB 1086×1448 | tidak ada | FIX → PASS | `assets/clean/staff/Kurir Toko.png` | Manusia (peran toko). Terpotong di paha (asli). |

Tidak ada aset yang rusak/BLOCKED. Semua file terbaca, resolusi ≥1024 px sisi pendek.

## Aset lain di folder utama (tidak diproses)

- Customer: `Adrian.png`, `Pak Tata.png`, `Ibu Wiwi.png`, `Ibu Rina-Pelanggan via WA.png` — **tidak dipakai** (Scene 03 dilarang menampilkan customer).
- Logo: `WA Logo No Background.png`, `Logo TikTok No Background.png`, `Logo Insta No Background.png` — belum diperlukan; bisa dipakai sebagai ikon kecil pada chip Fitri/Wawan/Lilis di Scene 03 bila disetujui.
- Folder utama juga berisi salinan identik (ukuran byte sama) dari aset scene.

## Lingkungan produksi

| Komponen | Status |
|---|---|
| Google Drive | ✅ Bisa baca & unduh (via konektor). Unduhan langsung via URL diblokir proxy, jadi semua lewat konektor. |
| Remotion 4.0.290 + Chromium headless + FFmpeg 6.1 | ✅ Render H.264 1080×1920 30 fps terverifikasi |
| Font Poppins (Medium/SemiBold/Bold/ExtraBold, OFL) | ✅ Lokal di `public/fonts/`, dimuat sebelum render |
| ElevenLabs | ✅ Terhubung; 21 suara pria berbahasa Indonesia tersedia. **Belum ada kredit yang dipakai** (sample suara = Quality Gate C). |
| SFX | ✅ Disintesis sendiri (`tools/make_sfx.py`): whoosh, pop, typing, ting — bebas lisensi |

## Catatan / keputusan terbuka

1. Penjaga Toko & Kurir Toko adalah manusia, tetapi tercantum dalam hierarki Scene 03 — akan ditampilkan sebagai staf toko (bukan customer). Mohon konfirmasi.
2. Urutan kedatangan 12 robot Scene 02 akan dicatat saat produksi Scene 02.
