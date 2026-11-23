# Event-synced sound (adapted from neutrino tools/audio.py synthesis helpers): procedural SFX placed at the RESOLVED
# contract times in production/cues.json (scene "sound" entries + event "sfx"), mixed under the frozen narration.
# Writes assets/audio/sfx.wav and production/audio.json (consumed by build.mjs). Run from a film dir.
#   sfx types: puff, click, chime, whoosh, thud, buzz (bed; needs "until"), creak
import json, wave, os
import numpy as np
SR = 44100
cues = json.load(open("production/cues.json"))
film = json.load(open("production/film.json"))
DUR = float(film["duration"]); N = int(SR * DUR)
rs = np.random.RandomState(7)

def env(n, a=0.005, r=0.2):
    t = np.arange(n) / SR; return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / max(r, 1e-4))
def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.empty_like(x); s = 0.0
    for i in range(len(x)): s = (1 - a) * x[i] + a * s; y[i] = s
    return y
def noise(n): return rs.normal(0, 1, n)
def place(buf, sig, t):
    i = int(t * SR)
    if i >= len(buf) or i + len(sig) <= 0: return
    j0 = max(0, -i); i = max(0, i); k = min(len(sig) - j0, len(buf) - i)
    buf[i:i + k] += sig[j0:j0 + k]

SYN = {
    "puff": lambda: lp(noise(int(0.45 * SR)), 900) * env(int(0.45 * SR), 0.02, 0.12) * 2.2,
    "whoosh": lambda: lp(noise(int(0.8 * SR)), 1400) * np.sin(np.linspace(0, np.pi, int(0.8 * SR))) * 1.6,
    "click": lambda: np.sin(2 * np.pi * 1800 * np.arange(int(0.05 * SR)) / SR) * env(int(0.05 * SR), 0.001, 0.01),
    "chime": lambda: sum(np.sin(2 * np.pi * f * np.arange(int(1.2 * SR)) / SR) / k for k, f in enumerate([880, 1320, 1760], 1)) * env(int(1.2 * SR), 0.005, 0.4) * 0.4,
    "thud": lambda: np.sin(2 * np.pi * 70 * np.arange(int(0.3 * SR)) / SR) * env(int(0.3 * SR), 0.003, 0.08),
    "creak": lambda: lp(noise(int(0.5 * SR)), 300) * (1 + np.sin(2 * np.pi * 23 * np.arange(int(0.5 * SR)) / SR)) * env(int(0.5 * SR), 0.05, 0.2),
}
L = np.zeros(N); R = np.zeros(N); placed = []
for sid, sc in cues["scenes"].items():
    for s in sc.get("sound", []):
        kind, t = s.get("sfx"), s.get("t")
        if kind is None or t is None: continue
        if kind == "buzz":   # bed of many wing tones, amplitude fades to the "until" time
            t1 = s.get("t1", t + 3); n = int((DUR - t) * SR); tt = np.arange(n) / SR
            sig = sum(np.sin(2 * np.pi * (f + 6 * np.sin(2 * np.pi * (0.7 + k * 0.13) * tt)) * tt) for k, f in enumerate([212, 236, 251, 268, 290])) / 5
            sig = sig * (0.6 + 0.4 * lp(np.abs(noise(n)), 8) / 0.8)
            fade = np.clip(1 - (tt - (t1 - t)) / 1.2, 0, 1) * np.minimum(1, tt / 0.3)
            sig = sig * fade * 0.12; place(L, sig, t); place(R, np.roll(sig, 30), t); placed.append((kind, round(t, 3), round(t1, 3)))
        elif kind in SYN:
            sig = SYN[kind]() * 0.5; place(L, sig, t); place(R, sig * 0.9, t); placed.append((kind, round(t, 3)))
os.makedirs("assets/audio", exist_ok=True)
x = np.stack([L, R], 1); x = np.clip(x / max(1.0, np.abs(x).max() * 1.05), -1, 1)
w = wave.open("assets/audio/sfx.wav", "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes()); w.close()
audio = [{"id": "narration", "src": "assets/audio/narration.wav", "dur": DUR, "vol": 1}, {"id": "sfx", "src": "assets/audio/sfx.wav", "dur": DUR, "vol": 0.7}]
json.dump(audio, open("production/audio.json", "w"), indent=1)
print("placed", placed)
