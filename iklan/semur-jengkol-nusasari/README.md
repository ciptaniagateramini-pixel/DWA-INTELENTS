# Iklan Semur Jengkol Nusasari

Video iklan 9:16 (1080x1920, 30 fps, 32 detik) dirender dengan paket `iklan-pop`.

- `semur-jengkol-nusasari_hasil.mp4`: video final, siap unggah ke TikTok/Reels
- `project.json`: adegan dan subtitle (waktu disinkronkan ke rekaman `Jengkol suara.mp3`)
- `nusasari.json`: preset gaya marun-emas mengikuti warna label kemasan
- `prep.py`: garis putih ala stiker (`outline`), dan `clean2.py` untuk menghapus latar kotak-kotak pada foto kemasan Cabe Ijo. Keduanya pengganti `prep_assets.py` yang tidak butuh OpenCV

Aset foto ada di folder Google Drive "Semur Jengkol".
Render ulang: taruh aset hasil prep di `assets/` dan `suara.mp3` di folder ini, lalu jalankan
`python3 iklan-pop/scripts/build.py project.json`.

## Versi dengan outro
`semur-jengkol-nusasari_dengan-outro.mp4` (40,8 detik) adalah iklan utama ditambah outro TS
(`outro_typo.mp4` dari Drive, 8,4 detik) yang disambung di ujung video.
