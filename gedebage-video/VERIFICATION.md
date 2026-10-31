# VERIFICATION — Tanah Gedebage (status: PREVIEW, belum lolos semua gate)

Tanggal cek: 2026-10-31. Sumber geografis: OpenStreetMap (Nominatim + ekstrak peta), Wikidata, id.wikipedia.

## 1. Lokasi plot dari screenshot

**Terkonfirmasi (cocok dengan peta OSM bergeoreferensi):**
- Rel kereta yang terlihat = **Jalur KA Padalarang–Kasugihan** (OSM way 990499159 / 1303922765), arah WNW–ESE, sama seperti di screenshot.
- Jalan beton 2 lajur di selatan rel yang membelok ke tenggara = jalan tersier OSM way 566519268 / 1058878057 (bentuk beloknya sama).
- Penanda "Haji AlQosbah" = **Plaza (Haji) Al Qosbah**, Jl. Gedebage Utama Kav 7–9, Cimincrang, Gedebage, Kota Bandung (OSM way 1479727671). Ukuran parsel OSM (~73 × 155 m) cocok dengan kompleks gedung putih di screenshot (~77 × 143 m menurut skala 100 m).
- Sawah di utara rel yang diapit perumahan = petak farmland OSM (way 1558926845 dkk.).
- Plot berada di sisi timur poligon "scrub" OSM way 1479165617, persis di timur Plaza Al Qosbah dan di selatan jalan.

**Perkiraan (bukan data survei):**
- Sudut plot dipetakan dari piksel screenshot ke koordinat dengan fit similaritas 4 titik ke poligon OSM 1479165617 (residual ≤ 4 m, skala 0,45 m/px — cocok dengan skala bar 100 m di screenshot, rotasi ~8°).
- Titik tengah plot: **−6.948833, 107.709598** (ketelitian kira-kira ±10–20 m).
- Sudut (lon, lat): (107.709513, −6.948271), (107.709835, −6.948406), (107.709630, −6.949327), (107.709412, −6.949330).
- Luas hasil tracing: **±3.390 m²** vs klaim penjual 3.200 m² (selisih ~6%, masih dalam galat tracing). Luas resmi tetap mengacu SHM/ukur BPN.

**Belum terkonfirmasi:** batas legal, nomor SHM, akses jalan resmi, kepemilikan. Butuh pin Google Maps / KML / koordinat dari penjual untuk memastikan poligon.

## 2. Jarak landmark (garis lurus dari titik tengah plot perkiraan)

| Landmark | Koordinat sumber | Jarak terukur | Klaim penjual | Status |
|---|---|---|---|---|
| Masjid Raya Al Jabbar | OSM way 761092783 (−6.94809, 107.70350) | ±680 m ke tengah masjid (±610 m ke sisi timur gedung) | ~500 m | Klaim lebih dekat dari hasil ukur |
| Stasiun Cimekar (gedung baru) | OSM way 1149442988 (−6.94902, 107.71239) | ±310 m | ~200 m | Klaim lebih dekat |
| Stadion GBLA | OSM way 244493457 (−6.95756, 107.71205) | ±1,0 km ke tengah (±870 m ke tepi utara) | ~500 m | **Klaim jauh lebih dekat — jangan dipakai** |
| Summarecon Bandung | OSM relation 20228846 (kawasan; centroid −6.95622, 107.69512) | ±1,8 km ke titik tengah kawasan | ~1 km | Tidak bisa diverifikasi tanpa titik acuan spesifik (mal/gerbang?) → ditampilkan "menurut penjual" |
| Stasiun Whoosh Tegalluar Summarecon | id.wikipedia (−6.96382, 107.71471) | ±1,8 km | ~1,5 km | Klaim lebih dekat |

Semua angka di atas adalah **jarak garis lurus**, bukan jarak tempuh jalan. Jarak jalan belum dihitung (layanan routing diblokir dari container).

## 3. Gate yang belum lolos
- [ ] Koordinat/pin resmi dari penjual
- [ ] Foto landmark terunduh ke `assets/photos/` (lisensi sudah dicek, unduhan diblokir jaringan)
- [ ] Foto berlisensi Summarecon Bandung (belum ditemukan)
- [ ] Basemap satelit berlisensi komersial (preview memakai peta vektor OSM)
- [ ] Konfirmasi SHM, luas, harga, kontak CTA
- [ ] Persetujuan pemakaian jarak terukur vs klaim penjual
