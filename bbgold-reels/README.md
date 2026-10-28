# bb gold Reels: "bb gold Flat Motion"

Template video Reels 1080x1920, 30 fps, sesuai master brief. Satu template; tiap video cukup mengganti file data.

## Render
```
node render/render.mjs data/emas-vs-tanah.json             # video + cover + cek crop 3:4
node render/render.mjs data/emas-vs-tanah.json --preview --at=1.5,9.4   # cek frame tertentu
```
Butuh Node 18+, Playwright (Chromium), dan ffmpeg.

Hasil di `render/`:
- `<id>.mp4`: H.264 + AAC 48 kHz, loudness sekitar -14 LUFS
- `<id>-cover.png` dan `<id>-cover-crop-check.png` (garis crop grid profil 3:4)
- `<id>.timeline.json`: waktu adegan, gerak kamera, dan daftar SFX beserta gain-nya

## Struktur
- `tokens.json`: warna, ukuran, easing, durasi, aturan audio. Semua warna diambil dari sini.
- `engine/`: template HTML dan mesin timeline (kamera virtual, animasi masuk/keluar, validasi jarak SFX).
- `scenes/`: Hook, Judul, Nilai, Poin, Poin2, Kesimpulan, Outro, Cover.
- `data/<id>.json`: teks per adegan. Waktu ditulis sebagai referensi kata, misalnya `{"w": "tanah", "n": 1}`
  (kemunculan kedua kata "tanah"), lalu diambil dari `data/<id>.words.json`.
- `assets/audio/`: `narasi.wav` (final), `whoosh-1/2.wav`, `pop.wav`, plus file mentah dari ElevenLabs.

## Aturan yang dijalankan otomatis
- `ctx.focus(el, t)`: kamera zoom 1.0 ke 1.2 dalam 0,45 dtk (ease-out), menahan 0,7 dtk, lalu kembali dalam 0,6 dtk (ease-in-out).
  Kamera tidak kembali dulu kalau kata kunci berikutnya langsung menyusul. Whoosh dimulai 0,10 dtk sebelum gerakan.
- `ctx.pop(t)`: pop tepat di frame pertama kartu, chip, atau ikon muncul.
- Whoosh 1 dan 2 dipakai bergantian. Volume ±1 dB dan pitch ±3% divariasikan. SFX berada 15 dB di bawah puncak narator.
- Render dihentikan kalau ada dua SFX yang jaraknya kurang dari 0,15 dtk.

## Video baru
1. Buat narasi di flow ElevenLabs, simpan di `assets/audio/`, lalu transkripsi dengan timestamp kata ke `data/<id>.words.json`.
2. Salin `data/emas-vs-tanah.json`, lalu ganti teks dan referensi katanya.
3. Jalankan render.
