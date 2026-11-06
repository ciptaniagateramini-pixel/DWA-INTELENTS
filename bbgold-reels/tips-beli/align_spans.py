# Waktu kata dari pemetaan manual: tiap rentang bicara (deteksi jeda -50 dB) dipasangkan ke potongan naskah,
# lalu kata dibagi menurut jumlah suku kata. Tanpa ASR. Pemakaian: python3 -I tips-beli/align_spans.py
import json, re
SPANS = [(0.10, 4.26, "Tips tipis sebelum beli perhiasan atau logam mulia di toko emas."),
 (4.79, 7.58, "Misalnya kamu mau beli perhiasan enam belas karat."), (8.09, 8.65, "Sampai di"), (8.74, 9.07, "toko,"),
 (9.29, 9.92, "tanya dulu:"), (10.27, 12.69, "harga beli enam belas karat hari ini berapa?"), (13.23, 14.30, "Lalu tanya lagi:"),
 (14.66, 16.31, "kalau dijual kembali hari ini,"), (16.53, 17.90, "harga buyback-nya berapa?"), (18.44, 19.13, "Contohnya,"),
 (19.45, 22.76, "harga beli satu gram satu juta enam ratus ribu rupiah."), (23.13, 24.15, "Harga buyback-nya"),
 (24.33, 25.43, "satu juta lima ratus"), (25.51, 26.98, "lima puluh ribu rupiah."), (27.37, 27.66, "Berarti"),
 (27.75, 28.30, "spread-nya"), (28.38, 30.18, "lima puluh ribu per gram,"), (30.52, 31.97, "untuk kadar enam belas karat."),
 (32.54, 33.36, "Tanyakan juga:"), (33.73, 35.11, "nanti kalau dijual,"), (35.34, 36.42, "ikut harga pasar,"),
 (36.60, 37.78, "atau harga di nota?"), (38.17, 38.85, "Ada potongan?"), (39.21, 39.95, "Berapa persen?"),
 (40.33, 41.38, "Kalau barangnya rusak,"), (41.68, 43.11, "potongannya berapa persen?"), (43.69, 44.64, "Sebelum bayar,"),
 (44.82, 47.09, "minta staf menimbang ulang di depan kamu."), (47.48, 50.83, "Lalu kalikan beratnya dengan harga yang berlaku hari itu."),
 (51.21, 52.14, "Kalau ada selisih,"), (52.40, 53.38, "langsung tanyakan."), (53.85, 54.18, "Ingat,"),
 (54.53, 56.06, "teliti di awal lebih baik,"), (56.36, 57.96, "daripada menyesal kemudian.")]
SYL = {"buyback-nya": 3, "spread-nya": 2, "staf": 1}
syl = lambda w: SYL.get(re.sub(r"\W", "", w), max(1, len(re.findall(r"[aiueo]+", w.lower()))))
out = []
for a, b, txt in SPANS:
    ws = txt.split(); s = sum(map(syl, ws)); t = a
    for w in ws:
        d = (b - a) * syl(w) / s; out.append({"text": w, "start": round(t, 2), "end": round(t + d, 2)}); t += d
naskah = open("tips-beli/naskah.txt").read().split()
assert [w["text"] for w in out] == naskah, "potongan tidak sama dengan naskah"
json.dump({"metode": "pemetaan manual rentang bicara + suku kata (tanpa ASR)", "audio": "assets/audio/tips-beli/rekaman-asli.mp3",
           "akhir": SPANS[-1][1], "words": out}, open("data/tips-beli.words.json", "w"), ensure_ascii=False, indent=1)
print(len(out), "kata")
