# Palette-region landmark measurement (general): for flat-colour artwork, a landmark is a measured property of a connected colour region
# seeded at a point the operator names — never a free-hand coordinate. Each query: {name, seed:[x,y], palette:[[r,g,b],...], tol, measure}
#   measure: "lowest" (max-y pixel; x = mean x of that row), "highest", "centroid", "leftmost", "rightmost", "bbox"
# Output: {name: {xy|bbox, area_px, seed, palette}} plus each region's pixel count. Alpha < 128 is never part of a region.
#   python -I engine/tools/palette_landmarks.py <image.png> <queries.json> <out.json>
import sys, json
from collections import deque
from PIL import Image
import numpy as np
img = np.asarray(Image.open(sys.argv[1]).convert("RGBA")).astype(np.int32); H, W = img.shape[:2]; Q = json.load(open(sys.argv[2])); out = {}
for q in Q:
    pal = np.array(q["palette"], dtype=np.int32); tol = q.get("tol", 24)
    d = np.min(np.stack([np.abs(img[..., :3] - p).max(axis=2) for p in pal]), axis=0); m = (d <= tol) & (img[..., 3] >= 128)
    sx, sy = q["seed"]
    if not m[sy, sx]: out[q["name"]] = {"error": f"seed {q['seed']} not in palette {q['palette']} (pixel {img[sy, sx].tolist()})"}; continue
    seen = np.zeros_like(m); dq = deque([(sy, sx)]); seen[sy, sx] = True; ys, xs = [], []
    while dq:
        y, x = dq.popleft(); ys.append(y); xs.append(x)
        for ny, nx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
            if 0 <= ny < H and 0 <= nx < W and m[ny, nx] and not seen[ny, nx]: seen[ny, nx] = True; dq.append((ny, nx))
    ys, xs = np.array(ys), np.array(xs); me = q["measure"]; r = {"area_px": int(len(xs)), "seed": q["seed"]}
    if me == "lowest": y = ys.max(); r["xy"] = [float(xs[ys == y].mean()), float(y)]
    elif me == "highest": y = ys.min(); r["xy"] = [float(xs[ys == y].mean()), float(y)]
    elif me == "leftmost": x = xs.min(); r["xy"] = [float(x), float(ys[xs == x].mean())]
    elif me == "rightmost": x = xs.max(); r["xy"] = [float(x), float(ys[xs == x].mean())]
    elif me == "centroid": r["xy"] = [float(xs.mean()), float(ys.mean())]
    r["bbox"] = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())]; out[q["name"]] = r
json.dump(out, open(sys.argv[3], "w"), indent=1); print(json.dumps({k: v.get("xy", v.get("error")) for k, v in out.items()}))
