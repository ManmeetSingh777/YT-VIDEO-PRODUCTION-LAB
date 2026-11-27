# General-purpose (film inputs only: master, seeds JSON). Deterministic component SELECTION on an approved master: marker-based watershed on the master's own colour edges.
# Inputs: master PNG + seeds JSON {labels: {name: [[x0,y0,x1,y1,...], ...polylines]}, groups: {component: [label,...]}}.
# Output: one keep-mask PNG per component (white opaque = keep) + LABELS.png overlay + SEGMENTATION.json (seeds sha, master sha, mask shas).
# Every opaque master pixel gets exactly one label, so the components re-composite to the master exactly. Nothing is painted.
#   python -I engine/tools/segment_master.py <master.png> <seeds.json> <out_dir>
import sys, json, hashlib, os
import numpy as np, cv2
master, seeds_f, out = sys.argv[1], sys.argv[2], sys.argv[3]; os.makedirs(out, exist_ok=True)
sha = lambda b: hashlib.sha256(b).hexdigest()
raw = open(master, "rb").read(); seeds_raw = open(seeds_f, "rb").read(); S = json.loads(seeds_raw)
im = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_UNCHANGED)  # BGRA
H, W = im.shape[:2]; alpha = im[:, :, 3]
rgb = im[:, :, :3].copy(); rgb[alpha == 0] = (128, 128, 128)
names = list(S["labels"].keys()); markers = np.zeros((H, W), np.int32)
for i, n in enumerate(names, start=1):
    for pl in S["labels"][n]:
        pts = np.array(pl, np.int32).reshape(-1, 2)
        if len(pts) == 1: cv2.circle(markers, tuple(int(v) for v in pts[0]), 2, i, -1)
        else: cv2.polylines(markers, [pts], False, i, 3)
BG = len(names) + 1; markers[alpha == 0] = BG
markers[(alpha > 0) & (markers == BG)] = 0
cv2.watershed(rgb, markers)
# watershed boundary pixels (-1): assign to the most frequent neighbouring label among opaque pixels (deterministic order)
lab = markers.copy()
for _ in range(4):
    b = np.argwhere(lab == -1)
    if not len(b): break
    for y, x in b:
        nb = lab[max(0, y - 1):y + 2, max(0, x - 1):x + 2].ravel(); nb = nb[(nb > 0) & (nb != BG)]
        lab[y, x] = np.bincount(nb).argmax() if len(nb) else BG
# semi-transparent fringe pixels the watershed attached to the background: give each the label of its nearest labelled opaque pixel
fr = (alpha > 0) & ((lab <= 0) | (lab == BG))
if fr.any():
    lab2 = lab.copy(); lab2[(lab2 <= 0) | (lab2 == BG)] = 0
    for _ in range(64):
        if not fr.any(): break
        d = cv2.dilate(lab2.astype(np.float32), np.ones((3, 3), np.uint8)).astype(np.int32)
        fill = fr & (d > 0); lab2[fill] = d[fill]; fr = fr & ~fill
    keep = (alpha > 0) & (lab2 > 0); lab[keep] = lab2[keep]
# colour refinement for small features painted on a flat surface: pixels of a feature label within min_dist of the surface's median colour
# return to that surface; one ring of anti-aliased edge pixels (dist >= rim_dist) stays with the feature (selection only, nothing painted)
for feat, rule in (S.get("colour_refine") or {}).items():
    fid, sid = names.index(feat) + 1, names.index(rule["against"]) + 1
    ref = np.median(rgb[lab == sid].reshape(-1, 3), axis=0); dist = np.linalg.norm(rgb.astype(np.float32) - ref, axis=2)
    core = (lab == fid) & (dist >= rule["min_dist"]); ring = cv2.dilate(core.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
    keep = core | (ring & (lab == fid) & (dist >= rule.get("rim_dist", 12))); lab[(lab == fid) & ~keep] = sid
if S.get("whole_figure"): lab[alpha > 0] = names.index(S["whole_figure"]) + 1  # the component IS the whole approved figure (every opaque pixel)
lab[alpha == 0] = BG
opaque_unlabelled = int(((alpha > 0) & ((lab <= 0) | (lab == BG))).sum())
res = {"tool": "segment_master_v1", "master_sha256": sha(raw), "seeds_sha256": sha(seeds_raw), "size": [W, H], "opaque_unlabelled_px": opaque_unlabelled, "components": {}}
for comp, labs in S["groups"].items():
    ids = [names.index(l) + 1 for l in labs]; keep = np.isin(lab, ids) & (alpha > 0)
    m = np.zeros((H, W, 4), np.uint8); m[keep] = (255, 255, 255, 255)
    ok, enc = cv2.imencode(".png", m); b = enc.tobytes(); s = sha(b)
    ys, xs = np.nonzero(keep)
    open(os.path.join(out, f"{s[:16]}.png"), "wb").write(b)
    res["components"][comp] = {"mask_sha256": s, "pixels": int(keep.sum()), "bbox": [int(xs.min()), int(ys.min()), int(xs.max() - xs.min() + 1), int(ys.max() - ys.min() + 1)] if len(xs) else None}
# overlay for review
rng = np.random.RandomState(7); pal = rng.randint(40, 255, (BG + 1, 3)).astype(np.uint8); pal[BG] = (235, 235, 235)
ov = pal[np.clip(lab, 0, BG)]; ov = (0.45 * ov + 0.55 * rgb).astype(np.uint8)
edge = cv2.Canny(lab.astype(np.uint8), 0, 1) > 0; ov[edge] = (0, 0, 0)
for i, n in enumerate(names, start=1):
    for pl in S["labels"][n]:
        x, y = pl[0], pl[1]; cv2.putText(ov, n, (int(x), int(y)), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (0, 0, 0), 1)
cv2.imwrite(os.path.join(out, "LABELS_OVERLAY.png"), ov)
json.dump(res, open(os.path.join(out, "SEGMENTATION.json"), "w"), indent=1); print(json.dumps(res, indent=1))
