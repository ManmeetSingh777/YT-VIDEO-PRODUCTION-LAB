/* NU runtime: every visible value is a pure function of timeline time.
   One GSAP tween drives render(t); tracks, rigs, cameras and streak fields read t only. */
(function () {
  const lerp = (a, b, p) => a + (b - a) * p;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeCache = {};
  function ease(name) {
    if (typeof name === "function") return name;
    if (!name) name = "sine.inOut";
    if (!easeCache[name]) easeCache[name] = name === "none" ? (p) => p : gsap.parseEase(name);
    return easeCache[name];
  }
  function hex(c) {
    c = c.replace("#", "");
    if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
    return [parseInt(c.slice(0, 2), 16), parseInt(c.slice(2, 4), 16), parseInt(c.slice(4, 6), 16)];
  }
  function mixHex(a, b, p) {
    const A = hex(a), B = hex(b);
    return `rgb(${Math.round(lerp(A[0], B[0], p))},${Math.round(lerp(A[1], B[1], p))},${Math.round(lerp(A[2], B[2], p))})`;
  }
  const NUM = /-?\d*\.?\d+(?:e-?\d+)?/gi;
  function mixPath(a, b, p) {
    const nb = b.match(NUM);
    let i = 0;
    return a.replace(NUM, (m) => {
      const v = lerp(parseFloat(m), parseFloat(nb[i++] ?? m), p);
      return v.toFixed(2);
    });
  }
  // smooth deterministic noise, -1..1
  function wig(t, f = 1, seed = 0) {
    const x = t * f + seed * 17.13;
    return (Math.sin(x * 1.0) * 0.5 + Math.sin(x * 2.17 + 1.3) * 0.3 + Math.sin(x * 3.73 + 2.1) * 0.2);
  }
  function hash(i) {
    const s = Math.sin(i * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
  }

  const TF = { x: 1, y: 1, r: 1, s: 1, sx: 1, sy: 1, skx: 1 };

  function scene(id, dur) {
    const tracks = []; // {id, prop, keys}
    const fns = [];
    const elCache = {};
    const state = {};
    const base = {};
    const lastAttr = {};
    const el = (i) => {
      if (elCache[i] === undefined) elCache[i] = document.getElementById(i);
      return elCache[i];
    };
    function getBase(i) {
      if (!base[i]) {
        const e = el(i);
        const b = e && e.getAttribute("data-b");
        base[i] = b ? b.split(",").map(Number) : [0, 0];
      }
      return base[i];
    }
    const S = {
      id, dur, lerp, clamp, wig, hash, ease, mixHex,
      /** S.k("id", {x:[[t,v,ease?],...], r:[...], o:[...], d:[...], fill:[...], "a:cx":[...]}) */
      k(i, props) {
        for (const p in props) tracks.push({ id: i, prop: p, keys: props[p] });
        return S;
      },
      at(fn) { fns.push(fn); return S; },
      /** evaluate key array at t */
      ev(keys, t) {
        if (t <= keys[0][0]) return keys[0][1];
        for (let n = 1; n < keys.length; n++) {
          const [t1, v1, e] = keys[n];
          if (t < t1) {
            const [t0, v0] = keys[n - 1];
            if (e === "hold") return v0;
            const p = ease(e)((t - t0) / (t1 - t0));
            if (typeof v0 === "number") return lerp(v0, v1, p);
            if (v0[0] === "#") return mixHex(v0, v1, p);
            return mixPath(v0, v1, p);
          }
        }
        return keys[keys.length - 1][1];
      },
      set(i, p, v) { (state[i] = state[i] || {})[p] = v; },
      add(i, p, v) { const s = (state[i] = state[i] || {}); s[p] = (s[p] ?? (p === "s" || p === "sx" || p === "sy" ? 1 : 0)) + v; },
      get(i, p, d = 0) { return state[i] && state[i][p] !== undefined ? state[i][p] : d; },
      el,
      render(t) {
        for (const k in state) state[k] = {};
        for (const tr of tracks) (state[tr.id] = state[tr.id] || {})[tr.prop] = S.ev(tr.keys, t);
        for (const fn of fns) fn(t);
        for (const i in state) {
          const st = state[i];
          const e = el(i);
          if (!e) continue;
          let tf = false;
          for (const p in st) if (TF[p]) { tf = true; break; }
          if (tf) {
            const b = getBase(i);
            const X = b[0] + (st.x || 0), Y = b[1] + (st.y || 0);
            const sc = st.s ?? 1, SX = sc * (st.sx ?? 1), SY = sc * (st.sy ?? 1);
            let str = `translate(${X.toFixed(2)} ${Y.toFixed(2)})`;
            if (st.r) str += ` rotate(${st.r.toFixed(3)})`;
            if (st.skx) str += ` skewX(${st.skx.toFixed(3)})`;
            if (SX !== 1 || SY !== 1) str += ` scale(${SX.toFixed(4)} ${SY.toFixed(4)})`;
            if (lastAttr[i + "t"] !== str) { e.setAttribute("transform", str); lastAttr[i + "t"] = str; }
          }
          for (const p in st) {
            if (TF[p]) continue;
            let name = p, val = st[p];
            if (p === "o") { name = "opacity"; val = clamp(val).toFixed(3); }
            else if (p === "vis") { const d = val ? "inline" : "none"; if (lastAttr[i + "v"] !== d) { e.style.display = d; lastAttr[i + "v"] = d; } continue; }
            else if (p === "text") { if (lastAttr[i + "x"] !== val) { e.textContent = val; lastAttr[i + "x"] = val; } continue; }
            else if (p.startsWith("a:")) { name = p.slice(2); if (typeof val === "number") val = val.toFixed(3); }
            const key = i + "|" + name;
            if (lastAttr[key] !== val) { e.setAttribute(name, val); lastAttr[key] = val; }
          }
        }
      },
      /** visibility window helper: element only in the DOM paint between t0 and t1 */
      show(i, t0, t1) { S.at((t) => S.set(i, "vis", t >= t0 && t < t1)); return S; },
      /** camera: layers with parallax depth d. keys on cam: x,y,z,r */
      camera(cam, layers) {
        S.at((t) => {
          const cx = S.ev(cam.x, t), cy = S.ev(cam.y, t), z = S.ev(cam.z, t), r = cam.r ? S.ev(cam.r, t) : 0;
          const px = cam.wx ?? 960, py = cam.wy ?? 540;
          for (const [i, d] of layers) {
            const e = el(i);
            if (!e) continue;
            const sc = Math.pow(z, d);
            const str = `translate(960 540) rotate(${(r * d).toFixed(3)}) scale(${sc.toFixed(5)}) translate(${(-px - cx * d).toFixed(2)} ${(-py - cy * d).toFixed(2)})`;
            if (lastAttr[i + "c"] !== str) { e.setAttribute("transform", str); lastAttr[i + "c"] = str; }
          }
        });
        return S;
      },
      /** streak field built by lib.streakField(): positions are pure functions of t */
      streaks(fieldId, o) {
        const n = o.n;
        const ang = (o.angle ?? 120) * Math.PI / 180, dx = Math.cos(ang), dy = Math.sin(ang);
        const [ax, ay, aw, ah] = o.area ?? [-200, -200, 2320, 1480];
        const span = o.span ?? Math.hypot(aw, ah) + 400;
        const seed = o.seed ?? 1;
        const items = [];
        for (let i = 0; i < n; i++) items.push(document.getElementById(`${fieldId}-${i}`));
        const px = -dy, py = dx;
        const cx = ax + aw / 2, cy = ay + ah / 2;
        const across = Math.abs(aw * px) + Math.abs(ah * py);
        S.at((t) => {
          const den = o.density ? o.density(t) : 1;
          const op = o.opacity ? o.opacity(t) : 1;
          const speedMul = o.speedMul ? o.speedMul(t) : 1;
          const T = o.clock ? o.clock(t) : t;
          for (let i = 0; i < n; i++) {
            const it = items[i];
            if (!it) continue;
            const h1 = hash(i + seed), h2 = hash(i * 3 + seed + 9), h3 = hash(i * 7 + seed + 21);
            const on = (i + 0.5) / n <= den;
            if (!on) { if (it.__on !== 0) { it.setAttribute("opacity", 0); it.__on = 0; } continue; }
            const depth = 0.45 + h3 * 0.75;
            const sp = (o.speed ?? 900) * (0.75 + h2 * 0.5) * speedMul;
            const d = ((T * sp + h1 * span * 7) % span) - span / 2;
            const off = (h2 - 0.5) * across;
            let X = cx + dx * d + px * off, Y = cy + dy * d + py * off, rot = o.angle ?? 120;
            if (o.radial) {
              const a2 = (o.arc ? o.arc[0] + h2 * (o.arc[1] - o.arc[0]) : h2 * 360);
              const rad = a2 * Math.PI / 180;
              const dd = ((T * sp + h1 * span * 7) % span);
              X = o.radial[0] + Math.cos(rad) * dd; Y = o.radial[1] + Math.sin(rad) * dd; rot = a2;
            }
            const sc = (o.scale ?? 1) * depth;
            const a = (o.alpha ?? 1) * Math.min(1, 0.35 + depth * 0.7) * op;
            it.setAttribute("transform", `translate(${X.toFixed(1)} ${Y.toFixed(1)}) rotate(${rot.toFixed(1)}) scale(${sc.toFixed(3)})`);
            it.setAttribute("opacity", a.toFixed(3));
            it.__on = 1;
          }
        });
        return S;
      },
      /** Character rig driver. Prefix matches lib character(). */
      actor(p, init = {}) {
        const J = {};
        const lagOf = { head: 0, faceX: 0, torso: 0.04, hips: 0.05, armR: 0.07, foreR: 0.11, armL: 0.07, foreL: 0.11, handL: 0.14, handR: 0.14, legL: 0.03, legR: 0.03, shinL: 0.05, shinR: 0.05 };
        const defaults = Object.assign({ head: 0, faceX: 0, faceY: 0, torso: 0, hips: 0, armL: 12, foreL: -12, armR: -12, foreR: 12, handL: 0, handR: 0, legL: 4, legR: -4, shinL: 0, shinR: 0, spread: 0, brow: 0, browTilt: 0, lookX: 0, lookY: 0, X: 0, Y: 0, squash: 0, lid: 1 }, init);
        for (const j in defaults) J[j] = [[0, defaults[j]]];
        const mouths = [[0, init.mouth || "m"]];
        const A = {
          /** move to pose over dur, with successive-breaking lag: head leads, hands trail. */
          pose(t, d, dur = 0.4, e = "power2.inOut") {
            for (const j in d) {
              if (j === "mouth") { mouths.push([t, d[j]]); continue; }
              const keys = J[j];
              const lag = lagOf[j] ?? 0.02;
              const last = keys[keys.length - 1];
              if (t + lag > last[0]) keys.push([t + lag, last[1]]);
              keys.push([t + lag + dur, d[j], e]);
            }
            return A;
          },
          /** quick anticipate then pop */
          val(j, t) { return S.ev(J[j], t); },
          J,
        };
        S.at((t) => {
          const v = (j) => S.ev(J[j], t);
          const breath = Math.sin(t * 2.1 + 0.7);
          S.set(p + "root", "x", v("X"));
          const sq = v("squash");
          S.set(p + "root", "y", v("Y") + sq * 26);
          S.set(p + "torso", "r", v("torso") + breath * 0.35);
          S.set(p + "torso", "sy", 1 + breath * 0.006 - sq * 0.10);
          S.set(p + "torso", "sx", 1 + sq * 0.07);
          S.set(p + "hips", "r", v("hips"));
          S.set(p + "neck", "r", v("head") * 0.35);
          const h = v("head");
          S.set(p + "head", "r", h * 0.65 + Math.sin(t * 1.3) * 0.5);
          const fx = v("faceX"), fy = v("faceY");
          S.set(p + "face", "x", fx);
          S.set(p + "face", "y", fy);
          S.set(p + "hairb", "x", -fx * 0.45);
          // curl: spring follow-through driven by head velocity
          const dh = S.ev(J.head, t) - S.ev(J.head, t - 0.09);
          const dsq = S.ev(J.squash, t) - S.ev(J.squash, t - 0.09);
          S.set(p + "curl", "r", -dh * 1.5 + dsq * 40 + Math.sin(t * 2.4) * 2.2);
          S.set(p + "curl", "x", fx * 0.3);
          for (const side of ["L", "R"]) {
            const a = "arm" + side, f = "fore" + side, hd = "hand" + side, l = "leg" + side, sh = "shin" + side;
            S.set(p + a, "r", v(a));
            S.set(p + f, "r", v(f));
            S.set(p + hd, "r", v(hd));
            S.set(p + l, "r", v(l));
            S.set(p + sh, "r", v(sh));
            const sp = v("spread");
            S.set(p + hd + "1", "r", -22 - sp * 22);
            S.set(p + hd + "2", "r", -sp * 4);
            S.set(p + hd + "3", "r", 22 + sp * 22);
          }
          // pupils + brows
          const lx = v("lookX"), ly = v("lookY");
          S.set(p + "pupL", "x", lx * 5); S.set(p + "pupL", "y", ly * 5);
          S.set(p + "pupR", "x", lx * 5); S.set(p + "pupR", "y", ly * 5);
          const b = v("brow"), bt = v("browTilt");
          S.set(p + "browL", "y", b * -9); S.set(p + "browR", "y", b * -9);
          S.set(p + "browL", "r", -bt * 14); S.set(p + "browR", "r", bt * 14);
          // blink: deterministic, every ~3.1 s plus scripted lid
          const ph = (t + 0.4) % 3.13;
          const bl = ph < 0.13 ? Math.abs(ph / 0.065 - 1) : 1;
          const lid = Math.min(bl, v("lid"));
          S.set(p + "eyeL", "sy", Math.max(0.08, lid));
          S.set(p + "eyeR", "sy", Math.max(0.08, lid));
          // mouths
          let m = mouths[0][1];
          for (const [mt, mv] of mouths) if (t >= mt) m = mv;
          for (const n of ["m", "o", "smile", "frown", "grin", "flat"]) S.set(p + "mouth-" + n, "o", m === n ? 1 : 0);
          // umbrella stays near vertical in world terms
          const world = v("armR") + v("foreR") + v("handR") + v("torso");
          S.set(p + "umb", "r", -world + (A.umbTilt ? S.ev(A.umbTilt, t) : 8));
          if (A.umbOpen) { S.set(p + "canopyG", "sx", S.ev(A.umbOpen, t)); }
        });
        return A;
      },
      done() {
        const tl = gsap.timeline({ paused: true });
        const drv = { _t: 0, t(v) { if (v === undefined) return this._t; this._t = v; S.render(v); return this; } };
        tl.to(drv, { t: dur, duration: dur, ease: "none" }, 0);
        window.__timelines = window.__timelines || {};
        window.__timelines[id] = tl;
        S.render(0);
      },
    };
    return S;
  }
  window.NU = { scene, wig, hash, lerp, clamp };
})();
