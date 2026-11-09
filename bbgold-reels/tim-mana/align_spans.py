# Waktu kata dari pemetaan manual: tiap rentang bicara (deteksi jeda -50 dB) dipasangkan ke potongan naskah,
# lalu kata dibagi menurut jumlah suku kata. Tanpa ASR. Pemakaian: python3 -I tim-mana/align_spans.py
import json, re
SPANS = [(0.12, 1.53, "Pertanyaan ini sepele,"), (1.94, 3.72, "tapi dampaknya besar."), (4.23, 4.99, "Beli emas,"),
 (5.18, 5.87, "buat apa?"), (6.43, 8.01, "Kenapa emas yang baru dibeli,"), (8.22, 9.79, "kalau langsung dijual, hampir"),
 (9.87, 10.80, "selalu rugi?"), (11.29, 14.42, "Karena ada selisih harga jual dan harga buyback."), (14.85, 15.81, "Di perhiasan,"),
 (15.92, 17.60, "ada juga ongkos pembuatannya."), (18.07, 21.32, "Itulah kenapa beli emas harus punya tujuan yang pasti."),
 (21.82, 22.79, "Untuk berhias,"), (22.99, 24.54, "atau untuk investasi?"), (25.06, 26.19, "Kalau untuk berhias,"),
 (26.39, 29.05, "pilih toko yang buyback-nya mengikuti harga nota."), (29.50, 30.74, "Kalau untuk investasi,"),
 (30.95, 33.89, "pilih toko yang jual belinya mengikuti harga pasar."), (34.35, 37.85, "Ini salah satu alasan kamu harus teliti sebelum bungkus, ya, Say!"),
 (38.35, 39.67, "Kamu tim berhias,"), (39.80, 41.19, "atau tim investasi?"), (41.61, 42.43, "Komen di bawah!")]
SYL = {"buyback.": 2, "buyback-nya": 3, "Pertanyaan": 4}
syl = lambda w: SYL.get(re.sub(r"\W", "", w), max(1, len(re.findall(r"[aiueo]+", w.lower()))))
out = []
for a, b, txt in SPANS:
    ws = txt.split(); s = sum(map(syl, ws)); t = a
    for w in ws:
        d = (b - a) * syl(w) / s; out.append({"text": w, "start": round(t, 2), "end": round(t + d, 2)}); t += d
naskah = open("tim-mana/naskah.txt").read().split()
assert [w["text"] for w in out] == naskah, "potongan tidak sama dengan naskah"
json.dump({"metode": "pemetaan manual rentang bicara + suku kata (tanpa ASR)", "audio": "assets/audio/tim-mana/rekaman-asli.mp3",
           "akhir": SPANS[-1][1], "words": out}, open("data/tim-mana.words.json", "w"), ensure_ascii=False, indent=1)
print(len(out), "kata")
