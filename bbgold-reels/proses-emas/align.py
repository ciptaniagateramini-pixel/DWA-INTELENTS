# Perkiraan waktu kata tanpa ASR: jeda terdeteksi dijadikan jangkar di batas tanda baca,
# lalu kata dibagi rata menurut jumlah suku kata di tiap segmen.
import json, re, sys
NASKAH = ("Pernah kepikiran, perhiasan yang kamu jual ke toko emas dibawa ke mana? "
          "Perhiasan itu dilebur dulu, lalu dimurnikan, jadi emas batangan lokal berkadar murni, atau yang biasa disebut cukim. "
          "Cukim ini kemudian diolah lagi oleh pengrajin, jadi perhiasan baru. "
          "Di setiap tahap ada biaya, mulai dari pengrajin sampai produksi. "
          "Itulah kenapa jual beli perhiasan selalu ada selisih harga, atau spread.")
words = NASKAH.split()
syl = [max(1, len(re.findall(r"[aiueo]+", w.lower()))) for w in words]
punct = [i for i, w in enumerate(words) if w[-1] in ",.?"]  # kata terakhir sebelum batas
speech = [(0.17, 26.40)]
pauses = [tuple(map(float, p.split("-"))) for p in sys.argv[1].split()]  # jeda nyata

# Pilih batas tanda baca untuk tiap jeda sehingga kecepatan bicara (suku kata/detik) paling rata
import itertools, statistics
t0, t1 = speech[0]
segs = []; prev = t0
for a, b in pauses: segs.append(a - prev); prev = b
segs.append(t1 - prev)
best = None
for combo in itertools.combinations(punct[:-1], len(pauses)):
    bounds = [-1, *combo, len(words) - 1]
    rates = [sum(syl[bounds[k] + 1: bounds[k + 1] + 1]) / segs[k] for k in range(len(segs))]
    score = statistics.pstdev(rates) / statistics.mean(rates)
    if best is None or score < best[0]: best = (score, combo, rates)
anchors = [(i, a, b) for i, (a, b) in zip(best[1], pauses)]
sys.stderr.write("variasi kecepatan %.2f, suku kata/detik: %s\n" % (best[0], " ".join(f"{r:.1f}" for r in best[2])))
# Segmen antar jangkar, kata dibagi menurut suku kata
out, start, wi = [], t0, 0
for idx, a, b in anchors + [(len(words) - 1, t1, None)]:
    seg = list(range(wi, idx + 1)); s = sum(syl[i] for i in seg); t = start
    for i in seg:
        d = (a - start) * syl[i] / s
        out.append({"text": words[i], "start": round(t, 2), "end": round(t + d, 2)}); t += d
    wi, start = idx + 1, (b if b else t1)
print(json.dumps({"metode": "perkiraan suku kata + jeda (tanpa ASR)", "jangkar": [[words[i], a, b] for i, a, b in anchors], "words": out}, ensure_ascii=False))
