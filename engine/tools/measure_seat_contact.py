# Deterministic seat-contact SURFACE measurement on an approved seated figure (distinct from its internal body root):
# bottom silhouette profile around the reviewed support_point; the contact segment is the contiguous run of columns whose lowest opaque
# pixel (within the seat band) stays within tol px of the support point's height. Output in master pixels; nothing is painted.
#   python -I engine/tools/measure_seat_contact.py <master.png> <LANDMARK_SIDECAR.json> <out.json> [band_px=90] [tol_px=8]
import sys, json, hashlib, numpy as np, cv2
f, side, out = sys.argv[1], sys.argv[2], sys.argv[3]; band = int(sys.argv[4]) if len(sys.argv) > 4 else 90; tol = int(sys.argv[5]) if len(sys.argv) > 5 else 8
raw = open(f, "rb").read(); im = cv2.imdecode(np.frombuffer(raw, np.uint8), cv2.IMREAD_UNCHANGED); a = im[:, :, 3] > 127
L = json.load(open(side))["landmarks"]; sx, sy = [int(round(v)) for v in L["support_point"]]; rx, ry = L["root_point"]
def low(x):
    # bottom of the opaque run that contains the support height: the body's underside in that column (not the feet/legs further down)
    ys = np.nonzero(a[:, x])[0]
    if not len(ys): return None
    for r in np.split(ys, np.nonzero(np.diff(ys) > 1)[0] + 1):
        if r[0] <= sy <= r[-1] and r[-1] - sy <= band: return int(r[-1])
    return None
y0 = low(sx)
if y0 is None: raise SystemExit("support_point is not inside the figure's seat region")
x = sx; seg = []
while x >= 0 and (y := low(x)) is not None and abs(y - y0) <= tol: seg.insert(0, (x, y)); x -= 1
x = sx + 1
while x < a.shape[1] and (y := low(x)) is not None and abs(y - y0) <= tol: seg.append((x, y)); x += 1
xs = np.array([p[0] for p in seg]); ys = np.array([p[1] for p in seg])
k, b = np.polyfit(xs, ys, 1) if len(seg) > 2 else (0.0, float(sy))
res = {"tool": "measure_seat_contact_v1", "master_sha256": hashlib.sha256(raw).hexdigest(), "internal_root": {"landmark": "root_point", "xy": [rx, ry], "role": "body root (rig joint); never a contact point"},
       "external_seat_contact": {"landmark": "support_point", "xy": [sx, sy], "support_point_inside_body_by_px": y0 - sy, "surface_point_below_support": [sx, y0], "segment": [[int(xs.min()), round(k * xs.min() + b, 2)], [int(xs.max()), round(k * xs.max() + b, 2)]], "length_px": int(xs.max() - xs.min() + 1), "slope_deg": round(float(np.degrees(np.arctan(k))), 2), "max_deviation_px": round(float(np.abs(ys - (k * xs + b)).max()), 2), "columns": len(seg)},
       "root_to_contact_px": [round(sx - rx, 2), round(y0 - ry, 2)], "params": {"band_px": band, "tol_px": tol},
       "placement": "solve against the approved restaurant's seat surface: contact segment lies on the seat top line; root follows rigidly (pending the corrected ENV01 plate)"}
json.dump(res, open(out, "w"), indent=1); print(json.dumps(res))
