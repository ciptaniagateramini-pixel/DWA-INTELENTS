---
name: video-iklan-ai-agent-25d
description: Produksi video iklan vertikal (9:16) bergaya "Dynamic Tech Motion" 2.5D dari aset karakter 2D milik klien — Owner/pemilik bisnis memberi perintah lewat HP dan tim "AI staff" (robot/karakter) menyala, mengalirkan energi, dan menyelesaikan pekerjaan. Pakai skill ini saat diminta membuat video promosi AI agent / otomasi bisnis / struktur tim, dengan Remotion + FFmpeg, voice-over (ElevenLabs atau rekaman), SFX dan musik sintetis bebas lisensi, sampai MP4 final yang terverifikasi.
---

# SKILL TEMPLATE — Video Iklan "AI Agent" 2.5D (Remotion)

> Template produksi siap pakai. Ganti semua `{PLACEHOLDER}` dengan data klien.
> Hasil yang dibuktikan dengan template ini: master 55 detik (8 scene) dan master 42 detik (4 scene),
> 1080×1920, 30 fps, H.264, audio -14 LUFS.

---

## 1. Peran & aturan kerja

Kamu adalah **eksekutor produksi animasi**, bukan creative director.

1. **Jangan mengganti karakter.** Wajah, bentuk, warna, seragam, nama, dan properti karakter klien harus dipertahankan. Jangan membuat robot/karakter pengganti dengan AI.
2. **Jangan mengubah dialog/VO.** Teks bertanda "EXACT" dipakai persis. Typo hanya dibetulkan jika klien meminta — catat setiap koreksi.
3. **Jangan mengarang isi.** Kalau sebuah teks/alur tidak ada di brief (mis. balasan chat, nomor booking), pakai ikon/visual tanpa teks, atau tulis placeholder netral dan **laporkan** agar klien bisa mengganti.
4. **Jangan mengklaim selesai tanpa file nyata.** Setiap render diperiksa: jumlah frame, durasi, frame awal/tengah/akhir, level audio.
5. **Jangan diam-diam mengganti penyedia suara.** Jika ElevenLabs tidak tersedia, laporkan dan minta file audio.
6. Komunikasi progres dalam bahasa klien ({BAHASA_KLIEN}); laporan ringkas, blocker disebut paling atas.

---

## 2. Input yang wajib diminta dari klien

| Input | Contoh | Catatan |
|---|---|---|
| Nama brand & bisnis | `{BRAND}` x `{BISNIS}` | dipakai di end card |
| Aset karakter Owner | 2–3 pose: memperlihatkan HP, mengetik, membaca pesan | PNG/JPEG, idealnya ≥1024 px |
| Aset AI staff | 1 file per karakter + nama + peran | contoh: `{ROBOT_1}` = HRD hub |
| Hierarki | siapa melapor ke siapa | gambar/teks pohon struktur |
| Logo kanal | WA / IG / TikTok / aplikasi | PNG transparan bila ada |
| Aset customer (opsional) | persona pelanggan | tanyakan izin pemakaian per scene |
| Storyboard per scene | durasi, siapa tampil, teks EXACT, VO EXACT | tolak mengarang bila kosong |
| VO | naskah EXACT + gender/usia/gaya | atau file rekaman |
| CTA | link bio, nomor WA | verifikasi ulang nomor sebelum render |

Template pertanyaan storyboard per scene:
```
Scene {N}
1. Durasi (detik):
2. Siapa yang tampil & apa yang terjadi:
3. Teks di layar / chat (persis):
4. VO ya/tidak (naskah persis):
5. Aset customer boleh tampil? ya/tidak
```

---

## 3. Spesifikasi teknis

- **Kanvas:** 1080×1920 (9:16), 30 fps, H.264 yuv420p CRF 16, AAC 48 kHz.
- **Framework:** Remotion 4 + React 18 + TypeScript; animasi deterministik per frame (`useCurrentFrame`, `spring`, `interpolate`).
- **Font:** Poppins 500/600/700/800 (OFL) disimpan lokal di `public/fonts/` dan dimuat dengan `delayRender` sebelum frame pertama.
- **Loudness akhir:** -14 LUFS integrated, -1 dBTP (standar TikTok/Reels/Shorts).
- **Satu scene = satu komposisi Remotion**; master = gabungan file MP4 scene.

---

## 4. Alur produksi (quality gates)

### Gate A — Audit aset
1. Inventaris semua file berdasarkan nama asli; cek dapat dibaca, resolusi, mode warna.
2. **Cek alpha per piksel** (bukan dari ekstensi). PNG bisa saja berlatar putih; JPEG selalu opaque.
3. Hapus latar **non-destruktif**: original tidak disentuh, turunan RGBA ke `assets/clean/`.
   - Model: rembg **BiRefNet-general**, lalu **dekontaminasi tepi** (un-premultiply latar putih dari piksel semi-transparan) → tanpa halo putih.
   - Jalankan **satu file per proses** (batch panjang bisa berhenti karena memori).
   - Aset yang sudah punya alpha valid → pakai apa adanya; beri margin transparan jika figur menempel tepi kanvas.
4. QA matte: tempel di latar navy, kuning, dan terang + crop tepi 200% (rambut, jari, aksesori).
5. Tabel PASS / FIX / BLOCKED per aset + path turunan.

### Gate B — Tes 2–3 detik
Render potongan pertama Scene 1 (1 karakter bersih, gerak kamera, bayangan, judul). Minta persetujuan gaya sebelum produksi penuh.

### Gate C — Audio
- VO: ukur durasi file, cari rentang suara (RMS per 100 ms / `silencedetect`), cocokkan dengan slot scene. **Jangan mempercepat audio**; jika tidak muat, laporkan selisihnya dan beri opsi.
- Normalisasi VO: `highpass=70, loudnorm I=-16`.
- SFX & musik: sintesis sendiri (lihat §8) → bebas lisensi.

### Gate D — Preview per scene
Render tiap scene, periksa still frame kunci, minta review.

### Gate E/F — Final & verifikasi
- Gabung scene → master; kunci jumlah frame tepat.
- Verifikasi: `ffprobe` frame & durasi, cuplikan frame di setiap sambungan scene, ejaan teks, semua karakter hadir, arah aliran energi, level audio.
- Naikkan loudness master ke -14 LUFS (two-pass loudnorm, video stream-copy).

---

## 5. Sistem visual

| Elemen | Spesifikasi |
|---|---|
| Latar | radial gradient navy `#1B2A6B → #0A1230 → #050916`, grid lantai perspektif kuning tipis, vignette |
| Aksen | blob kotak membulat kuning mengilap (`#FFE27A → #FFC928 → #F5A800`, inner highlight + shadow), melayang dengan parallax |
| Karakter | cutout + drop-shadow lembut + rim glow; tepi potongan pinggang di-*fade* dengan mask; napas & bob halus |
| Panel karakter | plate kuning mengilap di belakang robot; plate merah untuk kepala divisi yang perlu menonjol |
| Kartu agen | kaca navy, border menyala saat dialiri energi, flash putih + spring scale |
| Energi | garis elbow, kepala pulsa putih bercahaya; setelah tersambung, pulsa kecil terus mengalir (looping) |
| Paket | ikon glossy (konten, transaksi, iklan, prospek, dokumen) yang meluncur di jalur energi |
| Chat | bubble masuk (putih, nama pengirim, centang) & bubble keluar (hijau); tumbuh dari posisi HP |
| Tipografi | Poppins Bold; judul di panel kaca gelap; kata muncul per-kata dengan spring |
| Kamera | 2.5D: zoom/pan dunia dengan easing `inOut(cubic/sin)`, parallax latar vs karakter, roll ±0.6° |

> Jujur soal 2.5D: PNG tidak bisa diputar sebagai model 3D. Kedalaman berasal dari parallax, bayangan, blur kedalaman, dan pencahayaan.

---

## 6. Arsitektur kode (Remotion)

```
src/
  theme.ts                 ukuran, fps, warna, font
  Root.tsx                 daftar komposisi (Scene01..N, master)
  components/
    Fonts.tsx              memuat Poppins lokal + delayRender
    Background.tsx         latar navy + grid + blob parallax
    Character.tsx          karakter + plate + rim light + fokus/defocus
    OwnerFront.tsx         Owner di depan, pose → posisi HP (phoneOf)
    RobotHero.tsx          robot besar di plate, menyala pada frame `at`
    AgentCard.tsx          kartu kaca + badge logo + bar sync & centang
    Energy.tsx             EnergyLink (jalur + pulsa + paket), pointAt/pathD
    SpeechBubble.tsx       bubble tumbuh dari titik asal, opsi typing dots
    Title.tsx              judul pop per kata, `breakAfter` untuk baris
    Icons.tsx              ikon glossy SVG (tanpa aset eksternal)
  scenes/SceneNN.tsx       satu file per scene, timeline di objek `T`
tools/
  remove_bg.py             cutout + dekontaminasi tepi
  qa_matte.py              lembar QA matte
  make_sfx.py              sintesis SFX
  make_music.py            sintesis musik outro
  assemble.sh              gabung scene → master (frame-exact)
  loudness.sh              two-pass loudnorm -14 LUFS
```

Pola timeline per scene:
```ts
const T = {chat: 30, beam: 44, hub: 62, children: 80, loop: 120};
// semua animasi dihitung dari frame ini → mudah digeser, deterministik
```

Posisi HP per pose (fraksi kotak gambar) — agar bubble & energi keluar tepat dari HP:
```ts
typing:  [0.82, 0.45]   reading: [0.83, 0.42]   present: [0.13, 0.46]
```

---

## 7. Resep scene (bisa dirakit ulang)

| Resep | Isi | Durasi wajar |
|---|---|---|
| **Perkenalan Owner** | 3 pose dalam satu dunia; kamera pindah fokus; judul + bubble dari HP | 8 dtk |
| **Barisan AI staff** | robot datang tiap 0,5 dtk (pop + spring), grid rapi, header & footer; kamera dijaga tidak menutup header | 10 dtk |
| **Struktur kerja** | pohon hierarki; energi mengalir dari atas; kartu menyala; jalur khusus putus-putus emas; zoom-out akhir | 12 dtk |
| **Perintah → rantai agen** | Owner di depan, rantai agen di belakang (parallax); chat dari HP; energi berantai; kanal menyala dengan bar sync + centang | 5–7 dtk |
| **Riset → produksi konten** | ikon riset mengorbit; robot konten memproduksi (tile + progress ring + REC) | 5 dtk |
| **Pantulan ke Owner** | tampilan berbeda (wash magenta + streak); sinar bezier langsung ke HP; paket konten masuk; Owner membalas | 4 dtk |
| **Broadcast database** | tim marketing di tengah; 50+ node kontak; pesan terbang melengkung; kontak menyala bergelombang | 4 dtk |
| **Customer → kanal → robot** | kamera berjalan per pasangan; bubble percakapan; robot menyala saat pesan tiba; akhir: semua dalam 1 frame | 8 dtk |
| **Balas → proses → serah** | kutipan pesan menyusut, balasan robot, badge proses → hasil, paket ke tujuan (toko/kurir/follow-up) | 12 dtk |
| **Rekap data** | hub di tengah, 10 sumber mengalirkan paket; bar kategori terisi; laporan meluncur ke HP; bubble penutup | 12 dtk |
| **End card CTA** | highlight brand + kilau; baris tanya di blok; blok CTA kuning + logo WA + nomor; parade karakter; musik | 10 dtk |

---

## 8. Audio bebas lisensi (sintesis Python/numpy)

| SFX | Resep |
|---|---|
| whoosh | noise band-pass sweep 300→3200 Hz, envelope sin² |
| pop | sinus pitch-drop 900→180 Hz + klik noise |
| typing | 7 klik noise + tone 2,4 kHz |
| ting | dua lonceng (1318 & 1975 Hz, parsial 2,76× & 5,4×) |
| zap | chirp turun + crackle |
| hum | 55/110/165 Hz termodulasi + noise pita sempit |
| sync | 3 nada naik (C6–E6–G6) |
| send | noise sweep 600→6000 Hz + chirp |

Musik outro: 112 BPM, progresi C–G–Am–F; pad detune, arpeggio 16-an stereo, bass 8-an, kick/clap/hat; fade-in 0,3 dtk, fade-out 1,2 dtk.
Campuran: VO ±1.0, SFX 0,2–0,45, hum 0,16–0,22, musik 0,55.

---

## 9. Penggabungan master (frame-exact)

```bash
tools/assemble.sh "out/{NAMA_MASTER}.mp4" 01:8 02:10 03:12 ...
tools/loudness.sh "out/{NAMA_MASTER}.mp4" "out/{NAMA_MASTER}_-14LUFS.mp4"
```
- Video: concat filter + `-frames:v total*30`, re-encode sekali (concat-copy bisa kehilangan 1 frame).
- Audio: tiap scene di-`atrim` tepat durasinya (padding AAC menggeser sinkron jika tidak).

---

## 10. Checklist QA final

- [ ] Jumlah frame = durasi × 30, durasi kontainer tepat.
- [ ] Frame awal/tengah/akhir tiap scene + setiap sambungan diperiksa.
- [ ] Ejaan teks sesuai brief (dan koreksi typo yang diminta tercatat).
- [ ] Semua karakter yang diwajibkan hadir; tidak ada karakter terpotong; tidak ada halo putih.
- [ ] Teks tidak tertutup elemen lain (judul vs grid, chip status vs label, bubble vs wajah).
- [ ] Kata bertanda hubung tidak terpotong di akhir baris (`white-space: nowrap` per kata).
- [ ] Arah aliran energi sesuai hierarki.
- [ ] Aset terlarang (mis. customer) tidak muncul di scene yang dilarang.
- [ ] VO sinkron, tidak dipercepat; loudness -14 LUFS, tanpa clipping.
- [ ] Nomor/link CTA diverifikasi ulang dengan klien.

---

## 11. Jebakan yang sudah terbukti (dan solusinya)

| Masalah | Solusi |
|---|---|
| Unduhan Drive via URL diblokir proxy | ambil file lewat konektor Drive (hasil disimpan ke file, di-decode base64) |
| Model rembg terputus saat unduh | `curl -C -` resume, letakkan di path yang dicari rembg (`~/.rembg/models/...`) |
| Batch rembg berhenti diam-diam | proses satu file per eksekusi |
| Render panjang mati karena batas waktu | render per scene, lalu gabung dengan FFmpeg |
| `pkill -f pola` ikut membunuh shell sendiri | hindari pkill dengan pola yang ada di perintah itu sendiri |
| Render lama di background menimpa file final | pastikan tidak ada render berjalan sebelum commit/serah |
| Emoji/simbol (✓, ⚡) tampil kotak | gambar dengan SVG |
| ElevenLabs menolak (free tier diblokir / 429) | laporkan; minta upgrade atau rekaman; jangan ganti penyedia diam-diam |
| Kamera tracking menutup header | batasi (clamp) gerak vertikal kamera |
| Bubble lama tetap terlihat saat kamera pindah | beri `end` + fade-out per bubble |

---

## 12. Paket jual (saran)

| Paket | Isi | Estimasi kerja |
|---|---|---|
| **Basic** | 1 video 30 dtk (3 scene), SFX, teks; tanpa VO | 1 hari |
| **Pro** | 50–60 dtk (6–8 scene), VO, SFX, 1 revisi | 2–3 hari |
| **Story + CTA** | Pro + rangkaian customer→kanal→robot, rekap data, end card dengan musik | 3–4 hari |

Yang diserahkan: master MP4, MP4 per scene, cutout PNG transparan, file audio, source code Remotion, log produksi.

---

## 13. Lisensi aset dalam template

- Poppins: SIL Open Font License (sertakan `OFL.txt`).
- SFX & musik: disintesis oleh skrip template → bebas dipakai komersial.
- Karakter, logo, foto, rekaman VO: milik klien; template tidak menyertakan aset klien.
- Logo platform (WA/IG/TikTok) mengikuti pedoman merek masing-masing platform.
