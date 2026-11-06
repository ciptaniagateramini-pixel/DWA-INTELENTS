# Waktu kata dari pemetaan manual: tiap rentang bicara (deteksi jeda -50 dB) dipasangkan ke potongan naskah,
# lalu kata dibagi menurut jumlah suku kata. Tanpa ASR. Pemakaian: python3 -I kode-emas/align_spans.py
import json, re
SPANS = [(0.00, 0.80, "Bunda-bunda,"), (1.06, 2.86, "wajib tahu tips tipis kali ini!"),
 (3.40, 5.29, "Sebelum bungkus perhiasan yang kalian"), (5.37, 5.76, "suka,"), (5.97, 7.05, "sambil pilih-pilih,"),
 (7.41, 8.97, "cek dulu kode kadar"), (9.08, 11.11, "dan cap pabrik pembuatnya di produknya."), (11.62, 12.28, "Misalnya,"),
 (12.64, 14.77, "Bu Rina mau beli cincin enam belas karat."), (15.31, 16.94, "Coba lihat bagian dalam cincinnya."),
 (17.40, 19.66, "Biasanya ada kode enam belas K,"), (19.94, 20.57, "atau tujuh"), (20.69, 21.03, "ratus,"),
 (21.22, 22.34, "atau tujuh puluh."), (22.76, 23.47, "Lalu ada"), (23.55, 24.46, "cap produksinya,"),
 (24.84, 27.27, "biasanya berupa logo pabrik pembuatnya."), (27.68, 28.37, "Misalnya"), (28.51, 29.27, "UBS,"),
 (29.53, 30.15, "Lotus,"), (30.36, 31.67, "dan masih banyak lagi."), (32.19, 32.66, "Terus,"),
 (32.83, 34.48, "kalau nggak ada kode dan cap pabriknya,"), (34.57, 36.33, "berarti bukan emas?"), (36.68, 37.65, "Tetap emas,"),
 (37.82, 39.82, "kalau kamu belinya di toko emas."), (40.12, 40.73, "Biasanya"), (40.81, 42.46, "itu buatan pengrajin lokal."),
 (42.95, 44.30, "Jadi bedanya apa?"), (44.67, 45.99, "Cuma beda produsen."), (46.27, 47.28, "Ada buatan pabrik,"),
 (47.56, 48.87, "ada buatan pengrajin."), (49.35, 51.12, "Mau tahu kelebihan dan kekurangannya?"), (51.55, 52.67, "Follow dulu, dong!"),
 (52.91, 53.65, "Biar makin"), (53.74, 55.03, "teliti investasi emas.")]
SYL = {"UBS": 3, "K": 1, "Follow": 2}
syl = lambda w: SYL.get(re.sub(r"\W", "", w), max(1, len(re.findall(r"[aiueo]+", w.lower()))))
out = []
for a, b, txt in SPANS:
    ws = txt.split(); s = sum(map(syl, ws)); t = a
    for w in ws:
        d = (b - a) * syl(w) / s; out.append({"text": w, "start": round(t, 2), "end": round(t + d, 2)}); t += d
naskah = open("kode-emas/naskah.txt").read().split()
assert [w["text"] for w in out] == naskah, "potongan tidak sama dengan naskah"
json.dump({"metode": "pemetaan manual rentang bicara + suku kata (tanpa ASR)", "audio": "assets/audio/kode-emas/rekaman-asli.mp3",
           "akhir": SPANS[-1][1], "words": out}, open("data/kode-emas.words.json", "w"), ensure_ascii=False, indent=1)
print(len(out), "kata")
