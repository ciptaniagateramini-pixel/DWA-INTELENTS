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
