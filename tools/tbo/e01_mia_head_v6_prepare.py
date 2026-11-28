# E01 — MIA.H.to_regular (V6 return round01): build the SELECTION mask that removes the shirt collar the request excluded, keeping every
# head/neck/hair pixel exactly. The collar is the teal garment colour family (measured: (0,80,80)/(0,80,96)/(0,64,80)/(0,64,64) ±) below the
# measured chin; its anti-aliased boundary ring (≤2 px, pixels that are neither skin nor hair) goes with it. Nothing is painted: the engine's
# mask_bitmap op (art_prepare.mjs) applies it, re-executably.
#   python -I tools/tbo/e01_mia_head_v6_prepare.py <round01.png> <chin_y> <mask_out.png> <report.json>
import sys, json
from PIL import Image
import numpy as np
src, chin_y, out, rep = sys.argv[1], int(float(sys.argv[2])), sys.argv[3], sys.argv[4]
a = np.asarray(Image.open(src).convert("RGBA")).astype(np.int32); H, W = a.shape[:2]; r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
teal = (g > r + 30) & (b > r + 30) & (r < 110) & (al > 0)
SKIN = [(252, 140, 53), (206, 84, 31), (212, 89, 42), (250, 129, 45)]; HAIR = [(90, 6, 83), (48, 0, 48), (120, 20, 110)]
near = lambda pal, t: np.min(np.stack([np.abs(a[..., :3] - np.array(p)).max(axis=2) for p in pal]), axis=0) <= t
keep_colour = near(SKIN, 34) | near(HAIR, 34)
below = np.zeros((H, W), bool); below[chin_y:, :] = True
collar = teal & below
ring = collar.copy()
for _ in range(2):  # anti-aliased boundary: grow into pixels that are not skin/hair colour (transparent-edge and teal-orange blends)
    g2 = ring.copy(); g2[1:, :] |= ring[:-1, :]; g2[:-1, :] |= ring[1:, :]; g2[:, 1:] |= ring[:, :-1]; g2[:, :-1] |= ring[:, 1:]
    ring = g2 & below & ~keep_colour & (al > 0)
remove = collar | ring
keep = (~remove).astype(np.uint8) * 255
Image.fromarray(np.dstack([keep, keep, keep, np.full_like(keep, 255)]), "RGBA").save(out)
ys, xs = np.nonzero(remove)
json.dump({ "removed_px": int(remove.sum()), "collar_core_px": int(collar.sum()), "boundary_ring_px": int((ring & ~collar).sum()), "removed_bbox": [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())] if len(xs) else None,
  "skin_pixels_removed": int((remove & near(SKIN, 34)).sum()), "chin_y": chin_y }, open(rep, "w"), indent=1)
print(open(rep).read())
