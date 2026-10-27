"""Synthesise original, royalty-free SFX into public/sfx/ (48 kHz mono 16-bit WAV)."""
import wave
from pathlib import Path
import numpy as np

SR = 48000
OUT = Path(__file__).resolve().parent.parent / "public/sfx"
rng = np.random.default_rng(7)


def save(name, x):
    x = x / (np.abs(x).max() + 1e-9) * 0.89
    OUT.mkdir(parents=True, exist_ok=True)
    with wave.open(str(OUT / name), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def t(sec):
    return np.arange(int(SR * sec)) / SR


def bandsweep(noise, f0, f1, q=6.0):
    """Time-varying resonant band-pass (state-variable filter) sweeping f0 -> f1."""
    n = len(noise); f = np.geomspace(f0, f1, n)
    low = band = 0.0; out = np.empty(n)
    for i in range(n):
        g = 2 * np.sin(np.pi * f[i] / SR)
        high = noise[i] - low - band / q
        band += g * high; low += g * band; out[i] = band
    return out


# whoosh: swept band-passed noise with swell envelope
tt = t(0.55); env = np.sin(np.pi * np.clip(tt / 0.55, 0, 1)) ** 2.2
save("whoosh.wav", bandsweep(rng.standard_normal(len(tt)), 300, 3200) * env)

# pop: fast pitch-drop sine + click
tt = t(0.18); f = 900 * np.exp(-tt * 28) + 180
pop = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 30)
pop[:200] += rng.standard_normal(200) * np.linspace(0.6, 0, 200)
save("pop.wav", pop)

# typing: 7 soft key clicks
tt = t(0.9); typing = np.zeros(len(tt))
for k, s in enumerate([0.0, 0.11, 0.24, 0.33, 0.47, 0.58, 0.72]):
    i = int(s * SR); n = 900
    click = rng.standard_normal(n) * np.exp(-np.arange(n) / 120) * (0.7 + 0.3 * (k % 2))
    click += np.sin(2 * np.pi * 2400 * np.arange(n) / SR) * np.exp(-np.arange(n) / 200) * 0.4
    typing[i:i + n] += click
save("typing.wav", typing)

# notification ting: two bell partials, second note a fifth up
tt = t(0.9)
def bell(fr, start):
    x = np.zeros(len(tt)); s = int(start * SR); u = tt[: len(tt) - s]
    x[s:] = (np.sin(2*np.pi*fr*u) + 0.4*np.sin(2*np.pi*fr*2.76*u) + 0.2*np.sin(2*np.pi*fr*5.4*u)) * np.exp(-u*6)
    return x
save("ting.wav", bell(1318.5, 0) * 0.8 + bell(1975.5, 0.09))
print("sfx ok")
