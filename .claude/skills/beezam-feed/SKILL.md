---
name: beezam-feed
description: Membuat desain feed Instagram (1080x1350) untuk produk BEEZAM memakai kunci desain "studio foto produk" (versi 4) dan mengirimnya ke Adobe Express. Pakai setiap kali user minta feed, post, atau konten visual untuk produk Beezam (madu dan varian lain).
---

# Kunci desain feed BEEZAM: "Studio foto produk" (v4)

Semua feed Beezam memakai gaya ini, kecuali user meminta gaya lain. Contoh hasil: `assets/kunci-desain-v4.png`.

## Cara cepat
1. Siapkan foto produk **PNG transparan**. Contoh: `assets/beezam-madu-hutan-140g.png`.
2. Salin `examples/madu-hutan-asli.json`, lalu ganti teks dan `product_image`.
3. Jalankan `python3 build_feed.py produk.json -o feed.html --png feed.png`.
   - `--png` membuat preview dengan Poppins lokal.
   - Tunjukkan preview ke user dan tunggu persetujuan.
4. Kirim ke Adobe Express. Lihat bagian **Kirim ke Adobe Express**.

Skrip ini otomatis menyesuaikan ukuran produk. Produk dipasang di kotak maksimal 380×650 px, berdiri di permukaan podium (titik tengah x=540, dasar y=1022), lalu pantulannya dibuat otomatis.

### Opsi tambahan di JSON (lihat `examples/sachet-praktis.json`)
- `product_max_w` / `product_max_h`: memperbesar kotak produk untuk kemasan yang melebar, misalnya box + sachet. Contoh: 560×620.
- `product_base_y`: menurunkan produk kalau titik terbawahnya bukan alasnya, supaya produk tetap duduk di podium. Contoh sachet: 1062.
- `fonts`: tipografi lain sesuai permintaan user. Backdrop, podium, dan tata letak tetap sama.
  - Isi dengan kit Adobe Fonts + gaya per kelas (`title`, `sub`, `brand`, `pill`, `tagL`, `tagR`, `tagL span`, `tagR span`).
  - Varian **"sedikit funny"**: DynaPuff (Bold/Medium) + Quicksand Bold, kit `ibn3qmg`.
  - Agar preview memakai font asli, jaringan harus mengizinkan `use.typekit.net` dan `p.typekit.net`.

## Elemen tetap (jangan diubah tanpa diminta)
| Elemen | Nilai |
|---|---|
| Kanvas | 1080×1350 (4:5) |
| Backdrop | gradasi vertikal `#FFFDF7` → `#FCEFCF` (55%) → `#F7DFA6` (72%) → `#F3D287` |
| Cahaya | sorotan putih elips di belakang produk, cahaya hangat `#FFC93C` 55% → 0, vignette tepi `#7A4A00` 22% |
| Podium | prisma hexagon (tengah 540,1020; rx 320; ry 80; tinggi 150) |
| Podium: permukaan atas | gradasi `#FFFFFF` → `#FFF4D2` → `#FFE08A`, garis putih |
| Podium: sisi kiri / depan / kanan | `#F5B820`→`#CC8A00` / `#FFE48A`→`#F2B90F` / `#FFD54A`→`#E9A400` |
| Bayangan | bayangan kontak di bawah produk dan bayangan lebar di lantai, `#5A3500` 45% → 0 |
| Pantulan | pantulan produk samar di permukaan atas podium, tinggi 70 px |
| Aksen | 4 hexagon kecil (2 garis `#E2A600`, 2 isi `#FFD54A`) di kiri dan kanan produk |
| Font | **Poppins** (Adobe Fonts, kit `iev1bgo`): ExtraBold 800, SemiBold 600, Medium 500 |
| Warna teks | cokelat tua `#2B1A04`, aksen `#C27A00`, label merek `#9A6A12` |

## Slot teks
| Slot | Gaya | Contoh |
|---|---|---|
| `brand` | SemiBold 26 px, spasi huruf 12 px, `#9A6A12`, tengah, y=84 | BEEZAM |
| `title` | ExtraBold 96 px, tengah, y=128. **Maksimal ±16 karakter supaya muat 1 baris** | Madu Hutan Asli |
| `sub` | Medium 34 px, tengah, y=246. Teks di dalam `*...*` jadi tebal | Terbuat dari madu *multiflora 100%* |
| `tag_left_*` | kartu putih kiri (x=70, y=610): angka besar ExtraBold `#C27A00` + keterangan | 100% / Multiflora |
| `tag_right_*` | kartu putih kanan (x=800, y=760) | 140 g / Berat bersih |
| `pill` | pill cokelat tua di bawah (y=1262), SemiBold 30 px putih, **satu warna** | Rasa enak, tidak bikin eneg |

## Aturan
- **Teks pill satu warna saja.** Kalimat yang di HTML dicampur beberapa `<b>` berwarna akan pecah jadi beberapa kotak teks di Adobe Express. Warna aksen bisa ditambahkan langsung di Express kalau perlu.
- **Cek klaim dengan label kemasan** sebelum dikunci, misalnya berat bersih, "100%", dan Halal. Klaim yang tidak ada di label (misalnya "multiflora 100%" pada botol 140 g) harus dikonfirmasi ke user dulu.
- **Ejaan baku "eneg"**, kecuali user meminta "eneuk".
- **Jangan menambah klaim kesehatan.** Jangan menyebut harga kecuali diminta.

## Kirim ke Adobe Express
HTML berisi foto ber-base64 (±1–2 MB), terlalu besar untuk dikirim langsung. Jadi diunggah dulu ke Creative Cloud:
1. `adobe_mandatory_init`, lalu `create_visual_design_express_skill`, lalu `html_export_readiness_skill`. Jalankan readiness lagi sebelum setiap export.
2. `asset_initialize_file_upload` (`text/html`, ukuran file dalam byte).
3. Unggah lewat shell: `curl -L -X PUT "<transfer href>" -H "Content-Type: text/html" --data-binary @feed.html`.
4. `asset_finalize_file_upload` dengan transfer document utuh.
5. `export_html_to_express` dengan `url` = `presignedAssetUrl`.
6. Periksa `slides[0].html` hasil impor:
   - Semua teks ada di `hz-text` dengan font Poppins.
   - Teks pill tidak terpecah.
   - Gradasi masuk sebagai `gradient-stops`.

Jaringan lingkungan harus mengizinkan `at.adobe.com` dan `acp-aep-cs-blobstore-prod-jpn3-data.adobe.io`.
