# Narration = the film's clock (generalizes neutrino tools/timing.py).
# direction/EPISODE.json narration.sentences → production/vo/<id>.wav (Kokoro via `hyperframes tts`, only when missing
# or the text changed) → assets/audio/narration.wav + production/timing.json; word timings via `hyperframes transcribe`
# → production/words.json.  Run from a film dir: python ../../engine/tools/narrate.py [--no-words]
import json, os, subprocess, sys, wave, hashlib, glob, shutil
HF = ["npx", "--yes", "hyperframes@0.9.11"]
EP = json.load(open("direction/EPISODE.json", encoding="utf8"))
N = EP["narration"]; voice = N.get("voice", "af_heart"); speed = N.get("speed", 1.0)
os.makedirs("production/vo", exist_ok=True); os.makedirs("assets/audio", exist_ok=True)
hashes = json.load(open("production/vo/hashes.json")) if os.path.exists("production/vo/hashes.json") else {}
sh = os.name == "nt"
# Kokoro lives in the HyperFrames-managed venv (as in the neutrino production); point the CLI at it when present
_kv = os.path.expanduser("~/.cache/hyperframes/kokoro-venv/" + ("Scripts/python.exe" if sh else "bin/python"))
if "HYPERFRAMES_PYTHON" not in os.environ and os.path.exists(_kv): os.environ["HYPERFRAMES_PYTHON"] = _kv
for s in N["sentences"]:
    key = hashlib.sha1(f'{s["text"]}|{s.get("voice", voice)}|{s.get("speed", speed)}'.encode()).hexdigest()
    out = f'production/vo/{s["id"]}.wav'
    if os.path.exists(out) and hashes.get(s["id"]) == key: continue
    print("tts", s["id"], s["text"][:60])
    subprocess.run(HF + ["tts", s["text"], "-v", s.get("voice", voice), "-s", str(s.get("speed", speed)), "-o", out], check=True, shell=sh)
    hashes[s["id"]] = key
json.dump(hashes, open("production/vo/hashes.json", "w"), indent=1)

lead = N.get("lead_in", 0.4); T = {}; t = lead; frames = b""; sr = None
for s in N["sentences"]:
    w = wave.open(f'production/vo/{s["id"]}.wav', "rb"); r = w.getframerate(); assert w.getnchannels() == 1 and w.getsampwidth() == 2
    if sr is None: sr = r; frames = b"\0\0" * int(lead * sr)
    assert r == sr, "sample rate mismatch"
    data = w.readframes(w.getnframes()); d = w.getnframes() / sr; w.close()
    gap = s.get("pause_before", 0.25) if T else 0
    t += gap; frames += b"\0\0" * int(gap * sr)
    T[s["id"]] = [round(t, 3), round(t + d, 3)]; frames += data; t += d
dur = EP["film"].get("duration") or t + EP["film"].get("tail", 1.5)
frames += b"\0\0" * max(0, int((dur - t) * sr))
w = wave.open("assets/audio/narration.wav", "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(frames); w.close()
json.dump(T, open("production/timing.json", "w"), indent=0)
print("timing", {k: v[0] for k, v in T.items()}, "voice ends", round(t, 3), "film", round(dur, 3))

def estimate_words(path, text, off):
    """Fallback when no ASR is installed: syllable-weighted word spans snapped to energy minima of the real VO.
    Every entry is labelled method=estimated; plan.mjs reports anchors that depend on it."""
    import re, numpy as np
    w = wave.open(path, "rb"); sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(float); w.close()
    hop = int(sr * 0.01); e = np.array([np.sqrt((a[i:i + hop] ** 2).mean() + 1e-9) for i in range(0, len(a) - hop, hop)])
    thr = e.max() * 0.06; voiced = np.where(e > thr)[0]
    t0, t1 = (voiced[0] * 0.01, voiced[-1] * 0.01) if len(voiced) else (0, len(a) / sr)
    toks = re.findall(r"[A-Za-z0-9']+[,.;:!?]?", text)
    syl = lambda x: max(1, len(re.findall(r"[aeiouy]+", x.lower().rstrip(",.;:!?"))))
    wts = [syl(x) + (1.2 if x[-1] in ",.;:!?" else 0) for x in toks]; tot = sum(wts)
    sm = np.convolve(e, np.ones(5) / 5, mode="same"); out = []; c = t0
    for x, wt in zip(toks, wts):
        st = c; en = c + (t1 - t0) * wt / tot
        i = int(en / 0.01); lo, hi = max(0, i - 8), min(len(sm) - 1, i + 8)
        if hi > lo: en = (lo + int(np.argmin(sm[lo:hi]))) * 0.01
        out.append({"w": x.rstrip(",.;:!?"), "start": round(off + st, 3), "end": round(off + en, 3), "method": "estimated"}); c = en
    return out

if "--no-words" not in sys.argv:
    words = {}
    for s in N["sentences"]:
        tmp = f'production/vo/_tr_{s["id"]}'
        shutil.rmtree(tmp, ignore_errors=True); os.makedirs(tmp)
        p = subprocess.run(HF + ["transcribe", f'production/vo/{s["id"]}.wav', "-d", tmp, "--json"], capture_output=True, text=True, shell=sh)
        res = None
        try: res = json.loads(p.stdout.strip().splitlines()[-1])
        except Exception: pass
        cand = glob.glob(f"{tmp}/**/*.json", recursive=True)
        ws = None
        for c in cand + ([None] if res else []):
            data = json.load(open(c, encoding="utf8")) if c else res
            arr = data if isinstance(data, list) else (data.get("words") or data.get("transcript") or data.get("segments") or [])
            if isinstance(arr, list) and arr and isinstance(arr[0], dict) and ("start" in arr[0]):
                ws = arr; break
        off = T[s["id"]][0]
        if not ws:
            words[s["id"]] = estimate_words(f'production/vo/{s["id"]}.wav', s["text"], off)
            print("  ESTIMATED word timing for", s["id"], "(ASR unavailable:", (p.stdout or "").strip()[-120:], ")")
            shutil.rmtree(tmp, ignore_errors=True); continue
        words[s["id"]] = [{"w": (x.get("text") or x.get("word") or "").strip(), "start": round(off + float(x["start"]), 3), "end": round(off + float(x.get("end", x["start"])), 3)} for x in ws]
        shutil.rmtree(tmp, ignore_errors=True)
    json.dump(words, open("production/words.json", "w"), indent=0)
    print("word timing for", len(words), "of", len(N["sentences"]), "sentences")
