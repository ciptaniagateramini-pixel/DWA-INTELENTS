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
