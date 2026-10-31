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
Belum ada file suara: ElevenLabs menolak (akun free tier dinonaktifkan karena "unusual activity"), vidIQ kehabisan kredit, dan container tidak punya mesin TTS. Video v1 memakai caption narasi tanpa audio.

## Cara memasang suara
1. Rekam / generate VO (≤ 28 dtk), simpan sebagai `public/narasi.mp3`.
2. Di `src/config.ts` ubah `export const VOICEOVER: string | null = null;` menjadi `'narasi.mp3'`.
3. Bila perlu, geser waktu caption di `NARRATION` agar pas dengan rekaman.
4. `npm run render`.
