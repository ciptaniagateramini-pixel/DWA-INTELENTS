# Waktu kata dari pemetaan manual: tiap rentang bicara (deteksi jeda -50 dB) dipasangkan ke potongan naskah,
# lalu kata dibagi menurut jumlah suku kata. Tanpa ASR. Pemakaian: python3 -I emas-rini/align_spans.py
import json, re
SPANS = [(0.00, 2.41, "Bu Rini beli emas Waris lima puluh gram,"), (2.72, 4.32, "Mei dua ribu dua puluh tiga."),
 (4.74, 5.47, "Harganya"), (5.57, 7.73, "empat puluh sembilan koma delapan juta."), (8.25, 9.19, "Lalu... lupa."),
 (9.60, 10.21, "Tersimpan"), (10.62, 11.73, "di lemari."), (12.22, 14.31, "Tujuh November dua ribu dua puluh enam,"),
 (14.56, 16.56, "anaknya butuh laptop sepuluh juta."), (16.92, 17.10, "Eh,"), (17.32, 18.21, "emasnya ketemu!"),
 (18.52, 20.01, "Dijual di store Jakarta,"), (20.24, 21.59, "buyback resmi hari itu:"), (21.81, 23.50, "seratus sembilan belas juta."),
 (24.04, 24.92, "Coba bandingkan."), (25.23, 27.36, "Kalau dulu uangnya disimpan saja,"), (27.54, 29.65, "sekarang cuma cukup beli empat laptop."),
 (30.03, 31.59, "Karena disimpan dalam emas,"), (31.76, 33.85, "Bu Rini bisa beli sebelas laptop,"), (34.06, 35.92, "dan masih sisa sembilan juta!"),
 (36.35, 38.14, "Harga emas bisa naik turun, ya."), (38.50, 39.66, "Kamu simpan emas apa?"), (39.96, 40.75, "Komen di bawah!")]
SYL = {"store": 1, "buyback": 2, "Lalu...": 2}
syl = lambda w: SYL.get(re.sub(r"\W", "", w), max(1, len(re.findall(r"[aiueo]+", w.lower()))))
out = []
for a, b, txt in SPANS:
    ws = txt.split(); s = sum(map(syl, ws)); t = a
    for w in ws:
        d = (b - a) * syl(w) / s; out.append({"text": w, "start": round(t, 2), "end": round(t + d, 2)}); t += d
naskah = open("emas-rini/naskah.txt").read().split()
assert [w["text"] for w in out] == naskah, "potongan tidak sama dengan naskah"
json.dump({"metode": "pemetaan manual rentang bicara + suku kata (tanpa ASR)", "audio": "assets/audio/emas-rini/rekaman-asli.mp3",
           "akhir": SPANS[-1][1], "words": out}, open("data/emas-rini.words.json", "w"), ensure_ascii=False, indent=1)
print(len(out), "kata")
