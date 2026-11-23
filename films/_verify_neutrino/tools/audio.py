# Original procedural score + SFX (no third-party audio). Writes assets/audio/{music,sfx}.wav
# Music ducks under the frozen narration; SFX are placed from tools/timing.json.
import json, wave
import numpy as np
SR = 44100; DUR = 120.0; N = int(SR * DUR)
T = json.load(open("tools/timing.json"))
rs = np.random.RandomState(11)
t = np.arange(N) / SR

def env(points, n=N):
    xs, ys = zip(*points)
    return np.interp(np.arange(n) / SR, xs, ys)

def write(path, x):
    x = np.clip(x, -1, 1)
    s = (x * 32767).astype(np.int16)
    w = wave.open(path, "wb"); w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(s.tobytes()); w.close()

def lp(x, fc):
    a = np.exp(-2 * np.pi * fc / SR); y = np.zeros_like(x); s = 0.0
    for i in range(len(x)):
        s = (1 - a) * x[i] + a * s; y[i] = s
    return y
def hp(x, fc): return x - lp(x, fc)
fft = np.fft
def band_noise(n, f0, f1, seed=0):
    r = np.random.RandomState(seed); X = fft.rfft(r.normal(0, 1, n)); fr = fft.rfftfreq(n, 1 / SR)
    X[(fr < f0) | (fr > f1)] = 0; y = fft.irfft(X, n); return y / (np.abs(y).max() + 1e-9)

# ---------------- MUSIC ----------------
BPM = 92; beat = 60 / BPM; bar = 4 * beat
midi = lambda m: 440 * 2 ** ((m - 69) / 12)
CH = [[57, 64, 67, 72], [53, 60, 65, 69], [48, 55, 64, 67], [55, 62, 67, 71]]     # Am F C G
L = np.zeros(N); R = np.zeros(N)
nbars = int(DUR / bar) + 1
for b in range(nbars):
    c = CH[b % 4]; s0 = b * bar; i0 = int(s0 * SR); n = int(bar * 1.5 * SR)
    if i0 >= N: break
    n = min(n, N - i0); tt = np.arange(n) / SR
    e = np.minimum(1, tt / 0.9) * np.minimum(1, (n / SR - tt) / 1.0)
    for j, m in enumerate(c):
        f = midi(m); v = sum(np.sin(2 * np.pi * f * h * tt * (1 + (j - 1.5) * 0.0009) + j * h) / h ** 1.4 for h in (1, 2, 3))
        L[i0:i0 + n] += v * e * (0.05 + 0.012 * j); R[i0:i0 + n] += np.roll(v, 40 + 25 * j) * e * (0.058 - 0.008 * j)
    # bass
    f = midi(c[0] - 12); nb = min(int(bar * SR), N - i0); tb = np.arange(nb) / SR
    bassv = (np.sin(2 * np.pi * f * tb) + 0.3 * np.sin(4 * np.pi * f * tb)) * np.minimum(1, tb / .05) * np.exp(-tb / 2.2)
    L[i0:i0 + nb] += bassv * 0.1; R[i0:i0 + nb] += bassv * 0.1
# arpeggio pluck (lives only in the energetic sections)
arp_env = env([(0, .55), (11, .55), (15, .8), (21, 1), (31, .75), (43, .9), (55, .55), (70, .4), (81, .3), (90, .15), (92, .05), (93.2, 0), (96, 0), (99, .35), (102, .8), (108, .55), (120, .3)])
steps = int(DUR / (beat / 2))
for k in range(steps):
    s = k * beat / 2; i0 = int(s * SR)
    if i0 >= N: break
    c = CH[int(s / bar) % 4]; m = c[[0, 2, 1, 3, 2, 3, 1, 2][k % 8]] + (12 if k % 16 > 11 else 0)
    n = min(int(.9 * SR), N - i0); tp = np.arange(n) / SR; f = midi(m)
    v = (np.sin(2 * np.pi * f * tp) + .4 * np.sin(4 * np.pi * f * tp) * np.exp(-tp * 14)) * np.exp(-tp * 4.8) * (.08) * arp_env[i0]
    pan = .5 + .35 * np.sin(k * .7)
    L[i0:i0 + n] += v * (1 - pan); R[i0:i0 + n] += v * pan
# simple stereo echo
d = int(beat * .75 * SR)
L[d:] += R[:-d] * .28; R[d:] += L[:-d] * .28
# structural dynamics: silence before the flash, swell after, warm finish
flash = T["s26"][0] + 5.7
m_env = env([(0, .75), (15, .95), (21, 1), (31, 1), (47, 1), (55, .78), (70, .72), (81, .55), (flash - 1.4, .30), (flash - .2, 0.02), (flash + .25, .02), (flash + 2.2, .5), (T["s29"][0], 1), (108, .9), (117.5, .85), (119.9, 0), (120, 0)])
L *= m_env; R *= m_env
# duck under the voice
vw = wave.open("assets/audio/narration.wav", "rb"); v = np.frombuffer(vw.readframes(vw.getnframes()), dtype=np.int16).astype(float) / 32767; vsr = vw.getframerate(); vw.close()
win = int(vsr * .2); ve = np.convolve(np.abs(v), np.ones(win) / win, mode="same")
ve = np.interp(np.arange(N) / SR, np.arange(len(ve)) / vsr, ve)
duck = 1 - 0.5 * np.clip(ve / 0.04, 0, 1)
mus = np.stack([L * duck, R * duck], 1)
mus *= 0.72 / (np.abs(mus).max() + 1e-9)
write("assets/audio/music.wav", mus)

# ---------------- SFX ----------------
sL = np.zeros(N); sR = np.zeros(N)
def put(x, at, gain=1.0, pan=0.5):
    i0 = int(at * SR); n = min(len(x), N - i0)
    if i0 < 0 or n <= 0: return
    sL[i0:i0 + n] += x[:n] * gain * (1 - pan) * 2 ** .5; sR[i0:i0 + n] += x[:n] * gain * pan * 2 ** .5
def whoosh(dur=.7, seed=1, rise=True, f0=500, f1=5000):
    n = int(dur * SR); x = np.zeros(n); r = np.random.RandomState(seed); src = r.normal(0, 1, n); s = 0
    tt = np.arange(n) / n
    fc = (f0 + (f1 - f0) * np.sin(np.pi * tt) ** 2) if rise else (f1 + (f0 - f1) * tt)
    a = np.exp(-2 * np.pi * fc / SR)
    for i in range(n):
        s = (1 - a[i]) * src[i] + a[i] * s; x[i] = s
    x = x / (np.abs(x).max() + 1e-9)
    return x * np.sin(np.pi * tt) ** 1.4
def thump(dur=.8, f=52, seed=3):
    n = int(dur * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * (f + 90 * np.exp(-tt * 18)) * tt) * np.exp(-tt * 5.2) + band_noise(n, 80, 1600, seed) * np.exp(-tt * 26) * .4)
def tick(f=1650, dur=.09):
    n = int(dur * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tt) + .4 * np.sin(2 * np.pi * f * 2.76 * tt)) * np.exp(-tt * 60)
def glass(f=1400, dur=1.2):
    n = int(dur * SR); tt = np.arange(n) / SR
    return (np.sin(2 * np.pi * f * tt) + .5 * np.sin(2 * np.pi * f * 2.4 * tt) * np.exp(-tt * 4) + .25 * np.sin(2 * np.pi * f * 3.7 * tt) * np.exp(-tt * 9)) * np.exp(-tt * 4.2) * np.minimum(1, tt / .004)
def boil():
    x = band_noise(int(16 * SR), 1800, 6000, 5) * .4 * (0.8 + .2 * np.sin(np.arange(int(16 * SR)) / SR * 21))
    return x
s = T
# Beds: rain + kettle in room; deep solar rumble; cold air on ice; quiet hum in dark
n16 = int(15.6 * SR)
rain = band_noise(n16, 3000, 9000, 2); rainenv = np.ones(n16) * .55; rainenv[int(11 * SR):] = np.linspace(.55, 0, n16 - int(11 * SR))
put(rain * rainenv, 0, .09, .3); put(boil()[:n16] * rainenv, 0, .05, .7)
SUN0, SUN1 = s["s9"][0] - .3, s["s11"][0] - .1
nn = int((SUN1 - SUN0) * SR); rum = band_noise(nn, 30, 220, 8); put(rum * np.minimum(1, np.arange(nn) / (1.5 * SR)) * np.minimum(1, (nn - np.arange(nn)) / (.5 * SR)), SUN0, .42)
ICE0 = s["s24"][0]; nn = int((s["s25"][0] - ICE0) * SR); wind = band_noise(nn, 300, 1600, 9) * (0.8 + .2 * np.sin(np.arange(nn) / SR * 1.1)); put(wind * np.minimum(1, np.arange(nn) / (.7 * SR)) * np.minimum(1, (nn - np.arange(nn)) / (.7 * SR)), ICE0, .1, .4)
DARK0 = s["s25"][0]; nn = int((flash + 8 - DARK0) * SR); hum = band_noise(nn, 40, 180, 10); put(hum * np.minimum(1, np.arange(nn) / (1.0 * SR)) * np.minimum(1, (nn - np.arange(nn)) / (2.0 * SR)), DARK0, .16)
END0 = s["s30"][0]; nn = int((120 - END0) * SR); put(rain[:nn] * np.minimum(1, np.arange(nn) / (1.5 * SR)) * np.minimum(1, (nn - np.arange(nn)) / (1.6 * SR)), END0, .05, .3)

# Hook: spark tick, count pops, flood rush
put(whoosh(.4, 4, True, 1500, 6500), .1, .22, .4)
put(tick(1200), s["s2"][0] + .02, .22); put(tick(1500), s["s3"][0] + .02, .22)
put(whoosh(1.2, 5, True, 800, 6500), s["s4"][0] + .25, .22, .6)
for i in range(14): put(tick(1900 + i * 80, .05), s["s4"][0] + .34 + i * 1.45 / 14, .1, .5)
put(thump(.3, 90), 8.92, .22)                                                # shrug settle
put(tick(2600, .05), 10.5, .12); put(whoosh(.4, 6, True, 1000, 5000), 10.05, .16, .3)  # breakfast cut, fork
# Scale jumps: distinct whoosh takes, each on a visible transition
for at, seed, g_, f1_ in [(11.15, 7, .34, 4200), (15.1, 8, .3, 5200), (16.05, 9, .24, 3800), (s["s9"][0] - .95, 10, .38, 3000), (s["s9"][0] + .3, 11, .25, 2600), (s["s11"][0] - .35, 12, .36, 6500), (s["s13"][0] + .12, 13, .42, 2400), (s["s14"][0] + .1, 14, .26, 4000), (s["s16"][0] - .45, 15, .3, 3800), (s["s18"][0] - .35, 16, .27, 4000), (s["s19"][0] - .2, 17, .32, 3000), (s["s20"][0] - .2, 18, .24, 3500), (s["s22"][0] - .15, 19, .26, 4500), (s["s24"][0] - .2, 20, .3, 3200), (s["s24"][0] + 3.6, 21, .3, 2200), (s["s25"][0] - .1, 22, .32, 2800), (s["s29"][0] + .2, 23, .34, 3400), (s["s29"][0] + 4.6, 24, .34, 3000)]:
    put(whoosh(.75, seed, True, 400, f1_), at, g_, .35 + (seed % 5) * .07)
# Fusion: nuclei strike; energy ring; extra events
fh = s["s10"][0] + 1.05
put(thump(.9, 62), fh, .6); put(glass(1100, .9), fh, .15)
put(thump(.5, 80), fh + 1.6, .22, .7); put(thump(.5, 76), fh + 2.5, .22, .3)
# Flavor morphs
for at, f in [(s["s15"][0] + 1.0, 880), (s["s15"][0] + 2.55, 1175)]:
    put(glass(f, .9), at, .16, .5)
# Skin & scan
put(glass(1500, .6), s["s16"][0] + .34, .1); put(whoosh(.8, 26, True, 1500, 7000), s["s17"][0] + .02, .16)
# Rare hit on the Earth; atoms: charge impact + myth strike
put(glass(1750, .9), s["s18"][0] + 3.3, .18, .7)
put(tick(700, .14), s["s20"][0] + 1.1, .28)
c0 = s["s20"][0] + 2.15
for k, d_ in enumerate((.42, .78, 1.04, 1.3)): put(tick(500 - k * 40, .14), c0 + d_, .3, .4 + k * .07)
put(glass(1650, .7), s["s22"][0] - 1.15, .17, .7)
# Walk: soft steps on contact
for k in range(int(3.2 / (np.pi / 6.1))):
    n = int(.1 * SR); tt = np.arange(n) / SR; st = band_noise(n, 100, 900, 40 + k) * np.exp(-tt * 40)
    put(st, s["s22"][0] + .2 + k * (np.pi / 6.1), .13, .45)
put(thump(.22, 180), s["s23"][0] + .3, .2)  # door knock
# Sensors slotting on the question mark
for i in range(7): put(tick(1000 + i * 120, .07), s["s23"][0] + .9 + .6 + i * .17, .12)
# String drops
su = s["s24"][0] - .1
for i in range(14): put(tick(820 - i * 14, .05), su + .65 + i * .17, .1, .2 + i * .045)
put(glass(1320, .9), s["s25"][0] + 3.3, .1, .6)  # sensor wakes
# THE FLASH: riser ends in near-silence, single hit, then every sensor rings in order
put(thump(.7, 58, 47), T["s26"][0] + 2.65, .42); put(glass(1900, .7), T["s26"][0] + 2.65, .12)
nr = int(2.2 * SR); rise = band_noise(nr, 2000, 9000, 44) * (np.arange(nr) / nr) ** 3; put(rise, flash - 2.2, .1)
put(thump(1.6, 44, 48), flash, .95); put(glass(2100, 2.2), flash, .25); put(whoosh(.5, 50, True, 2000, 9000), flash, .26)
R2 = np.random.RandomState(4)
for k in range(46):
    at = flash + .05 + k * (.042 + R2.rand() * .012)
    put(glass(1050 + R2.rand() * 1500, .5), at, .1 * (1 - k / 70), .2 + (k / 46) * .6)
# Data dots replay + arrow
dr = s["s28"][0] + .2
for k in range(18): put(tick(2300 - k * 70, .04), dr + .05 + k * .06, .08, .2 + k * .035)
put(whoosh(1.45, 52, True, 500, 3200), dr + .75, .22, .6)
# Far galaxy ping; river hush; palm glint; final spark
put(glass(980, 1.6), s["s29"][0] + 1.9, .15, .75)
put(glass(2000, 1.8), s["s33"][0] + .42, .26, .35)
put(whoosh(1.5, 54, True, 1000, 6000), s["s33"][0] + 2.1, .2, .8)
sfx = np.stack([sL, sR], 1)
pk = np.abs(sfx).max(); sfx *= min(1, .8 / pk)
write("assets/audio/sfx.wav", sfx)
print("music peak", np.abs(mus).max(), "sfx peak", pk)
