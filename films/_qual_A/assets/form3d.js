/* FORM3D — shared (Node build + browser runtime) form-construction core.
   Geometry is COMPUTED from designed construction data, never typed as finished 2D outlines:
   - joints: hierarchy with 3D placement; pose = Euler (yaw, pitch, roll) channels, or an "aim" basis from IK
   - masses: superquadric volumes (radii, squareness e1/e2, taper, local rotation) owned by a joint
   - groups: one MATERIAL owner = union of masses; rendered as flat fills (base / shade / light planes)
   - features: shapes authored in a mass's SURFACE tangent plane at (lat, lon); projected with the mass,
     hidden when the surface turns away; expression states are point-array blends in surface space
   One decided view rotation projects everything (orthographic; x right, y down, z toward the viewer),
   so every part shares one perspective by construction. */
(function (root) {
  const D = Math.PI / 180;
  const I = () => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0];
  function mul(A, B) {
    const r = new Array(12);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) r[i * 4 + j] = A[i * 4] * B[j] + A[i * 4 + 1] * B[4 + j] + A[i * 4 + 2] * B[8 + j];
      r[i * 4 + 3] = A[i * 4] * B[3] + A[i * 4 + 1] * B[7] + A[i * 4 + 2] * B[11] + A[i * 4 + 3];
    }
    return r;
  }
  const T = (x, y, z) => [1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z];
  const Rx = (a) => { const c = Math.cos(a * D), s = Math.sin(a * D); return [1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0]; };
  const Ry = (a) => { const c = Math.cos(a * D), s = Math.sin(a * D); return [c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0]; };
  const Rz = (a) => { const c = Math.cos(a * D), s = Math.sin(a * D); return [c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0]; };
  /** yaw: turn toward screen-right (+), pitch: look up (+), roll: tilt clockwise (+) */
  const E = (yaw = 0, pitch = 0, roll = 0) => mul(mul(Ry(yaw), Rx(pitch)), Rz(roll));
  const ap = (M, p) => [M[0] * p[0] + M[1] * p[1] + M[2] * p[2] + M[3], M[4] * p[0] + M[5] * p[1] + M[6] * p[2] + M[7], M[8] * p[0] + M[9] * p[1] + M[10] * p[2] + M[11]];
  const dv = (M, p) => [M[0] * p[0] + M[1] * p[1] + M[2] * p[2], M[4] * p[0] + M[5] * p[1] + M[6] * p[2], M[8] * p[0] + M[9] * p[1] + M[10] * p[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sc = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], len = (a) => Math.hypot(a[0], a[1], a[2]);
  const nrm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const sp = (w, e) => Math.sign(w) * Math.pow(Math.abs(w), e);

  /** superquadric surface point in the mass's local frame. lat: +90 top … -90 bottom; lon: 0 = front (+z), +90 = +x side */
  function sq(m, lat, lon) {
    const v = -lat * D, u = (90 - lon) * D;
    const e1 = m.e ? m.e[0] : 1, e2 = m.e ? m.e[1] : 1;
    const cv = Math.cos(v), sv = Math.sin(v), cu = Math.cos(u), su = Math.sin(u);
    const y = m.r[1] * sp(sv, e1);
    const t = m.taper || [0, 0], k = y / (m.r[1] || 1);
    return [m.r[0] * sp(cv, e1) * sp(cu, e2) * (1 + t[0] * k), y, m.r[2] * sp(cv, e1) * sp(su, e2) * (1 + t[1] * k)];
  }
  function massMatrix(m, J) { return mul(mul(J, T(m.at[0], m.at[1], m.at[2])), m.rot ? E(m.rot[0], m.rot[1], m.rot[2]) : I()); }

  function hull(P) {
    const p = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    up.pop(); lo.pop(); return lo.concat(up);
  }
  /** closed smooth path through points (Catmull-Rom → cubic) */
  function smooth(P, k = 1 / 6) {
    const n = P.length; if (n < 3) return "";
    let d = `M${P[0][0].toFixed(1)},${P[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const a = P[(i - 1 + n) % n], b = P[i], c = P[(i + 1) % n], e = P[(i + 2) % n];
      d += ` C${(b[0] + (c[0] - a[0]) * k).toFixed(1)},${(b[1] + (c[1] - a[1]) * k).toFixed(1)} ${(c[0] - (e[0] - b[0]) * k).toFixed(1)},${(c[1] - (e[1] - b[1]) * k).toFixed(1)} ${c[0].toFixed(1)},${c[1].toFixed(1)}`;
    }
    return d + "Z";
  }
  function openPath(P) { return "M" + P.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L"); }
  /** drop near-duplicate hull points so curvature stays designed, not noisy */
  function thin(P, minD) { const o = []; for (const p of P) if (!o.length || Math.hypot(p[0] - o[o.length - 1][0], p[1] - o[o.length - 1][1]) > minD) o.push(p); return o; }

  /** evaluate a form spec under a pose → { joints, masses:{id:{d,z,M}}, groups:[...], features:[...] } */
  function evaluate(spec, pose = {}, view) {
    const V = view || E(spec.view.yaw, spec.view.pitch, spec.view.roll);
    const Jw = {};
    const ch = (j, k, d = 0) => (pose[j + "." + k] !== undefined ? pose[j + "." + k] : d);
    for (const j of spec.joints) {
      const P = j.parent ? Jw[j.parent] : mul(T(spec.place[0], spec.place[1], 0), mul(V, T(0, 0, 0)));
      const rest = j.rest || [0, 0, 0];
      if (pose.__aim && pose.__aim[j.name]) { Jw[j.name] = pose.__aim[j.name]; continue; }
      const off = pose[j.name + ".off"] || [0, 0, 0];
      Jw[j.name] = mul(mul(P, T(j.at[0] + off[0], j.at[1] + off[1], j.at[2] + off[2])), E(ch(j.name, "yaw", rest[0]), ch(j.name, "pitch", rest[1]), ch(j.name, "roll", rest[2])));
    }
    const masses = {};
    // AUTHORED CONTOURS: designed outlines in a joint's frame, homologous view keys blended by the part's world yaw
    for (const c of spec.contours || []) {
      const Jc = Jw[c.joint]; if (!Jc) continue;
      if (c.state && !(pose["state." + c.state[0]] === c.state[1] || (pose["state." + c.state[0]] === undefined && c.state[2]))) continue;
      const f = dv(Jc, [0, 0, 1]); let yaw = Math.atan2(f[0], f[2]) / D; const mirror = c.mirror && yaw < 0; if (mirror) yaw = -yaw;
      const keys = c.views; let a = keys[0], b = keys[0], w = 0;
      for (let i = 0; i < keys.length - 1; i++) if (yaw >= keys[i][0] && yaw <= keys[i + 1][0]) { a = keys[i]; b = keys[i + 1]; w = (yaw - a[0]) / (b[0] - a[0] || 1); }
      if (yaw > keys[keys.length - 1][0]) { a = b = keys[keys.length - 1]; w = 0; }
      const up = dv(Jc, [0, -1, 0]), roll = Math.atan2(up[0], -up[1]), cr = Math.cos(roll), sr = Math.sin(roll);
      const pitchSq = Math.max(0.6, Math.hypot(up[0], up[1]) / (len(up) || 1));
      const o = ap(Jc, c.at || [0, 0, 0]);
      const pts = a[1].map((p, i) => { const q = b[1][i]; let x = p[0] + (q[0] - p[0]) * w, y = (p[1] + (q[1] - p[1]) * w) * pitchSq; if (mirror) x = -x; return [o[0] + x * cr - y * sr, o[1] + x * sr + y * cr, p[2] ?? 1]; });
      const n = pts.length, k = 1 / 6; let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
      for (let i = 0; i < n; i++) { const A_ = pts[(i - 1 + n) % n], B_ = pts[i], C_ = pts[(i + 1) % n], E_ = pts[(i + 2) % n], tb = B_[2] * k, tc = C_[2] * k;
        d += ` C${(B_[0] + (C_[0] - A_[0]) * tb).toFixed(1)},${(B_[1] + (C_[1] - A_[1]) * tb).toFixed(1)} ${(C_[0] - (E_[0] - B_[0]) * tc).toFixed(1)},${(C_[1] - (E_[1] - B_[1]) * tc).toFixed(1)} ${C_[0].toFixed(1)},${C_[1].toFixed(1)}`; }
      masses[c.id] = { d: d + "Z", z: o[2] + (c.zb || 0), M: Jc, c: o, contour: true, viewYaw: +yaw.toFixed(1) };
    }
    for (const m of spec.masses) {
      if (m.state && !(pose["state." + m.state[0]] === m.state[1] || (pose["state." + m.state[0]] === undefined && m.state[2]))) continue;
      const M = massMatrix(m, Jw[m.joint]);
      if (m.substrate) { const c0 = ap(M, [0, 0, 0]); masses[m.id] = { d: "", z: c0[2], M, c: c0, substrate: true }; continue; }
      const nLat = m.nLat || 10, nLon = m.nLon || 20, pts = [];
      for (let a = 0; a <= nLat; a++) for (let b = 0; b < nLon; b++) { const p = ap(M, sq(m, -90 + (180 * a) / nLat, (360 * b) / nLon)); pts.push([p[0], p[1]]); }
      const c = ap(M, [0, 0, 0]);
      masses[m.id] = { d: smooth(thin(hull(pts), 1.2), m.round ?? 1 / 6), z: c[2] + (m.zb || 0), M, c };
    }
    const groups = spec.groups.map((g) => {
      const ms = g.masses.filter((id) => masses[id] && !masses[id].substrate);
      const z = ms.length ? ms.reduce((s, id) => s + masses[id].z, 0) / ms.length + (g.zb || 0) : -1e9;
      return { id: g.id, z, masses: ms, front: !!g.front };
    });
    const features = [];
    for (const f of spec.features || []) {
      const mm = spec.masses.find((x) => x.id === f.mass); const mw = masses[f.mass]; if (!mm || !mw) continue;
      const lat = f.at[0] + (pose[f.id + ".lat"] || 0), lon = f.at[1] + (pose[f.id + ".lon"] || 0), dl = 1.5;
      const p0 = ap(mw.M, sq(mm, lat, lon));
      const eLat = nrm(sub(ap(mw.M, sq(mm, lat + dl, lon)), ap(mw.M, sq(mm, lat - dl, lon))));
      const eLon = nrm(sub(ap(mw.M, sq(mm, lat, lon + dl)), ap(mw.M, sq(mm, lat, lon - dl))));
      const n = nrm(cross(eLat, eLon));
      // expression states: blend point arrays in SURFACE space (topology must match)
      let shape = f.shape.map((p) => p.slice());
      if (f.states) for (const s in f.states) { const w = pose[f.id + ":" + s] || 0; if (w) f.states[s].forEach((q, i) => { shape[i][0] += (q[0] - f.shape[i][0]) * w; shape[i][1] += (q[1] - f.shape[i][1]) * w; }); }
      const lift = f.lift || 0.5, dn = [0, 0, 0];
      const pts = shape.map(([a, b]) => { const p = add(add(add(p0, sc(eLon, a)), sc(eLat, -b)), sc(n, lift)); return [p[0], p[1]]; });
      const vis = n[2] > (f.minFacing ?? 0.12);
      features.push({ id: f.id, d: f.open ? openPath(pts) : smooth(pts, f.round ?? 1 / 6), visible: vis, facing: n[2], z: p0[2] });
    }
    return { Jw, masses, groups, features };
  }
  /** IK helper: aim basis whose +y axis points from a to b, x axis kept near `side` */
  function aim(a, b, side) {
    const y = nrm(sub(b, a)); let x = nrm(cross(y, side)); if (!isFinite(x[0]) || len(cross(y, side)) < 1e-6) x = [1, 0, 0];
    const z = cross(x, y);
    return [x[0], y[0], z[0], a[0], x[1], y[1], z[1], a[1], x[2], y[2], z[2], a[2]];
  }
  /** two-bone IK in 3D: shoulder S, target Tg, lengths, pole → elbow point (reach validated, not silently clamped) */
  function ik(S, Tg, L1, L2, pole) {
    const d0 = sub(Tg, S); let dist = len(d0); const reach = L1 + L2, unreachable = dist > reach - 0.5 ? +(dist - reach).toFixed(1) : 0;
    dist = Math.min(dist, reach - 0.5);
    const dirv = nrm(d0), Tc = add(S, sc(dirv, dist));
    const a = (L1 * L1 - L2 * L2 + dist * dist) / (2 * dist), h = Math.sqrt(Math.max(0, L1 * L1 - a * a));
    const px = nrm(sub(pole, sc(dirv, dot(pole, dirv))));
    return { elbow: add(add(S, sc(dirv, a)), sc(px, h)), wrist: Tc, unreachable };
  }
  const api = { I, mul, T, Rx, Ry, Rz, E, ap, dv, sub, add, sc, dot, len, nrm, cross, sq, evaluate, aim, ik, hull, smooth };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.FORM3D = api;
})(typeof window !== "undefined" ? window : globalThis);
