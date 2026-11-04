# Waktu kata dari pemetaan manual: tiap rentang bicara (deteksi jeda -50 dB) dipasangkan ke potongan naskah,
# lalu kata dibagi menurut jumlah suku kata. Tanpa ASR. Pemakaian: python3 -I emas-batangan/align_spans.py
import json, re
SPANS = [(0.00, 1.02, "Di Indonesia,"), (1.23, 3.10, "ada banyak merek emas batangan."), (3.48, 4.29, "Misalnya UBS,"),
 (4.37, 5.13, "Lotus Archi,"), (5.31, 6.20, "dan Emasku"), (6.36, 8.49, "dari Hartadinata."), (8.99, 10.23, "UBS diproduksi"),
 (10.35, 12.37, "PT Untung Bersama Sejahtera."), (12.76, 16.85, "Lotus Archi dibuat perusahaan patungan Lotus Lingga Pratama dan"),
 (16.93, 17.49, "Archi Group."), (17.89, 19.77, "Sedangkan Emasku diproduksi"), (19.87, 21.70, "PT Hartadinata Abadi."),
 (22.18, 23.41, "Yang membuat mereka sama?"), (23.82, 24.60, "Kadarnya."), (24.96, 27.47, "Semuanya emas murni dua puluh empat karat,"),
 (27.56, 30.31, "sembilan puluh sembilan koma sembilan sembilan persen."), (30.73, 31.42, "Yang beda?"), (31.73, 32.41, "Produsen dan"),
 (32.49, 33.82, "tempat produksinya."), (34.31, 34.95, "Jadi,"), (35.09, 37.85, "apakah semuanya sama-sama emas dan aset yang likuid?"),
 (38.29, 39.72, "Sama-sama emas murni,"), (39.84, 41.37, "dan bisa dijual kembali."), (41.80, 42.37, "Tapi"),
 (42.46, 45.21, "harga jual kembali dan tempat yang menerimanya"), (45.29, 46.63, "bisa berbeda di tiap merek."),
 (47.13, 47.77, "Kalau kamu,"), (47.96, 48.61, "pilih yang mana?"), (49.01, 49.95, "Komen di bawah, ya.")]
SYL = {"UBS": 3, "PT": 2}
syl = lambda w: SYL.get(re.sub(r"\W", "", w), max(1, len(re.findall(r"[aiueo]+", w.lower()))))
out = []
for a, b, txt in SPANS:
    ws = txt.split(); s = sum(map(syl, ws)); t = a
    for w in ws:
        d = (b - a) * syl(w) / s; out.append({"text": w, "start": round(t, 2), "end": round(t + d, 2)}); t += d
naskah = open("emas-batangan/naskah.txt").read().split()
assert [w["text"] for w in out] == naskah, "potongan tidak sama dengan naskah"
json.dump({"metode": "pemetaan manual rentang bicara + suku kata (tanpa ASR)", "audio": "assets/audio/emas-batangan/rekaman-asli.mp3",
           "akhir": SPANS[-1][1], "words": out}, open("data/emas-batangan.words.json", "w"), ensure_ascii=False, indent=1)
print(len(out), "kata")
