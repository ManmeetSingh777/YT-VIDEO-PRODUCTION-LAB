# Pixel inspection of ACTUAL renders (not snapshots of intent).
#   python inspect.py sheet  <video> <out.png> [--every 1.0 | --at 1,2.5,7] [--from a --to b] [--w 480]
#   python inspect.py frames <video> <outdir> --at 1,2.5           (native-resolution PNGs)
#   python inspect.py pairs  <video> <out.png> --at 3.2,8.0        (frame t and t+1/30 side by side + x6 difference)
#   python inspect.py motion <video>                               (cuts, holds, black frames — from neutrino motion.py)
#   python inspect.py diff   <before.png> <after.png> <out.png> [--box x,y,w,h]   (metrics + x6 diff + side-by-side)
#   python inspect.py thumb  <png> <out.png> [--w 192]             (thumbnail-scale readability check)
import subprocess, sys, os, json
import numpy as np
from PIL import Image, ImageDraw

def arg(k, d=None):
    return sys.argv[sys.argv.index(k) + 1] if k in sys.argv else d

def grab(video, t, w=None):
    vf = ["-vf", f"scale={w}:-2"] if w else []
    p = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.4f}", "-i", video, "-frames:v", "1", *vf, "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True)
    from io import BytesIO
    return Image.open(BytesIO(p.stdout)).convert("RGB")

def duration(video):
    p = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video], capture_output=True, text=True)
    return float(p.stdout.strip())

def times(video):
    if arg("--at"): return [float(x) for x in arg("--at").split(",")]
    d = duration(video); a = float(arg("--from", 0)); b = float(arg("--to", d - 0.05)); e = float(arg("--every", 1.0))
    out = []; t = a
    while t <= b + 1e-6: out.append(round(t, 3)); t += e
    return out

def sheet(video, out):
    ts = times(video); w = int(arg("--w", 480)); ims = [grab(video, t, w) for t in ts]
    h = ims[0].height; cols = min(4, len(ims)); rows = (len(ims) + cols - 1) // cols
    S = Image.new("RGB", (cols * w, rows * (h + 22)), (18, 18, 22)); d = ImageDraw.Draw(S)
    for i, (t, im) in enumerate(zip(ts, ims)):
        x, y = (i % cols) * w, (i // cols) * (h + 22); S.paste(im, (x, y + 22)); d.text((x + 6, y + 5), f"{t:.2f}s", fill=(230, 230, 230))
    S.save(out); print("sheet", out, len(ts), "frames")

def pairs(video, out):
    rows = []
    for t in [float(x) for x in arg("--at").split(",")]:
        a, b = grab(video, t), grab(video, t + 1 / 30)
        A, B = np.asarray(a).astype(int), np.asarray(b).astype(int)
        D = Image.fromarray(np.clip(np.abs(A - B) * 6, 0, 255).astype(np.uint8))
        row = Image.new("RGB", (960 * 3, 540)); [row.paste(im.resize((960, 540)), (i * 960, 0)) for i, im in enumerate([a, b, D])]
        rows.append(row); print(f"pair {t:.3f}: mean |d| {np.abs(A - B).mean():.2f}")
    S = Image.new("RGB", (2880, 540 * len(rows))); [S.paste(r, (0, i * 540)) for i, r in enumerate(rows)]; S.save(out)

def motion(video):
    W, H = 96, 54
    p = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-vf", f"scale={W}:{H},format=gray", "-f", "rawvideo", "-"], capture_output=True).stdout
    a = np.frombuffer(p, dtype=np.uint8).reshape(-1, H, W).astype(float); d = np.abs(np.diff(a, axis=0)).mean((1, 2)); n = len(a)
    res = {"frames": n, "sec": n / 30, "mean_diff": round(d.mean(), 2),
           "cuts": [round((i + 1) / 30, 2) for i in np.where(d > max(14, d.mean() * 5))[0]][:60]}
    hold = d < 0.12; runs = []; s = None
    for i, h in enumerate(hold):
        if h and s is None: s = i
        if not h and s is not None:
            if i - s >= 15: runs.append((round(s / 30, 2), round(i / 30, 2)))
            s = None
    if s is not None and n - 1 - s >= 15: runs.append((round(s / 30, 2), round((n - 1) / 30, 2)))
    res["holds_ge_0.5s"] = runs; res["black"] = [round(i / 30, 2) for i in np.where(a.mean((1, 2)) < 8)[0]][:30]
    print(json.dumps(res))

def diff(b, a, out):
    B, A = Image.open(b).convert("RGB"), Image.open(a).convert("RGB")
    if arg("--box"):
        x, y, w, h = [int(v) for v in arg("--box").split(",")]; B, A = B.crop((x, y, x + w, y + h)), A.crop((x, y, x + w, y + h))
    X, Y = np.asarray(B).astype(float), np.asarray(A).astype(float); D = np.abs(X - Y)
    mse = (D ** 2).mean(); psnr = 99 if mse == 0 else 10 * np.log10(255 ** 2 / mse)
    m = {"mean_abs": round(D.mean(), 3), "changed_px_gt24": round(float((D.max(2) > 24).mean()) * 100, 3), "psnr": round(float(psnr), 2)}
    Dm = Image.fromarray(np.clip(D * 6, 0, 255).astype(np.uint8)); W = min(960, B.width); H = int(B.height * W / B.width)
    S = Image.new("RGB", (W * 3, H + 22), (18, 18, 22)); d = ImageDraw.Draw(S)
    for i, (im, lab) in enumerate([(B, "BEFORE"), (A, "AFTER"), (Dm, "DIFF x6")]): S.paste(im.resize((W, H)), (i * W, 22)); d.text((i * W + 6, 5), lab, fill=(230, 230, 230))
    S.save(out); print(json.dumps(m)); return m

def diffbox(b, a, out):
    """changed-pixel bbox + fraction of changed pixels inside an expected region (x,y,w,h)"""
    B, A_ = np.asarray(Image.open(b).convert("RGB")).astype(int), np.asarray(Image.open(a).convert("RGB")).astype(int)
    D = np.abs(B - A_).max(2) > 12
    ys, xs = np.where(D); m = {"changed_px": int(D.sum()), "changed_pct": round(float(D.mean()) * 100, 3)}
    if len(xs): m["bbox"] = [int(xs.min()), int(ys.min()), int(xs.max() - xs.min()), int(ys.max() - ys.min())]
    if arg("--expect") and len(xs):
        x, y, w, h = [int(v) for v in arg("--expect").split(",")]
        inside = D[y:y + h, x:x + w].sum(); m["inside_expected_pct"] = round(float(inside) / max(1, D.sum()) * 100, 2)
    vis = np.zeros_like(B); vis[D] = [255, 60, 60]; img = (B * 0.45 + vis * 0.55).clip(0, 255).astype(np.uint8)
    Image.fromarray(img).save(out); print(json.dumps(m)); return m

def thumb(png, out):
    w = int(arg("--w", 192)); im = Image.open(png).convert("RGB"); im.resize((w, int(im.height * w / im.width)), Image.LANCZOS).save(out); print("thumb", out)

if __name__ == "__main__":
    c = sys.argv[1]
    if c == "sheet": sheet(sys.argv[2], sys.argv[3])
    elif c == "frames":
        os.makedirs(sys.argv[3], exist_ok=True)
        for t in [float(x) for x in arg("--at").split(",")]: p = os.path.join(sys.argv[3], f"t{t:07.3f}.png"); grab(sys.argv[2], t).save(p); print(p)
    elif c == "pairs": pairs(sys.argv[2], sys.argv[3])
    elif c == "motion": motion(sys.argv[2])
    elif c == "diff": diff(sys.argv[2], sys.argv[3], sys.argv[4])
    elif c == "thumb": thumb(sys.argv[2], sys.argv[3])
    elif c == "diffbox": diffbox(sys.argv[2], sys.argv[3], sys.argv[4])
