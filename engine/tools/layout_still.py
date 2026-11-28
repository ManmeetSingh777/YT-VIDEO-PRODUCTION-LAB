# World-layout verification still (general): places registered art by its pixel->canonical matrix and a world placement
# world = root_world + (canonical - root_rest) * root_scale ; canonical = A * native_px  (A = crop_to_canonical_matrix, similarity).
# Input JSON: {"canvas":[w,h], "items":[{"file", "matrix":[a,b,c,d,e,f], "root_rest":[x,y], "root_world":[x,y], "root_scale":s, "label"}], "marks":[{"xy":[x,y],"label"}]}
#   python -I engine/tools/layout_still.py <layout.json> <out.png>
import sys, json
from PIL import Image, ImageDraw
L = json.load(open(sys.argv[1])); W, H = L["canvas"]; out = Image.new("RGBA", (W, H), (40, 40, 40, 255)); d = ImageDraw.Draw(out)
for it in L["items"]:
    a, b, c, dd, e, f = it["matrix"]; s = (a * a + b * b) ** 0.5 * it.get("root_scale", 1)
    im = Image.open(it["file"]).convert("RGBA"); im = im.resize((max(1, round(im.width * s)), max(1, round(im.height * s))), Image.LANCZOS)
    rx, ry = it["root_rest"]; wx, wy = it["root_world"]; rs = it.get("root_scale", 1)
    x0 = wx + (e - rx) * rs; y0 = wy + (f - ry) * rs
    out.alpha_composite(im, (round(x0), round(y0))) if 0 <= round(x0) and 0 <= round(y0) else out.paste(im, (round(x0), round(y0)), im)
for m in L.get("marks", []):
    x, y = m["xy"]; d.ellipse([x - 5, y - 5, x + 5, y + 5], outline=(255, 0, 255, 255), width=2); d.text((x + 7, y - 7), m["label"], fill=(255, 0, 255, 255))
out.convert("RGB").save(sys.argv[2]); print(sys.argv[2])
