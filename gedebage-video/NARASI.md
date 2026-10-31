# Naskah Narasi (VO) — 28 detik

Gaya: narator wanita, bersemangat, hangat, nada edukasi.

| Waktu | Adegan | Teks |
|---|---|---|
| 00:00.3 – 00:03.7 | Peta Indonesia → zoom ke Bandung | Ini waktu yang tepat, untuk para investor!! |
| 00:04.2 – 00:10.0 | Bandung → zoom masuk ke tanah | Kota Bandung, kota unik. Dengan sejuta potensi bisnis… |
| 00:11.3 – 00:18.0 | Zoom out, pop-up landmark | Investasi aset di kota Bandung tinggal selangkah lagi. |
| 00:20.0 – 00:25.4 | Papan semua landmark → kembali ke tanah | Sekarang kamu cukup hubungi penjual tangan pertamanya dulu. |
| 00:25.7 – 00:27.9 | Penutup harga + CTA | Tanya-tanya, survei, deal! |

## Status audio
Sumber: `public/narasi.mp3` = "New tts node.mp3" dari Google Drive pengguna (file id 1UlSgahpf8e5ufkZTh0X8NvDr-0LKnpob), mono 44,1 kHz, 18,5 dtk.

File dipotong di jeda alami (ffmpeg `silencedetect`, −35 dB, ≥0,25 dtk) dan tiap kalimat ditempatkan pada adegannya:

| Kalimat | Potongan di file | Mulai di video |
|---|---|---|
| 1 | 0,00 – 3,39 dtk | 0,4 dtk |
| 2 | 3,39 – 8,13 dtk | 4,3 dtk |
| 3 | 8,13 – 11,76 dtk | 11,3 dtk |
| 4 | 11,76 – 15,45 dtk | 20,0 dtk |
| 5 | 15,45 – 18,52 dtk | 24,6 dtk |

Pemetaan kalimat ditentukan dari pola jeda, bukan transkripsi — cek ulang saat menonton. Atur di `NARRATION` (`src/config.ts`).
