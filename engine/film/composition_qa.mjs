// P08 A01/A03 composition QA — every composed primitive's OWNER EFFECT, measured on every frame of its interval from the same stateAtFrame the
// renderer draws. Expectations are recomputed here from the primitive's own declared inputs (never read back from the compiler's output), so a
// deleted/disabled producer, a suppressed effect or a camera move standing in for actor motion fails. A primitive checked on zero frames fails.
import { stateAtFrame } from "../art_bridge/temporal.mjs";
import { ev } from "../art_bridge/temporal.mjs";
import { apply, angleOf, wrap180, inv, mul } from "../art_bridge/math2d.mjs";
import { err } from "../art_bridge/errors.mjs";
import { writeSet } from "../art_bridge/composition.mjs";
const deg = (r) => (r * 180) / Math.PI;
/** independent re-implementation of a windowed additive oscillation (the declared amplitude, period, phase and ramp) */
const oscAt = (r, f) => { const [a, b] = r.frames; if (f < a || f >= b) return 0; const ramp = Math.max(1, Math.min(r.period / 4, (b - a) / 4)), env = Math.min(1, (f - a) / ramp, (b - f) / ramp); return env * r.amp * Math.sin((2 * Math.PI * (f + r.phase)) / r.period); };
export function verifyComposition(C, { st = null, tolerance_deg = 0.5, aim_tolerance_deg = 3 } = {}) {
  const rep = C.composition; if (!rep) return { ok: false, results: [], failures: [err("COMPOSITION_EFFECT_UNMET", { record_id: "(film)", reason: "no composition compiled" })], write_set: null };
  const cache = new Map(), S = st || ((f) => { if (!cache.has(f)) { try { cache.set(f, stateAtFrame(C, f)); } catch (e) { cache.set(f, { error: e }); } } return cache.get(f); });
  const results = [], failures = [], J = (rid, j) => C.rigs.get(rid).joints.get(j);
  const localAng = (s, rid, j) => { const p = J(rid, j).parent_id; return wrap180(angleOf(s.matrices[rid][j]) - (p ? angleOf(s.matrices[rid][p]) : 0)); };
  const pivot = (s, rid, j) => apply(s.matrices[rid][j], J(rid, j).rest_xy);
  const ws = writeSet(C);
  for (const r of rep.primitives) {
    const res = { primitive: r.id, kind: r.kind, owner: r.owner, frames: r.frames, ok: false, frames_checked: 0, reason: null, measurement: {} }, bad = []; let n = 0;
    const ownerFail = (s) => (s.failures || []).filter((x) => { const id = String(x.record_id ?? ""); return id === rid || id.startsWith(`${rid}.`) || (r.action && id === r.action); });
    const each = (fn, frames = null) => { for (let f = (frames || r.frames)[0]; f < (frames || r.frames)[1]; f++) { const s = S(f); if (s.error) { bad.push(`frame ${f}: ${s.error.message}`); continue; } n++; const why = fn(s, f); if (why) bad.push(`frame ${f}: ${why}`); const of = r.kind !== "CAMERA_MOVE" ? ownerFail(s) : []; if (of.length) bad.push(`frame ${f}: ${of[0].code} ${of[0].record_id} ${String(of[0].human_readable_reason ?? "").slice(0, 90)}`); } };
    const [rid, sub] = String(r.owner).split(".");
    switch (r.kind) {
      case "JOINT_ROTATE": { const osc = rep.primitives.filter((x) => x.kind === "OSCILLATE" && x.owner === r.owner); let mx = 0;
        each((s, f) => { const want = ev(r.abs_keys, f) + osc.reduce((t, o) => t + oscAt(o, f), 0), got = localAng(s, rid, sub), e = Math.abs(wrap180(got - want)); mx = Math.max(mx, e); return e > tolerance_deg ? `${r.owner} at ${got.toFixed(2)}°, directed ${want.toFixed(2)}°` : null; });
        const span = Math.abs(ev(r.abs_keys, r.frames[1] - 1) - ev(r.abs_keys, r.frames[0])) || Math.max(...r.abs_keys.map((k) => Math.abs(k[1]))); res.measurement = { max_error_deg: +mx.toFixed(3), directed_span_deg: +span.toFixed(2) }; break; }
      case "ROOT_MOVE": { const pl = C.plan.placements?.[rid] || { x: 0, y: 0, rot: 0 }, R0 = C.rigs.get(rid).root, base = (k, d) => (C.plan.tracks?.[rid]?.root?.[k] ? null : d); void base; let mx = 0;
        each((s, f) => { const tr = C.plan.tracks?.[rid]?.root || {}, want = [pl.x + (r.abs.x ? ev(r.abs.x, f) : tr.x ? ev(tr.x, f) : 0), pl.y + (r.abs.y ? ev(r.abs.y, f) : tr.y ? ev(tr.y, f) : 0)], got = apply(s.matrices[rid][R0.id], R0.rest_xy), e = Math.hypot(got[0] - want[0], got[1] - want[1]); mx = Math.max(mx, e); if (e > 0.5) return `root at ${got.map((v) => v.toFixed(1))}, directed ${want.map((v) => v.toFixed(1))}`;
          if (r.abs.rot || tr.rot) { const jt = C.plan.tracks?.[rid]?.joints?.[R0.id], wantR = (pl.rot || 0) + (r.abs.rot ? ev(r.abs.rot, f) : ev(tr.rot, f)) + (jt ? ev(jt, f) : 0), gotR = angleOf(s.matrices[rid][R0.id]), eR = Math.abs(wrap180(gotR - wantR)); if (eR > 0.25) return `root rotation ${gotR.toFixed(2)}°, directed ${wantR.toFixed(2)}°`; } return null; });
        const a = r.abs.x || r.abs.y; res.measurement = { max_error_px: +mx.toFixed(3), travel_px: a ? +Math.hypot(r.abs.x ? ev(r.abs.x, r.frames[1] - 1) - ev(r.abs.x, r.frames[0]) : 0, r.abs.y ? ev(r.abs.y, r.frames[1] - 1) - ev(r.abs.y, r.frames[0]) : 0).toFixed(2) : 0 }; break; }
      case "OSCILLATE": { const prim = C.plan.tracks?.[rid]?.joints?.[sub]; let lo = Infinity, hi = -Infinity, mx = 0;
        each((s, f) => { const base = prim ? ev(prim, f) : 0, others = rep.primitives.filter((x) => x.kind === "OSCILLATE" && x.owner === r.owner && x.id !== r.id).reduce((t, o) => t + oscAt(o, f), 0), resid = wrap180(localAng(s, rid, sub) - base - others), want = oscAt(r, f), e = Math.abs(resid - want); lo = Math.min(lo, resid); hi = Math.max(hi, resid); mx = Math.max(mx, e); return e > tolerance_deg ? `oscillation residual ${resid.toFixed(2)}° ≠ directed ${want.toFixed(2)}°` : null; });
        res.measurement = { peak_to_peak_deg: +(hi - lo).toFixed(2), directed_peak_to_peak_deg: 2 * r.amp, max_error_deg: +mx.toFixed(3) }; if (hi - lo < 1.5 * r.amp) bad.push(`visible oscillation ${(hi - lo).toFixed(2)}° < 1.5 × amplitude ${r.amp}°`); break; }
      case "AIM": { const t = r.inputs.target, fwd = r.inputs.forward_deg ?? 0; let mx = 0;
        each((s, f) => { const tgt = t.world_xy ?? (s.matrices[t.rig] ? C.socketWorld(t.rig, s.matrices[t.rig], t.socket) : null); if (!tgt) return "target not placed"; const p = pivot(s, rid, sub), e = Math.abs(wrap180(deg(Math.atan2(tgt[1] - p[1], tgt[0] - p[0])) - (angleOf(s.matrices[rid][sub]) + fwd))); mx = Math.max(mx, e); return e > aim_tolerance_deg ? `aim error ${e.toFixed(2)}° (a turn beyond the approved ${r.inputs.max_deg ?? "joint"}° needs a view cel)` : null; }, r.hold);
        res.measurement = { max_aim_error_deg: +mx.toFixed(2), hold: r.hold }; break; }
      case "STATE_SWAP": { const evs = r.events; for (let i = 0; i < evs.length; i++) { const [f0, stt] = evs[i], f1 = evs[i + 1]?.[0] ?? r.frames[1];
          each((s) => { const got = s.artStates?.[rid]?.channels?.[sub]; if (got !== stt) return `${r.owner} shows ${got}, directed ${stt}`; const ch = (C.rigs.get(rid).rec.state_channels || []).find((c) => c.id === sub), want = ch.states.find((x) => x.id === stt); for (const slot of ch.slots) { const q = s.passes.find((x) => x.rig === rid && x.slot === slot); if (!q?.visible || q.asset_id !== (want.asset_bindings?.[slot] ?? slot)) return `${stt} drawing is not the bound visible pass`; } return null; }, [f0, f1]); } break; }
      case "PLANT": case "REACH": { let mx = 0; const tgtOf = (s) => r.contact.target_world_xy ?? (r.contact.target_socket ? (() => { const tr = [...C.rigs.values()].find((R_) => R_.socketById.has(r.contact.target_socket)); return tr && s.matrices[tr.rec.id] ? C.socketWorld(tr.rec.id, s.matrices[tr.rec.id], r.contact.target_socket) : null; })() : null);
        each((s) => { const got = C.socketWorld(rid, s.matrices[rid], sub), t = tgtOf(s); if (!t) return "target not placed"; const e = Math.hypot(got[0] - t[0], got[1] - t[1]); mx = Math.max(mx, e); return e > r.contact.allowed_error_px ? `${r.owner} ${e.toFixed(2)}px from its ${r.kind === "PLANT" ? "plant" : "target"} (allowed ${r.contact.allowed_error_px})` : null; });
        res.measurement = { max_error_px: +mx.toFixed(3) }; break; }
      case "WALK": { let maxDrift = 0, pen = 0, minClear = Infinity, prevX = null; const R0 = C.rigs.get(rid).root, sockOf = (ft) => r.feet[ft].socket, segAt = (ft, f) => r.feet[ft].segments.find((g) => g.frames[0] <= f && f < g.frames[1]);
        // DYNAMIC support for intentional locomotion (not a static balance test): the pelvis travels inside the envelope of the planted feet and the
        // swing foot's push-off and landing anchors (the body falls toward its next footstep), never outside it
        each((s, f) => { const why = [], P = apply(s.matrices[rid][R0.id], R0.rest_xy), planted = [], support = [];
          for (const ft of ["l", "r"]) { const g = segAt(ft, f); if (!g) continue; const w = C.socketWorld(rid, s.matrices[rid], sockOf(ft));
            if (w[1] > r.ground_y + 0.5) { pen = Math.max(pen, w[1] - r.ground_y); why.push(`${ft} sole ${(w[1] - r.ground_y).toFixed(2)}px below the ground`); }
            if (g.kind === "PLANT") { const d = Math.hypot(w[0] - g.at[0], w[1] - g.at[1]); maxDrift = Math.max(maxDrift, d); if (d > 1.5) why.push(`${ft} stance foot slides ${d.toFixed(2)}px`); planted.push(w); } else { support.push(g.from, g.to); const mid = Math.round((g.frames[0] + g.frames[1]) / 2); if (f === mid) minClear = Math.min(minClear, r.ground_y - w[1]); } }
          if (!planted.length && !r.running) why.push("no foot on the ground (flight is not directed)");
          if (planted.length) { const env = [...planted, ...support], lo = Math.min(...env.map((q) => q[0])) - r.support_margin_px, hi = Math.max(...env.map((q) => q[0])) + r.support_margin_px; if (P[0] < lo || P[0] > hi) why.push(`pelvis x ${P[0].toFixed(1)} outside the support [${lo.toFixed(1)}, ${hi.toFixed(1)}]`); }
          if (prevX !== null && (P[0] - prevX) * r.dir < -1e-6) why.push("the pelvis moves backwards along the directed path"); prevX = P[0];
          return why.length ? why.join("; ") : null; });
        res.measurement = { steps: r.steps.length, max_stance_drift_px: +maxDrift.toFixed(3), max_penetration_px: +pen.toFixed(3), min_mid_swing_clearance_px: Number.isFinite(minClear) ? +minClear.toFixed(2) : null };
        if (Number.isFinite(minClear) && minClear < 2) bad.push(`swing toe clearance ${minClear.toFixed(2)}px (the swing foot scuffs the ground)`); break; }
      case "CARRY": { let rel0 = null, p0 = null, p1 = null, worst = 0; const R0 = C.rigs.get(rid).root, P_ = (C.propSupport || []).find((x) => x.prop_rig === rid);
        each((s, f) => { const sg = P_?.segments.find((g) => g.frames[0] <= f && f < g.frames[1]), h = P_?.hands.find((x) => x.socket === r.hand && x.rig === r.carrier);
          if (!sg || sg.mode !== "ACTOR_DRIVEN" || !h || sg.driver !== h.ref) return `the prop's transform is not written by ${r.carrier}'s ${r.hand} here (${sg ? sg.mode + " / " + sg.driver : "no support contract"}): a carried prop has no separate owner`;
          const H = C.socketFrame(r.carrier, s.matrices[r.carrier], r.hand), Pm = s.matrices[rid][R0.id], rel = mul(inv(H), Pm), pos = apply(Pm, R0.rest_xy); if (!rel0) { rel0 = rel; p0 = pos; } p1 = pos;
          const d = Math.hypot(rel[4] - rel0[4], rel[5] - rel0[5]), a = Math.abs(wrap180(Math.atan2(rel[1], rel[0]) * 180 / Math.PI - Math.atan2(rel0[1], rel0[0]) * 180 / Math.PI)); worst = Math.max(worst, d); return d > 0.5 || a > 0.5 ? `the prop shifts in the carrying hand (${d.toFixed(2)}px, ${a.toFixed(2)}°)` : null; });
        const travel = p0 && p1 ? Math.hypot(p1[0] - p0[0], p1[1] - p0[1]) : 0; res.measurement = { travel_px: +travel.toFixed(2), max_slip_px: +worst.toFixed(3) }; if (travel < r.min_travel) bad.push(`the carried prop travels ${travel.toFixed(1)}px < ${r.min_travel}px (no carry happened)`); break; }
      case "LOAD_CONTAINER": { let prev = null, maxStep = 0; const R0 = C.rigs.get(rid).root;
        each((s, f) => { const base = C.socketWorld(rid, s.matrices[rid], r.base), inside = C.socketWorld(r.container, s.matrices[r.container], r.inside), rimF = C.socketFrame(r.container, s.matrices[r.container], r.rim), pos = apply(s.matrices[rid][R0.id], R0.rest_xy), why = [];
          if (prev) { const st = Math.hypot(pos[0] - prev[0], pos[1] - prev[1]); maxStep = Math.max(maxStep, st); if (st > 25) why.push(`the prop jumps ${st.toFixed(1)}px in one frame (teleport into the container)`); } prev = pos;
          const below = base[1] > rimF[5] + 0.5; if (below && Math.abs(base[0] - rimF[4]) > r.opening) why.push(`the prop is below the rim ${(base[0] - rimF[4]).toFixed(1)}px off the opening (it passes through the container wall)`);
          if (f >= r.rest_from) { const d = Math.hypot(base[0] - inside[0], base[1] - inside[1]); if (d > r.tol) why.push(`at rest the prop base is ${d.toFixed(2)}px from the inside socket`); } return why.join("; ") || null; });
        res.measurement = { max_step_px: +maxStep.toFixed(2) }; if (!(C.plan.paint_order || []).some((x) => x.above === r.layer && x.below === rid)) bad.push(`the container's front layer ${r.layer} does not occlude ${rid}`); break; }
      case "INSERT_TOKEN": { let prevD = -Infinity, maxD = -Infinity;
        each((s, f) => { const Sf = C.socketFrame(r.container, s.matrices[r.container], r.slot), Tf = C.socketFrame(rid, s.matrices[rid], r.tip), ax = Math.atan2(Sf[1], Sf[0]), n = [Math.cos(ax), Math.sin(ax)], t = [-n[1], n[0]], dx = Tf[4] - Sf[4], dy = Tf[5] - Sf[5], d = dx * n[0] + dy * n[1], lat = dx * t[0] + dy * t[1], why = [];
          const ang = Math.abs(wrap180(Math.atan2(Tf[1], Tf[0]) * 180 / Math.PI - ax * 180 / Math.PI)); if (d > 0 && ang > r.angle) why.push(`token axis ${ang.toFixed(1)}° off the slot axis while inserted (wrong orientation)`);
          if (d > 0 && Math.abs(lat) > r.lateral) why.push(`token ${lat.toFixed(1)}px off the slot laterally at depth ${d.toFixed(1)} (it passes through the solid wall)`);
          if (d < prevD - 1e-6) why.push(`insertion depth decreases ${prevD.toFixed(2)} → ${d.toFixed(2)} (not a monotone insertion)`); if (d > r.depth + r.tol) why.push(`token pushed ${(d - r.depth).toFixed(2)}px past the directed depth`);
          if (f >= r.stop_at && Math.abs(d - r.depth) > r.tol) why.push(`at the stop the depth is ${d.toFixed(2)}px, directed ${r.depth}px`); prevD = d; maxD = Math.max(maxD, d); return why.join("; ") || null; });
        res.measurement = { max_depth_px: +maxD.toFixed(2) }; if (!(C.plan.paint_order || []).some((x) => x.above === r.layer && x.below === rid)) bad.push(`the aperture layer ${r.layer} does not hide the inserted token`); break; }
      case "CAMERA_MOVE": { each((s, f) => { for (const [k, ks] of Object.entries(r.abs)) { const want = ev(ks, f); if (Math.abs((s.camera[k] ?? 0) - want) > 1e-6) return `camera ${k} ${s.camera[k]} ≠ ${want}`; } return null; }); break; }
    }
    if (!n) bad.push("zero frames checked"); res.frames_checked = n; res.ok = !bad.length; res.reason = bad.slice(0, 5).join("; ") || null; results.push(res);
    if (!res.ok) failures.push(err("COMPOSITION_EFFECT_UNMET", { record_id: r.id, frame_range: r.frames, reason: `${r.kind} ${r.owner}: ${res.reason}`, producer: "engine/film/composition_qa.mjs#verifyComposition", details: { primitive: r.id, owner: r.owner } }));
  }
  for (const c of ws.conflicts) failures.push(err("INVALID_TRANSFORM_OWNER", { record_id: c.owner, frame_range: c.interval, reason: `${c.owner}.${c.property} has two absolute writers ${c.producers.join(" and ")}`, producer: "engine/art_bridge/composition.mjs#writeSet" }));
  return { ok: !failures.length, results, failures, write_set: ws };
}
