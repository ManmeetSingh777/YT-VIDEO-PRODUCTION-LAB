// CODE-NATIVE STYLE ADAPTER v1 — drawing operations derived from the F01–F80 construction methods.
// Each export names the method(s) it executes. These are OPERATIONS (how a form is built), never a palette,
// head ratio, outline weight or density preset. Values are chosen per episode/world/identity by the caller.
// See style/CODE_NATIVE_STYLE_ADAPTER_V1.md for the rule → operation → pixel-test mapping.
import { rng } from "./nu_lib.mjs";

const f1 = (v) => +(+v).toFixed(1);
let _uid = 0;
export const uid = (p = "u") => `${p}${(_uid++).toString(36)}`;

/* ---------- F02 / F04.1 / F46 / F62: opaque surface = owned fill + attached light/shade planes ----------
   Construction: geometry path is drawn once (no fill). The visible body is the SHADE tone; a copy of the same
   geometry offset TOWARD the scene light is filled with the BASE tone and clipped by the body → the remaining
   crescent on the far side is the core-shadow plane. A second, further-offset copy (optional) is the light plane.
   Planes are therefore always attached to (clipped by) their parent silhouette, crisp (no blur), and the runtime
   re-aims them every frame from the light direction and the part's world rotation (MN surfs / limbs).
   No outline unless `rim` is declared for a material that owns one (glass frame, bevel, lip). */
export function surf(id, d, o = {}) {
  const { base, shade = base, hi, k = 10, hk = 0, rim, inner = "", over = "", attrs = "", lit = true, op } = o;
  const H = hi && hk ? `<use id="${id}-H" href="#${id}-d" fill="${hi}"/>` : "";
  const L = lit ? `<use id="${id}-L" href="#${id}-d" fill="${base}" transform="translate(${f1(-k * 0.57)} ${f1(-k * 0.82)})"/>` : "";
  return `<g id="${id}" ${attrs}${op !== undefined ? ` opacity="${op}"` : ""}><defs><path id="${id}-d" d="${d}"/><clipPath id="${id}-c"><use href="#${id}-d"/></clipPath></defs>` +
    `<use id="${id}-S" href="#${id}-d" fill="${lit ? shade : base}"/>` +
    `<g clip-path="url(#${id}-c)">${L}${H}${inner}</g>` +
    (rim ? `<use href="#${id}-d" fill="none" stroke="${rim.color}" stroke-width="${rim.w ?? 3}" stroke-linejoin="round"/>` : "") + over + `</g>`;
}

/* ---------- F04.2 / F13 / F63: optical material (glass, lens, visor, screen pane) ----------
   Physical region first: rim (owned edge) → transmitted interior (what is behind/inside, clipped) → bounded
   reflection patches clipped to the pane → optional glint. Nothing optical escapes the pane mask. */
export function glass(id, d, o = {}) {
  const { tint = "#9fd8ff", tintOp = 0.25, inside = "", reflect = [], reflectFill = "#ffffff", reflectOp = 0.35, rim, glint } = o;
  return `<g id="${id}"><defs><path id="${id}-d" d="${d}"/><clipPath id="${id}-c"><use href="#${id}-d"/></clipPath></defs>` +
    `<g clip-path="url(#${id}-c)">${inside}<use href="#${id}-d" fill="${tint}" opacity="${tintOp}"/>` +
    reflect.map((p, i) => `<path id="${id}-r${i}" d="${p}" fill="${reflectFill}" opacity="${reflectOp}"/>`).join("") + `</g>` +
    (rim ? `<use href="#${id}-d" fill="none" stroke="${rim.color}" stroke-width="${rim.w ?? 4}"/>` : "") +
    (glint ? `<circle cx="${glint[0]}" cy="${glint[1]}" r="${glint[2] || 4}" fill="#fff"/>` : "") + `</g>`;
}

/* ---------- F04.3 / F13 / F63: emissive physical element ----------
   The emitter geometry exists and stays crisp; the halo is a separate, data-fx-tagged layer added after it.
   QA mode `nofx` removes every data-fx layer: the emitter must still read (F04 test). */
export function emissive(id, d, o = {}) {
  const { core = "#fff6c8", color = "#ffd34d", halo = true, haloR = 120, haloOp = 0.55, at = [0, 0], inner = "" } = o;
  const gid = `${id}-g`;
  return `<g id="${id}"><defs><radialGradient id="${gid}"><stop offset="0" stop-color="${color}" stop-opacity="${haloOp}"/><stop offset=".45" stop-color="${color}" stop-opacity="${haloOp * 0.3}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient></defs>` +
    (halo ? `<circle id="${id}-halo" data-fx="halo" cx="${at[0]}" cy="${at[1]}" r="${haloR}" fill="url(#${gid})"/>` : "") +
    `<path id="${id}-e" d="${d}" fill="${core}"/>${inner}</g>`;
}

/* ---------- F03 / F51 / F61: palette = ROLE table per scene, validated, never a universal swatch set ---------- */
const lum = (hex) => { const c = hex.replace("#", ""); const v = [0, 2, 4].map((i) => parseInt(c.slice(i, i + 2), 16) / 255).map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)); return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2]; };
export const contrast = (a, b) => { const la = lum(a), lb = lum(b); return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05); };
/** roles: {env, focal, anchor, accent?, emissive?, recede?} each a hex; returns roles + measured warnings */
export function roles(name, r, { focalMin = 1.6, recedeMax = 1.5 } = {}) {
  const warn = [];
  if (r.env && r.focal && contrast(r.env, r.focal) < focalMin) warn.push(`${name}: focal/env contrast ${contrast(r.env, r.focal).toFixed(2)} < ${focalMin} (F03: focal silhouette must separate from its immediate backdrop)`);
  if (r.env && r.recede && contrast(r.env, r.recede) > recedeMax) warn.push(`${name}: recede/env contrast ${contrast(r.env, r.recede).toFixed(2)} > ${recedeMax} (F47: low-salience infrastructure should recede)`);
  if (warn.length) console.warn("[style]", warn.join("\n[style] "));
  return Object.assign({ name, warnings: warn }, r);
}
/** value-compress a color toward an environment color (atmospheric recession, F11 strata / F47 distance) */
export function recede(hex, envHex, amt) {
  const h = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const a = h(hex), b = h(envHex);
  return "#" + a.map((v, i) => Math.round(v + (b[i] - v) * amt).toString(16).padStart(2, "0")).join("");
}
/** Q01 (foundation test, REPAIR_DEMONSTRATED pending): figure/support value separation.
    Raise a material toward `toward` until its contrast against the support role reaches `min`.
    Applies when the support is DARK; on a light support (dark garments are the anchor) min should stay ≤ 1. */
export function separate(hex, supportHex, min = 1, toward = "#ffffff") {
  if (!min || min <= 1) return hex;
  let c = hex, a = 0;
  while (contrast(c, supportHex) < min && a < 0.9) { a += 0.03; c = recede(hex, toward, a); }
  return c;
}
export function shadeOf(hex, amt = 0.2, toward = "#1a1030") { return recede(hex, toward, amt); }
export function lightOf(hex, amt = 0.2, toward = "#ffffff") { return recede(hex, toward, amt); }

/* ---------- F08 / F38 / F60 / F70: one projection grammar for a whole world ----------
   oblique(depthVector): every box/prism in the world shares the same receding vector, so extended edges agree.
   faces: {front, side, top} fills; recesses and grids are generated ON a face plane (F76). */
export function oblique(dx = 0.45, dy = -0.32) {
  const P = {
    dx, dy,
    /** front face at (x,y,w,h) receding by depth d */
    box(x, y, w, h, d, f, id = "") {
      const ox = dx * d, oy = dy * d;
      const front = `M${x},${y} H${x + w} V${y + h} H${x}Z`;
      const side = dx >= 0 ? `M${x + w},${y} L${x + w + ox},${y + oy} L${x + w + ox},${y + h + oy} L${x + w},${y + h}Z` : `M${x},${y} L${x + ox},${y + oy} L${x + ox},${y + h + oy} L${x},${y + h}Z`;
      const top = `M${x},${y} L${x + ox},${y + oy} L${x + w + ox},${y + oy} L${x + w},${y}Z`;
      return `<g ${id ? `id="${id}"` : ""}><path d="${side}" fill="${f.side}"/><path d="${top}" fill="${f.top}"/><path d="${front}" fill="${f.front}"/>${f.frontInner || ""}</g>`;
    },
    /** grid of recessed openings snapped to a front face: each opening shows its own inner side wall */
    grid(x, y, w, h, rows, cols, o = {}) {
      const { pad = 0.18, fill = "#20304f", wall = "#0f1a33", lit = null, seed = 1, litP = 0.35 } = o;
      const R = rng(seed), cw = w / cols, rh = h / rows, out = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const X = x + c * cw + cw * pad, Y = y + r * rh + rh * pad, W = cw * (1 - 2 * pad), Hh = rh * (1 - 2 * pad);
        const on = lit && R() < litP;
        const dep = Math.min(W, Hh) * 0.22;
        out.push(`<rect x="${f1(X)}" y="${f1(Y)}" width="${f1(W)}" height="${f1(Hh)}" fill="${on ? lit : fill}"/>` +
          `<path d="M${f1(X)},${f1(Y)} h${f1(W)} l${f1(-dx * dep)},${f1(-dy * dep)} h${f1(-W)}Z" fill="${wall}" opacity=".8"/>`);
      }
      return out.join("");
    },
  };
  return P;
}

/* ---------- F54 / F76 / F24: repeats come from a parent-owned generator ----------
   Points are seeded INSIDE a parent polygon (with exclusions), size/orientation follow parent rules.
   draw(i, x, y, s, R) returns markup; nothing can float outside its owner. */
export function insidePoly(p, poly) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
export function repeat(poly, o) {
  const { n = 30, seed = 3, minDist = 20, exclude = [], size = [0.7, 1.3], draw, sizeBy } = o;
  const R = rng(seed);
  const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const pts = [];
  let tries = 0;
  while (pts.length < n && tries++ < n * 60) {
    const p = [x0 + R() * (x1 - x0), y0 + R() * (y1 - y0)];
    if (!insidePoly(p, poly) || exclude.some((e) => insidePoly(p, e))) continue;
    if (pts.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < minDist)) continue;
    pts.push(p);
  }
  pts.sort((a, b) => a[1] - b[1]); // far (higher) first so nearer units overlap them
  return pts.map((p, i) => { const s = sizeBy ? sizeBy(p) : size[0] + R() * (size[1] - size[0]); return draw(i, f1(p[0]), f1(p[1]), s, R); }).join("");
}

/* ---------- F10 / F11 / F47 / F79: depth strata with value recession and overscan ----------
   A world layer is drawn wider than the frame (camera footprint) and receives an atmospheric veil
   proportional to its distance; the camera rig gives it parallax depth d. */
export function stratum(id, inner, { veil, veilOp = 0, overscan = [-600, -400, 3120, 1880] } = {}) {
  return `<g id="${id}">${inner}${veil && veilOp ? `<rect x="${overscan[0]}" y="${overscan[1]}" width="${overscan[2]}" height="${overscan[3]}" fill="${veil}" opacity="${veilOp}" pointer-events="none"/>` : ""}</g>`;
}

/* ---------- F06: contact anchors (only where the world's treatment uses them) ---------- */
export const contactShadow = (id, x, y, w, col = "#000", op = 0.22) => `<ellipse id="${id}" cx="${x}" cy="${y}" rx="${w / 2}" ry="${Math.max(4, w * 0.09)}" fill="${col}" opacity="${op}"/>`;

/* ---------- F16 / F21 / F48 / F78 / F79: masks own their alpha; world-within-world = two complete worlds ---------- */
export const clipGroup = (id, clipD, inner, extra = "") => `<g id="${id}" ${extra}><defs><clipPath id="${id}-clip"><path id="${id}-cp" d="${clipD}"/></clipPath></defs><g clip-path="url(#${id}-clip)">${inner}</g></g>`;
/** mask with animatable white/black shapes (ids exposed for S.k) */
export const maskGroup = (id, maskInner, inner, extra = "") => `<g id="${id}" ${extra}><defs><mask id="${id}-mask" maskUnits="userSpaceOnUse" x="-4000" y="-4000" width="10000" height="10000">${maskInner}</mask></defs><g mask="url(#${id}-mask)">${inner}</g></g>`;
/** portal / window / screen: complete inner world, masked by the opening, then an owned rim drawn over it */
export function portal(id, d, innerWorld, rimSvg = "") {
  return `<g id="${id}"><defs><clipPath id="${id}-clip"><path id="${id}-cp" d="${d}"/></clipPath></defs><g clip-path="url(#${id}-clip)"><g id="${id}-world">${innerWorld}</g></g>${rimSvg}</g>`;
}

/* ---------- F06 / F66 hands: a construction FUNCTION, parameterized per character (not a template) ----------
   Builds a closed hand silhouette (palm + n fingers + thumb) from per-identity proportions and a finger curl
   0..1 per digit. Different curl sets are morph targets of one topology → continuous open↔fist↔point↔grip. */
export function handPath(o) {
  const { palmW = 30, palmH = 26, fingers = 4, fLen = 22, fW = 8.5, thumbLen = 18, curl = [], thumbCurl = 0, spread = 0 } = o;
  const pts = [];
  const top = 0, hw = palmW / 2;
  // wrist bottom-left → around the fingers → thumb → back to wrist. Fingers point +y (down) like the rig limbs.
  pts.push([-hw * 0.8, top]);
  pts.push([-hw, top + palmH * 0.55]);
  for (let i = 0; i < fingers; i++) {
    const fx = -hw + fW * 0.5 + (i * (palmW - fW)) / Math.max(1, fingers - 1);
    const c = curl[i] ?? 0, L = fLen * (1 - 0.72 * c), ang = ((i - (fingers - 1) / 2) * spread * 7) * Math.PI / 180;
    const bx = fx, by = top + palmH;
    const tx = bx + Math.sin(ang) * L - c * fW * 0.6, ty = by + Math.cos(ang) * L - c * 3;
    pts.push([bx - fW / 2, by - 1], [tx - fW / 2 * Math.cos(ang), ty + 0], [tx, ty + fW * 0.45 * (1 - c * 0.5)], [tx + fW / 2 * Math.cos(ang), ty], [bx + fW / 2, by - 1]);
  }
  pts.push([hw, top + palmH * 0.45]);
  const tc = thumbCurl;
  pts.push([hw + thumbLen * (0.75 - tc * 0.55), top + palmH * 0.25 + thumbLen * (0.5 + tc * 0.4)], [hw + thumbLen * (0.55 - tc * 0.6) , top + palmH * 0.25 + thumbLen * (0.85 + tc * 0.2)], [hw - 2, top + palmH * 0.72]);
  pts.push([hw * 0.8, top]);
  return "M" + pts.map((p) => `${f1(p[0])},${f1(p[1])}`).join(" L") + "Z";
}

/* ---------- QA render modes that make construction rules testable in pixels ----------
   silhouette (F01/F58): every [data-focal] subject filled black on white — identity must read at 1/10 size
   flat       (F02):     strokes removed — the form must survive without contour lines
   nofx       (F04/F63): every [data-fx] halo/bloom removed — emitters/structures must remain legible */
export function qaCSS(mode) {
  if (mode === "silhouette") return `#root{background:#fff!important} #root svg *{fill:#fff!important;stroke:#fff!important} #root [data-focal],#root [data-focal] *{fill:#000!important;stroke:#000!important} #root [data-fx]{display:none!important}`;
  if (mode === "flat") return `#root svg *{stroke-width:0!important}`;
  if (mode === "nofx") return `#root [data-fx]{display:none!important}`;
  return "";
}
