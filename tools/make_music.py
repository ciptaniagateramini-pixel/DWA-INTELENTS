"""Original, royalty-free upbeat 'ad outro' music bed for Scene 12 (10 s, 48 kHz stereo WAV).

112 BPM, C - G - Am - F progression: warm pad, plucked arpeggio, bass, kick/clap/hat.
"""
import wave
from pathlib import Path
import numpy as np

SR = 48000
BPM = 112
BEAT = 60 / BPM
DUR = 10.0
OUT = Path(__file__).resolve().parent.parent / "public/music/outro_scene12.wav"
rng = np.random.default_rng(12)
n = int(SR * DUR)
t = np.arange(n) / SR
mix_l = np.zeros(n); mix_r = np.zeros(n)

def midi(m): return 440 * 2 ** ((m - 69) / 12)

CHORDS = [[60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60]]  # C G Am F
BAR = 4 * BEAT

def add(sig, start, gain=1.0, pan=0.0):
    i = int(start * SR); j = min(n, i + len(sig))
    if i >= n: return
    mix_l[i:j] += sig[: j - i] * gain * (1 - pan) ; mix_r[i:j] += sig[: j - i] * gain * (1 + pan)

def env(length, a=0.01, r=0.2):
    k = np.arange(int(length * SR)) / SR
    return np.minimum(1, k / a) * np.exp(-k / r)

bar = 0
while bar * BAR < DUR:
    ch = CHORDS[bar % 4]
    # pad: detuned saws, soft attack, whole bar
    L = BAR; k = np.arange(int(L * SR)) / SR
    pad = sum(np.sin(2 * np.pi * midi(m) * k * d) for m in ch for d in (0.997, 1.003)) / 6
    pad *= np.minimum(1, k / 0.25) * np.minimum(1, (L - k) / 0.2)
    add(pad, bar * BAR, 0.16, 0.0)
    # bass on 8ths
    for e in range(8):
        k = np.arange(int(BEAT / 2 * SR)) / SR
        f = midi(ch[0] - 24)
        b = (np.sin(2 * np.pi * f * k) + 0.3 * np.sin(4 * np.pi * f * k)) * env(BEAT / 2, 0.005, 0.12)
        add(b, bar * BAR + e * BEAT / 2, 0.32)
    # arpeggio 16ths
    seq = [ch[0] + 12, ch[1] + 12, ch[2] + 12, ch[1] + 24]
    for s16 in range(16):
        k = np.arange(int(BEAT / 4 * SR)) / SR
        f = midi(seq[s16 % 4])
        p = (np.sin(2 * np.pi * f * k) + 0.25 * np.sin(6 * np.pi * f * k)) * env(BEAT / 4, 0.003, 0.07)
        add(p, bar * BAR + s16 * BEAT / 4, 0.12, 0.35 if s16 % 2 else -0.35)
    # drums
    for b4 in range(4):
        st = bar * BAR + b4 * BEAT
        k = np.arange(int(0.25 * SR)) / SR
        kick = np.sin(2 * np.pi * np.cumsum(50 + 110 * np.exp(-k * 30)) / SR) * np.exp(-k * 14)
        add(kick, st, 0.55)
        if b4 % 2 == 1:
            clap = rng.standard_normal(int(0.15 * SR)) * env(0.15, 0.002, 0.05)
            add(clap, st, 0.18)
        for h in range(2):
            hat = rng.standard_normal(int(0.05 * SR)) * env(0.05, 0.001, 0.012)
            hat = np.diff(hat, prepend=0)
            add(hat, st + h * BEAT / 2, 0.10, 0.2)
    bar += 1

# final hit + tail
fade = np.minimum(1, np.minimum(t / 0.3, (DUR - t) / 1.2))
st = np.stack([mix_l * fade, mix_r * fade], axis=1)
st /= np.abs(st).max() + 1e-9
st *= 0.85
OUT.parent.mkdir(parents=True, exist_ok=True)
with wave.open(str(OUT), "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((st * 32767).astype(np.int16).tobytes())
print("music ok", OUT)
