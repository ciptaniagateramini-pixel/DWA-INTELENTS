# Gedebage Property Video (Remotion)

Video portrait 1080×1920, 30 fps, 28 s (840 frame). Status: **preview** — lihat `VERIFICATION.md` dan `ASSET_CREDITS.md`.

```bash
npm install
npm run studio                 # preview interaktif
npm run stills                 # 6 still review → output/preview/
node scripts/prepare-data.mjs  # bangun ulang garis negara Natural Earth
npm run render                 # render final (JANGAN sebelum semua gate lolos)
```

Struktur:
- `src/config.ts` — semua teks, timing, kamera, landmark (data-driven)
- `src/geo.ts` — proyeksi Web Mercator + interpolasi kamera
- `src/components/` — `MapSequence`, `LandPolygon`, `AnimatedPin`, `LandmarkConnector`, `LandmarkPhotoCard`, `AllLandmarksBoard`, `Headline`, `PriceCTA`
- `assets/data` — data geografis OSM / Natural Earth; `assets/photos` — foto berlisensi (belum ada)

Untuk memasang foto: taruh file di `public/` lalu isi `photo: {file: staticFile('...'), credit: '...'}` pada landmark di `src/config.ts`.

## Status render v1
- `output/gedebage_final_v1_1080x1920.mp4` — 28 s, 1080×1920, 30 fps, H.264.
- Narasi tampil sebagai caption; **belum ada audio** (lihat `NARASI.md`).
- Foto landmark masih **placeholder** (unduhan Wikimedia diblokir jaringan) — jangan dipublikasikan sebelum foto & data penjual dikonfirmasi (lihat `VERIFICATION.md`).

## Gaya 2 — Satelit + Roadmap Tour (disetujui)
- Komposisi `GedebageSatelit` (`src/satellite/`), 47,3 dtk, 1420 frame.
- Render: `npx remotion render src/index.ts GedebageSatelit output/gedebage_gaya2_satelit_final_1080x1920.mp4 --crf=17`
- Still review: `node scripts/render-sat-stills.mjs [frame,frame,...]`
- Efek suara: `scripts/make-sfx.sh` (disintesis ffmpeg, bebas lisensi) → `public/sfx/`.
- Visual: ilustrasi AI dari Google Drive pengguna (`assets/drive/`, salinan kerja di `public/sat` & `public/pop`).
- Jarak landmark: listing penjual; arah mengikuti posisi asli (lihat `VERIFICATION.md`). UIN = UIN Sunan Gunung Djati kampus Cibiru (±2 km).
- Teks, jarak, info landmark, harga: `src/satellite/satConfig.ts`.
