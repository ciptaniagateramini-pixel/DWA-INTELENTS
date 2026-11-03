# Perkiraan waktu kata tanpa ASR: jeda terdeteksi dipasangkan berurutan ke batas kata
# (tanda baca diutamakan), lalu kata dibagi menurut jumlah suku kata. Pemakaian:
#   python3 -I proses-emas/align_dp.py AUDIO.wav OUT.json
import subprocess, sys, json, re, numpy as np
audio, outp = sys.argv[1], sys.argv[2]
src = open("proses-emas/align.py").read().split("NASKAH = (")[1].split(")\n")[0]
words = "".join(re.findall(r'"([^"]*)"', src)).split()
syl = [max(1, len(re.findall(r"[aiueo]+", w.lower()))) for w in words]
w = 480
x = np.frombuffer(subprocess.run(["ffmpeg", "-v", "quiet", "-i", audio, "-ac", "1", "-ar", "48000", "-f", "f32le", "-"], capture_output=True).stdout, np.float32)
k = np.convolve(np.array([20 * np.log10(np.sqrt((x[i:i + w] ** 2).mean()) + 1e-9) for i in range(0, len(x) - w, w)]), np.ones(3) / 3, "same")
sp = np.where(k > -40)[0]; t0, t1 = sp[0] * 0.01, sp[-1] * 0.01
P = []; q = k < -40; i = 0
while i < len(q):
    if q[i]:
        j = i
        while j < len(q) and q[j]: j += 1
        if (j - i) * 0.01 >= 0.2 and i * 0.01 > t0 and j * 0.01 < t1: P.append((i * 0.01, j * 0.01))
        i = j
    else: i += 1
N = len(words); talk = (t1 - t0) - sum(b - a for a, b in P); cum = np.cumsum(syl) / sum(syl) * talk
tb = [(a - t0) - sum(pb - pa for pa, pb in P if pb <= a) for a, b in P]
cost = lambda p, i: abs(cum[i] - tb[p]) - (1.2 if words[i][-1] in ",.?" else 0)
INF = 1e9; dp = [[INF] * N for _ in P]; bk = [[-1] * N for _ in P]
for i in range(N - 1): dp[0][i] = cost(0, i)
for p in range(1, len(P)):
    best, bi = INF, -1
    for i in range(N - 1):
        if i > 0 and dp[p - 1][i - 1] < best: best, bi = dp[p - 1][i - 1], i - 1
        if bi >= 0: dp[p][i] = best + cost(p, i); bk[p][i] = bi
i = min(range(N - 1), key=lambda j: dp[-1][j]); idx = [0] * len(P)
for p in range(len(P) - 1, -1, -1): idx[p] = i; i = bk[p][i]
out = []; start = t0; wi = 0
for kk, (a, b) in enumerate(P + [(t1, None)]):
    e = idx[kk] if kk < len(P) else N - 1
    s = sum(syl[j] for j in range(wi, e + 1)); t = start
    for j in range(wi, e + 1):
        d = (a - start) * syl[j] / s; out.append({"text": words[j], "start": round(t, 2), "end": round(t + d, 2)}); t += d
    wi = e + 1; start = b if b is not None else t1
json.dump({"metode": "perkiraan suku kata + jeda, pencocokan berurutan (tanpa ASR)", "audio": audio, "akhir": round(t1, 2), "words": out}, open(outp, "w"), ensure_ascii=False, indent=1)
print("jangkar:", [(words[i], round(a, 2)) for i, (a, b) in zip(idx, P)], "akhir", round(t1, 2))
