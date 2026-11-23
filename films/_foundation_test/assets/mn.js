/* MN runtime — Motion-Native extension of the neutrino NU runtime (nu.js is loaded first and is UNCHANGED).
   Adds, as pure functions of timeline time t:
   - articulated rigs from build-time metadata (parent-child joints, forward kinematics)
   - channels with successive-breaking lag (NU actor's pose() generalized), expression presets
   - path blendshapes (faces, hands, deformable silhouettes), macro controls, deterministic blinks
   - two-bone IK reach + contact, prop attachment to sockets with release/drop
   - planted-foot walk generator (no sliding feet), arm counter-swing, hip bob
   - damped-spring follow-through (hair, tails, antennae) computed by convolution of past channel values
   - limb contours regenerated from joint positions (bending sleeves/legs with volume, not rigid sticks)
   - surface-attached light/shadow planes that stay on the side away from the scene light as parts rotate
   - camera with parallax depth (NU formula) + target follow + deterministic shake
   No Date, no unseeded random, no timers. Every write goes through S.set so NU's render() owns the DOM. */
(function () {
  const lerp = NU.lerp, clamp = NU.clamp, hash = NU.hash, wig = NU.wig;
  const D2R = Math.PI / 180;
  const A = {
    I: () => [1, 0, 0, 1, 0, 0],
    mul: (m, n) => [m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1], m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3], m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5]],
    T: (x, y) => [1, 0, 0, 1, x, y],
    R: (d) => { const c = Math.cos(d * D2R), s = Math.sin(d * D2R); return [c, s, -s, c, 0, 0]; },
    S: (sx, sy) => [sx, 0, 0, sy, 0, 0],
    K: (d) => [1, 0, Math.tan(d * D2R), 1, 0, 0],
    ap: (m, p) => [m[0] * p[0] + m[2] * p[1] + m[4], m[1] * p[0] + m[3] * p[1] + m[5]],
    inv: (m) => { const det = m[0] * m[3] - m[1] * m[2] || 1e-9; return [m[3] / det, -m[1] / det, -m[2] / det, m[0] / det, (m[2] * m[5] - m[3] * m[4]) / det, (m[1] * m[4] - m[0] * m[5]) / det]; },
    rot: (m) => Math.atan2(m[1], m[0]) / D2R,
    str: (m) => `matrix(${m.map((v) => v.toFixed(4)).join(" ")})`,
  };
  /** local matrix with NU's exact transform order: translate rotate skewX scale */
  const local = (x, y, r, k, sx, sy) => A.mul(A.mul(A.mul(A.T(x, y), A.R(r)), A.K(k)), A.S(sx, sy));
  const wrap = (a) => { a = ((a + 180) % 360 + 360) % 360 - 180; return a; };
  const lerpAng = (a, b, w) => a + wrap(b - a) * w;
  const baseOf = (S, id) => { const e = S.el(id); const b = e && e.getAttribute("data-b"); return b ? b.split(",").map(Number) : [0, 0]; };
  const isScale = (c) => /\.(s|sx|sy)$/.test(c);

  /** scene light. dir: degrees TOWARD the light (screen space, 0=+x, 90=down) as number|keys|fn(t);
      pos: optional point light fn(t)→[x,y] in STAGE space, blended in by posW keys (0..1). */
  function setLight(S, o) {
    if (typeof o === "number" || Array.isArray(o) || typeof o === "function") o = { dir: o };
    const k = (v) => (typeof v === "number" ? [[0, v]] : v);
    S._L = { dir: typeof o.dir === "function" ? o.dir : k(o.dir ?? -125), pos: o.pos || null, posW: k(o.posW ?? 1) };
    return S;
  }
  /** light angle at a STAGE-space point (directional ⊕ point light) */
  function lightAt(S, t, p) {
    const L = S._L || { dir: [[0, -125]], pos: null };
    const d = typeof L.dir === "function" ? L.dir(t) : S.ev(L.dir, t);
    if (!L.pos || !p) return d;
    const w = S.ev(L.posW, t); if (w <= 0) return d;
    const q = L.pos(t); return lerpAng(d, Math.atan2(q[1] - p[1], q[0] - p[0]) / D2R, w);
  }

  /** Unparented surface planes (props, set dressing): lit copy offset follows the scene light. */
  function surfaces(S, list) {
    S.at((t) => {
      for (const s of list) {
        const L = lightAt(S, t, s.pos);
        const rot = s.rot ? s.rot(t) : 0, a = (L - rot) * D2R;
        S.set(s.id + "-L", "x", Math.cos(a) * s.k); S.set(s.id + "-L", "y", Math.sin(a) * s.k);
        if (s.hk) { S.set(s.id + "-H", "x", Math.cos(a) * s.hk); S.set(s.id + "-H", "y", Math.sin(a) * s.hk); }
      }
    });
    return S;
  }

  function rig(S, meta, init = {}) {
    const P = meta.prefix, J = meta.joints, order = meta.order;
    const rest = Object.assign({}, meta.rest || {}, init);
    const ch = {};
    const defOf = (c) => (rest[c] !== undefined ? rest[c] : isScale(c) ? 1 : 0);
    const chan = (c) => (ch[c] || (ch[c] = [[-1e9, defOf(c)]])); // default lives at -inf so keys at negative local times (scene replays) win
    const lagOf = (c) => { const j = c.split(/[.:]/)[0]; return (meta.lag && meta.lag[c] !== undefined) ? meta.lag[c] : (J[j] && J[j].lag) || 0; };
    const alias = (c) => (c === "x" ? "root.x" : c === "y" ? "root.y" : c);
    const iks = [], attaches = [], walks = [], drives = [], posts = [], cacheT = { t: NaN, r: null };
    const anc = {};
    for (const j of order) anc[j] = J[j].parent ? anc[J[j].parent].concat([j]) : [j];

    const R = {
      meta, P,
      /** move to a pose over dur; lag per joint gives successive breaking (lead→trail). d may be an expression name. */
      pose(t, d, dur = 0.4, e = "power2.inOut") {
        if (typeof d === "string") d = meta.expr[d];
        if (d.expr) d = Object.assign({}, meta.expr[d.expr], d), delete d.expr;
        for (const c0 in d) {
          if (c0 === "expr") continue;
          const c = alias(c0), keys = chan(c), lag = lagOf(c), last = keys[keys.length - 1];
          if (t + lag > last[0]) keys.push([t + lag, S.ev(keys, t + lag)]);
          keys.push([t + lag + dur, d[c0], e]);
        }
        return R;
      },
      /** explicit keys on one channel: [[t,v,ease?],...] (times absolute, scene-local) */
      key(c, keys) { const k = chan(alias(c)); for (const x of keys) k.push(x); k.sort((a, b) => a[0] - b[0]); return R; },
      /** procedural driver: fn(t, v) → value; mode "add" | "set" | "max" */
      drive(c, fn, mode = "add") { drives.push({ c: alias(c), fn, mode }); chan(alias(c)); return R; },
      /** two-bone IK: chain [upper, lower, end]; target [x,y] or fn(t) in STAGE space (rig's parent); weight eases in over `in`, out over `out` */
      reach(chain, t0, t1, target, o = {}) { iks.push({ chain, t0, t1, target, in: o.in ?? 0.35, out: o.out ?? 0.35, bend: o.bend ?? -1, ease: o.ease || "power2.inOut", endRot: o.endRot, tip: o.tip || null }); return R; },
      /** after IK, before drawing: fn(v, t) may derive channels from solved joints (clothing response, morph weights) */
      post(fn) { posts.push(fn); return R; },
      /** prop follows a socket between t0 and t1; after release it keeps the release pose, or drops with gravity */
      attach(propId, socket, t0, t1 = 1e9, o = {}) { const el = S.el(propId); attaches.push({ home: el ? el.getAttribute("transform") : null, propId, socket, t0, t1, off: o.offset || [0, 0], rot: o.rot || 0, drop: o.drop, ground: o.ground, spin: o.spin || 0, upright: !!o.upright }); return R; },
      /** planted-foot walk along rig x from x0 to x1. legs: [[thigh,shin,foot], ...] first leg swings first. */
      walk(t0, t1, o) {
        const D = o.x1 - o.x0, n = Math.max(1, Math.round(Math.abs(D) / (o.stride || 120)));
        const w = Object.assign({ t0, t1, n, stride: D / n, stance: 0.6, lift: 22, bob: 6, armSwing: 14, toe: 18, bend: 1, ease: "sine.inOut" }, o);
        chan("root.x"); R.key("root.x", [[t0, o.x0], [t1, o.x1, w.ease]]);
        walks.push(w); return R;
      },
      val(c, t) { return S.ev(chan(alias(c)), t); },
      /** STAGE-space position of a socket at time t (for other scene code: aiming cameras, effects, contacts) */
      socket(name, t) { const r = evalAt(t); const s = meta.sockets[name]; const M = A.mul(A.mul(r.C, r.M[s.joint]), A.T(s.at[0], s.at[1])); return [M[4], M[5]]; },
      world(joint, t) { const r = evalAt(t); return A.mul(r.C, r.M[joint]); },
    };

    function container(t) {
      const id = P + "rig", b = baseOf(S, id);
      const g = (p, d) => S.get(id, p, d);
      // container tracks are evaluated by NU before fns, but for past/future times (springs, release) re-evaluate keys
      const m = local(b[0] + g("x", 0), b[1] + g("y", 0), g("r", 0), 0, g("s", 1) * g("sx", 1), g("s", 1) * g("sy", 1));
      const sc = meta.scale || 1; // static rig scale/flip lives on the inner <g id=P+"place"> written at build time
      return A.mul(m, A.S(sc * (meta.flip ? -1 : 1), sc));
    }
    function channelVals(t) {
      const v = {};
      for (const c in ch) v[c] = S.ev(ch[c], t);
      const g = (c) => (v[c] !== undefined ? v[c] : defOf(c));
      // macro controls add into target channels
      const out = Object.assign({}, v);
      const add = (c, x) => { out[c] = (out[c] !== undefined ? out[c] : defOf(c)) + x; };
      for (const d of drives) {
        const cur = out[d.c] !== undefined ? out[d.c] : defOf(d.c);
        const x = d.fn(t, cur);
        out[d.c] = d.mode === "set" ? x : d.mode === "max" ? Math.max(cur, x) : cur + x;
      }
      if (meta.controls) for (const c in meta.controls) { const x = out[c] !== undefined ? out[c] : g(c); if (!x) continue; for (const [tc, gain] of meta.controls[c]) add(tc, x * gain); }
      if (meta.idle) for (const [c, amp, f, ph] of meta.idle) add(c, Math.sin(t * f * 2 * Math.PI + (ph || 0)) * amp);
      if (meta.blink) {
        const B = meta.blink, ev = B.every || 3.4; let b = 0;
        const k0 = Math.floor(t / ev);
        for (let k = k0 - 1; k <= k0 + 1; k++) { const tk = k * ev + (hash(k * 7 + (B.seed || 1)) - 0.5) * ev * 0.6; const u = (t - tk) / (B.dur || 0.16); if (u > 0 && u < 1) b = Math.max(b, 1 - Math.abs(u * 2 - 1)); }
        for (const c of B.chans) out[c] = Math.max(out[c] !== undefined ? out[c] : defOf(c), b);
      }
      return out;
    }
    const gv = (v, c) => (v[c] !== undefined ? v[c] : defOf(c));
    function fk(v) {
      const M = {};
      for (const j of order) {
        const n = J[j], s = gv(v, j + ".s");
        const m = local(n.at[0] + gv(v, j + ".x"), n.at[1] + gv(v, j + ".y"), gv(v, j), gv(v, j + ".k"), s * gv(v, j + ".sx"), s * gv(v, j + ".sy"));
        M[j] = n.parent ? A.mul(M[n.parent], m) : m;
      }
      return M;
    }
    // springs: rotation of src from channels only (no IK), convolved with a damped impulse response
    function rotSum(j, t) { let s = 0; for (const a of anc[j]) s += S.ev(chan(a), t); return s; }
    function ik2(v, M, chain, tgtRig, w, bend, tip) {
      const [a, b, c] = chain, pa = J[a].parent;
      const Mp = pa ? M[pa] : A.I();
      const q = A.ap(A.inv(Mp), tgtRig);
      const p0 = [J[a].at[0] + gv(v, a + ".x"), J[a].at[1] + gv(v, a + ".y")];
      const lc = tip ? [J[c].at[0] + tip[0], J[c].at[1] + tip[1]] : J[c].at;
      const L1 = Math.hypot(J[b].at[0], J[b].at[1]), L2 = Math.hypot(lc[0], lc[1]);
      let dx = q[0] - p0[0], dy = q[1] - p0[1], d = Math.hypot(dx, dy);
      d = clamp(d, Math.abs(L1 - L2) + 0.5, L1 + L2 - 0.5);
      const phi = Math.atan2(dy, dx);
      const al = Math.acos(clamp((L1 * L1 + d * d - L2 * L2) / (2 * L1 * d), -1, 1));
      const th1 = phi - bend * al;
      const e = [p0[0] + Math.cos(th1) * L1, p0[1] + Math.sin(th1) * L1];
      const qq = [p0[0] + Math.cos(phi) * d, p0[1] + Math.sin(phi) * d];
      const th2 = Math.atan2(qq[1] - e[1], qq[0] - e[0]);
      const b1 = Math.atan2(J[b].at[1], J[b].at[0]), b2 = Math.atan2(lc[1], lc[0]);
      v[a] = lerpAng(gv(v, a), (th1 - b1) / D2R, w);
      v[b] = lerpAng(gv(v, b), (th2 - th1 + b1 - b2) / D2R, w); // lower bone in the upper bone's rotated frame (Q03)
    }
    function weight(k, t) {
      if (t < k.t0 || t > k.t1 + k.out) return 0;
      const ein = NU.clamp((t - k.t0) / (k.in || 1e-6)), eout = t > k.t1 ? 1 - NU.clamp((t - k.t1) / (k.out || 1e-6)) : 1;
      return S.ease(k.ease)(Math.min(ein, eout));
    }
    function evalAt(t) {
      if (cacheT.t === t) return cacheT.r;
      const v = channelVals(t);
      if (meta.follow) for (const f of meta.follow) {
        const dt = 1 / 30, K = 14; let acc = 0;
        for (let k = 0; k < K; k++) { const vel = rotSum(f.src, t - k * dt) - rotSum(f.src, t - (k + 1) * dt); acc += vel * Math.exp(-k * dt / (f.tau || 0.18)) * Math.cos(2 * Math.PI * (f.freq || 2.2) * k * dt); }
        v[f.joint] = gv(v, f.joint) + acc * (f.gain ?? -1);
      }
      const C = container(t), Ci = A.inv(C);
      // walk: phase from travelled distance; feet planted during stance
      const footTargets = [];
      for (const w of walks) {
        if (t < w.t0 - 0.001) continue;
        if (w.release !== undefined && t > w.release) continue;
        const X = S.ev(chan("root.x"), Math.min(t, w.t1)), phi = (X - w.x0) / w.stride;
        const s = w.stance;
        const M0 = fk(channelVals(w.t0));
        w.legs.forEach((leg, li) => {
          const o = li === 0 ? s : s - 0.5, c = phi + o, k = Math.floor(c), f = c - k;
          const restA = M0[leg[2]];
          const restX = restA[4], ground = w.ground ?? restA[5];
          const plant = (kk) => ((kk - o) <= 1e-6 ? restX : w.x0 + (kk - o + s / 2) * w.stride + (restX - M0.root[4]));
          let fx, fy, toe = 0;
          if (f < s) { fx = plant(k); fy = ground; }
          else { const u = (f - s) / (1 - s), e = S.ease("sine.inOut")(u); fx = lerp(plant(k), plant(k + 1), e); fy = ground - Math.sin(Math.PI * u) * w.lift; toe = Math.sin(Math.PI * u) * w.toe; }
          footTargets.push({ chain: leg, p: [fx, fy], toe, bend: w.bend });
        });
        const moving = t > w.t0 && t < w.t1 ? 1 : 0;
        const spd = moving ? Math.min(1, Math.abs(S.ev(chan("root.x"), t + 0.05) - S.ev(chan("root.x"), t - 0.05)) / 0.1 / 200) : 0;
        v["root.y"] = gv(v, "root.y") - Math.pow(Math.sin(Math.PI * 2 * phi), 2) * w.bob * spd;
        if (w.arms) w.arms.forEach(([j, sgn]) => { v[j] = gv(v, j) + Math.sin(2 * Math.PI * phi + (w.armPhase || 0)) * w.armSwing * sgn * spd; });
        if (w.lean) v[w.lean[0]] = gv(v, w.lean[0]) + w.lean[1] * spd;
      }
      let M = fk(v);
      for (const ft of footTargets) { ik2(v, M, ft.chain, ft.p, 1, ft.bend); }
      if (footTargets.length) M = fk(v);
      for (const k of iks) {
        const w = weight(k, t); if (w <= 0) continue;
        const tg = typeof k.target === "function" ? k.target(t) : k.target;
        ik2(v, M, k.chain, A.ap(Ci, tg), w, k.bend, k.tip); M = fk(v);
        if (k.endRot !== undefined) { const end = k.chain[2], par = J[end].parent; v[end] = lerpAng(gv(v, end), k.endRot - A.rot(A.mul(C, M[par])), w); M = fk(v); }
      }
      for (const ft of footTargets) { const fj = ft.chain[2], par = J[fj].parent; v[fj] = -A.rot(M[par]) + ft.toe; }
      if (footTargets.length) M = fk(v);
      if (posts.length) { for (const fn of posts) fn(v, t, M); M = fk(v); }
      const r = { v, M, C };
      cacheT.t = t; cacheT.r = r;
      return r;
    }

    S.at((t) => {
      const { v, M, C } = evalAt(t);
      for (const j of order) {
        if (j === "__") continue;
        const id = P + j;
        S.set(id, "r", gv(v, j));
        const x = gv(v, j + ".x"), y = gv(v, j + ".y");
        if (x) S.set(id, "x", x); else S.set(id, "x", 0);
        if (y) S.set(id, "y", y); else S.set(id, "y", 0);
        const s = gv(v, j + ".s"), sx = gv(v, j + ".sx"), sy = gv(v, j + ".sy"), k = gv(v, j + ".k");
        S.set(id, "s", s); S.set(id, "sx", sx); S.set(id, "sy", sy); if (k) S.set(id, "skx", k);
      }
      // blendshapes
      if (meta.morphs) for (const name in meta.morphs) {
        const m = meta.morphs[name], nums = m.base.slice();
        for (const tg in m.d) { const w = gv(v, name + ":" + tg); if (!w) continue; const dd = m.d[tg]; for (let i = 0; i < nums.length; i++) nums[i] += dd[i] * w; }
        let i = 0; S.set(m.el, "a:d", m.tpl.replace(/%/g, () => nums[i++].toFixed(2)));
      }
      // swap-state groups (registered alternate drawings): opacity 1 for active state
      if (meta.swaps) for (const name in meta.swaps) { const st = meta.swaps[name], cur = Math.round(gv(v, name)); st.forEach((id, i) => S.set(id, "o", i === cur ? 1 : 0)); }
      const CR = A.rot(C);
      const LP = (j) => { const m = A.mul(C, M[j]); return lightAt(S, t, [m[4], m[5]]); };
      // limb contours from joint positions, in the parent-of-chain space
      if (meta.limbs) for (const lb of meta.limbs) {
        const [a, b, c] = lb.chain;
        const p0 = [J[a].at[0] + gv(v, a + ".x"), J[a].at[1] + gv(v, a + ".y")];
        const Ma = local(p0[0], p0[1], gv(v, a), 0, 1, 1);
        const p1 = A.ap(Ma, J[b].at), Mb = A.mul(Ma, local(J[b].at[0], J[b].at[1], gv(v, b), 0, 1, 1)), p2 = A.ap(Mb, J[c].at);
        S.set(lb.geo, "a:d", limbPath(p0, p1, p2, lb.w, lb.ext || 0));
        if (lb.shade) {
          const par = J[a].parent, wr = par ? A.rot(M[par]) + CR : CR, ang = (LP(b) - wr) * D2R;
          S.set(lb.lit, "x", Math.cos(ang) * lb.shade); S.set(lb.lit, "y", Math.sin(ang) * lb.shade);
        }
      }
      // surface-attached planes on rigid parts
      if (meta.surfs) for (const sf of meta.surfs) {
        const wr = A.rot(M[sf.joint]) + CR, ang = (LP(sf.joint) - wr) * D2R;
        S.set(sf.id + "-L", "x", Math.cos(ang) * sf.k); S.set(sf.id + "-L", "y", Math.sin(ang) * sf.k);
        if (sf.hk) { S.set(sf.id + "-H", "x", Math.cos(ang) * sf.hk); S.set(sf.id + "-H", "y", Math.sin(ang) * sf.hk); }
      }
      // props attached to sockets (STAGE space = rig container's parent)
      for (const at of attaches) {
        if (t < at.t0) { if (at.home) S.set(at.propId, "a:transform", at.home); continue; } // idempotent under any seek order
        const so = meta.sockets[at.socket];
        const tt = Math.min(t, at.t1), r = tt === t ? { M, C } : evalAt(tt);
        let Mw = A.mul(A.mul(A.mul(A.mul(r.C, r.M[so.joint]), local(so.at[0], so.at[1], so.r || 0, 0, 1, 1)), A.T(at.off[0], at.off[1])), A.R(at.rot));
        if (at.upright) Mw = A.mul(A.T(Mw[4], Mw[5]), A.R(at.rot)); // hangs/stands in world orientation (pendulum objects, carried lights)
        if (t > at.t1 && at.drop) {
          const dt = t - at.t1, y0 = Mw[5], gy = at.ground ?? 1e9, fall = Math.min(0.5 * 2600 * dt * dt, Math.max(0, gy - y0));
          Mw = A.mul(A.T(0, fall), Mw); if (at.spin) Mw = A.mul(Mw, A.R(at.spin * Math.min(dt, Math.sqrt(2 * Math.max(0, gy - y0) / 2600))));
        }
        S.set(at.propId, "a:transform", A.str(Mw));
        if (t >= at.t1) evalAt(t); // restore cache for this frame
      }
    });
    return R;
  }

  /** closed tapered limb outline through 3 joint points; constant topology (13 cubic segments) */
  function limbPath(p0, p1, p2, w, ext) {
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], nrm = (a) => { const l = Math.hypot(a[0], a[1]) || 1; return [a[0] / l, a[1] / l]; };
    const d0 = nrm(sub(p1, p0)), d1 = nrm(sub(p2, p1));
    const n0 = [-d0[1], d0[0]], n2 = [-d1[1], d1[0]];
    let n1 = nrm([n0[0] + n2[0], n0[1] + n2[1]]);
    const cosH = Math.max(0.35, n1[0] * n0[0] + n1[1] * n0[1]);
    const w0 = w[0], w1 = w[1], w2 = w[2];
    const m01 = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2], m12 = [(p1[0] + p2[0]) / 2, (p1[1] + p2[1]) / 2];
    const wm01 = (w0 + w1) / 2, wm12 = (w1 + w2) / 2;
    const cross = d0[0] * d1[1] - d0[1] * d1[0]; // >0: bends toward +n side (inner side is +n)
    const outerW = w1 / cosH, innerW = w1 * Math.min(1, cosH * 1.1);
    const wp = cross > 0 ? innerW : outerW, wn = cross > 0 ? outerW : innerW;
    const tip = [p2[0] + d1[0] * (w2 + ext), p2[1] + d1[1] * (w2 + ext)], back = [p0[0] - d0[0] * w0, p0[1] - d0[1] * w0];
    const P = [
      [p0[0] + n0[0] * w0, p0[1] + n0[1] * w0], [m01[0] + n0[0] * wm01, m01[1] + n0[1] * wm01], [p1[0] + n1[0] * wp, p1[1] + n1[1] * wp],
      [m12[0] + n2[0] * wm12, m12[1] + n2[1] * wm12], [p2[0] + n2[0] * w2, p2[1] + n2[1] * w2],
      [p2[0] + (n2[0] * 0.7 + d1[0] * 0.7) * w2, p2[1] + (n2[1] * 0.7 + d1[1] * 0.7) * w2], tip, [p2[0] + (-n2[0] * 0.7 + d1[0] * 0.7) * w2, p2[1] + (-n2[1] * 0.7 + d1[1] * 0.7) * w2],
      [p2[0] - n2[0] * w2, p2[1] - n2[1] * w2], [m12[0] - n2[0] * wm12, m12[1] - n2[1] * wm12], [p1[0] - n1[0] * wn, p1[1] - n1[1] * wn],
      [m01[0] - n0[0] * wm01, m01[1] - n0[1] * wm01], [p0[0] - n0[0] * w0, p0[1] - n0[1] * w0], back,
    ];
    const n = P.length, k = 1 / 6;
    let d = `M${P[0][0].toFixed(1)},${P[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const a = P[(i - 1 + n) % n], b = P[i], c = P[(i + 1) % n], e = P[(i + 2) % n];
      d += ` C${(b[0] + (c[0] - a[0]) * k).toFixed(1)},${(b[1] + (c[1] - a[1]) * k).toFixed(1)} ${(c[0] - (e[0] - b[0]) * k).toFixed(1)},${(c[1] - (e[1] - b[1]) * k).toFixed(1)} ${c[0].toFixed(1)},${c[1].toFixed(1)}`;
    }
    return d + "Z";
  }

  /** Camera = NU camera formula + optional follow target fn(t)->[x,y] blended by keys, + deterministic shake keys. */
  function camera(S, cam, layers) {
    const lastC = {};
    S.at((t) => {
      let cx = S.ev(cam.x, t), cy = S.ev(cam.y, t);
      const z = S.ev(cam.z, t), r = cam.r ? S.ev(cam.r, t) : 0;
      if (cam.follow) { const w = cam.followW ? S.ev(cam.followW, t) : 1; const p = cam.follow(t); cx = lerp(cx, p[0] - 960, w); cy = lerp(cy, p[1] - 540, w); }
      if (cam.shake) { const a = S.ev(cam.shake, t); cx += wig(t, 23, 3) * a; cy += wig(t, 19, 7) * a; }
      const px = cam.wx ?? 960, py = cam.wy ?? 540;
      for (const [i, d] of layers) {
        const e = S.el(i); if (!e) continue;
        const sc = Math.pow(z, d);
        const str = `translate(960 540) rotate(${(r * d).toFixed(3)}) scale(${sc.toFixed(5)}) translate(${(-px - cx * d).toFixed(2)} ${(-py - cy * d).toFixed(2)})`;
        if (lastC[i] !== str) { e.setAttribute("transform", str); lastC[i] = str; }
      }
    });
    return S;
  }

  /** wind/idle sway for environmental parts: ids rotate about their data-b pivot */
  function sway(S, ids, amp = 3, freq = 0.6, seed = 0) {
    S.at((t) => ids.forEach((id, i) => S.add(id, "r", wig(t, freq * 6.28, seed + i * 1.7) * amp)));
    return S;
  }

  window.MN = { A, rig, camera, sway, setLight, lightAt, surfaces, limbPath };
})();
