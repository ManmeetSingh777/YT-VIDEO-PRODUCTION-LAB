// P08 B03 — genuine PINCH (and its relation to WRAP). A PINCH contact is never a closed fist and never a single point: it binds a hand's reviewed
// THUMB patch and opposing FINGER patch to a target edge of a registered prop, with an approved pinch closure drawing whose thumb and finger layers
// are separate painted slots (NEAR and FAR). Two representations, chosen per contact by the director:
//   FACE_ON  (thin object seen face-on, e.g. a page): both patches reach the edge point within tolerance in 2D, the NEAR (thumb) slot paints above
//            the prop and the FAR (fingers) slot below it — the opposition is a depth relation, proved by paint order + owner pixels;
//   EDGE_ON  (object seen edge-on, e.g. a coin): the patches lie on OPPOSITE sides of the edge along its face normal (socket basis), separated
//            by thickness + 2·clearance within tolerance, laterally on the edge.
// The contract (PINCH_CONTRACT v1, plan.pinch_contracts) is the approved input; a PINCH contact without one is refused (never filtered or fisted).
import { err } from "./errors.mjs";
import { apply, angleOf } from "./math2d.mjs";
export const PINCH_VERSION = "1.0.0";
const refuse = (code, o) => err(code, { record_id: o.record ?? null, frame_range: o.frame_range ?? null, reason: o.reason, producer: `engine/art_bridge/pinch.mjs#${o.fn ?? "normalizePinch"}`, failed_invariant: o.invariant, required_art_or_operation: o.needed ? [].concat(o.needed) : [], details: { failed_invariant: o.invariant } });
/** normalizePinch(contracts, {rigs, contacts}) → {byContact: Map(contact_id → contract), paint_order: [{above, below}], errors} */
export function normalizePinch(contracts = [], { rigs, contacts }) {
  const errors = [], byContact = new Map(), paint = [];
  for (const k of contacts.filter((x) => x.c.contact_type === "PINCH")) {
    const pc = contracts.find((x) => x.source_socket === k.c.source_socket && x.start_frame === k.c.start_frame); const no = (inv, reason, needed) => errors.push(refuse("PINCH_CONTRACT_REQUIRED", { record: k.identity.contact_id, frame_range: [k.c.start_frame, k.c.end_frame], invariant: inv, reason, needed }));
    if (!pc) { no("PINCH_HAS_CONTRACT", `PINCH ${k.identity.contact_id} has no approved PINCH_CONTRACT (thumb/finger patches, target edge, view, thickness, clearance, near/far layers): it is refused, never converted to a grip or fist`, "an approved PINCH_CONTRACT for this contact"); continue; }
    if (pc.schema_version !== PINCH_VERSION) { no("PINCH_CONTRACT_V1", `pinch contract ${pc.id}: schema_version ${pc.schema_version} (1.0.0 required)`); continue; }
    const hand = rigs.get(k.rig)?.rec, prop = rigs.get(k.tgtRig)?.rec;
    if (!hand || !prop) { no("PINCH_OWNERS", `pinch ${pc.id} needs the hand rig and a registered prop rig`); continue; }
    for (const s of [pc.thumb_socket, pc.finger_socket]) if (!hand.sockets.some((x) => x.id === s)) no("PINCH_PATCH_SOCKETS", `pinch ${pc.id}: ${s} is not a reviewed patch socket of ${hand.id}`, `reviewed thumb/finger patch landmarks on ${hand.id}`);
    if (k.c.target_socket !== pc.target_socket) no("PINCH_TARGET_EDGE", `pinch ${pc.id} names edge ${pc.target_socket}; the contact targets ${k.c.target_socket}`);
    if (!["FACE_ON", "EDGE_ON"].includes(pc.view)) no("PINCH_VIEW", `pinch ${pc.id}: view must be FACE_ON or EDGE_ON`);
    if (!(pc.thickness_px >= 0) || !(pc.clearance_px >= 0) || !(pc.tolerance_px > 0)) no("PINCH_MEASURED", `pinch ${pc.id}: thickness/clearance/tolerance are measured, non-negative values (tolerance > 0)`);
    const slots = new Set(hand.render_parts.map((p) => p.asset_id)); for (const s of [pc.near_slot, pc.far_slot]) if (!slots.has(s)) no("PINCH_LAYERS_PAINTED", `pinch ${pc.id}: layer slot ${s} is not a painted slot of ${hand.id} (a pinch needs separate near thumb and far finger layers)`, `separate near/far pinch layers on ${hand.id}`);
    if (pc.near_slot === pc.far_slot) no("PINCH_LAYERS_SEPARATE", `pinch ${pc.id}: near and far layers must be different slots`);
    if (!pc.closure?.channel || !pc.closure?.state || !(hand.state_channels || []).find((c) => c.id === pc.closure.channel)?.states.some((s) => s.id === pc.closure.state)) no("PINCH_CLOSURE_DRAWN", `pinch ${pc.id}: the approved pinch closure drawing (${pc.closure?.channel}.${pc.closure?.state}) is missing`, `approved pinch closure drawing on ${hand.id}`);
    byContact.set(k.identity.contact_id, pc); if (pc.view === "FACE_ON") paint.push({ above: pc.near_slot, below: prop.id, source: `pinch:${pc.id}` }, { above: prop.id, below: pc.far_slot, source: `pinch:${pc.id}` });
  }
  return { byContact, paint_order: paint, errors };
}
/** pinchGeometry(C, S, k, pc) → {ok, why, measurement} on one evaluated frame */
export function pinchGeometry(C, S, k, pc) {
  const th = C.socketWorld(k.rig, S.matrices[k.rig], pc.thumb_socket), fi = C.socketWorld(k.rig, S.matrices[k.rig], pc.finger_socket), Ef = C.socketFrame(k.tgtRig, S.matrices[k.tgtRig], pc.target_socket), e = [Ef[4], Ef[5]], n0 = angleOf(Ef) * Math.PI / 180, n = [Math.cos(n0), Math.sin(n0)], t = [-n[1], n[0]];
  const dt = (th[0] - e[0]) * n[0] + (th[1] - e[1]) * n[1], df = (fi[0] - e[0]) * n[0] + (fi[1] - e[1]) * n[1], lt = (th[0] - e[0]) * t[0] + (th[1] - e[1]) * t[1], lf = (fi[0] - e[0]) * t[0] + (fi[1] - e[1]) * t[1], m = { dt, df, lt, lf };
  if (pc.view === "FACE_ON") { const a = Math.hypot(th[0] - e[0], th[1] - e[1]), b = Math.hypot(fi[0] - e[0], fi[1] - e[1]); m.thumb_to_edge_px = a; m.finger_to_edge_px = b; return { ok: a <= pc.tolerance_px && b <= pc.tolerance_px, why: a > pc.tolerance_px || b > pc.tolerance_px ? `patches ${a.toFixed(2)} / ${b.toFixed(2)}px from the edge (tolerance ${pc.tolerance_px})` : null, measurement: m }; }
  const sep = Math.abs(dt - df), want = pc.thickness_px + 2 * pc.clearance_px, opp = Math.sign(dt) !== Math.sign(df) && Math.abs(dt) > 1e-9 && Math.abs(df) > 1e-9;
  if (!opp) return { ok: false, why: `thumb (${dt.toFixed(2)}) and finger (${df.toFixed(2)}) are on the SAME side of the edge (no opposition)`, measurement: m };
  if (Math.abs(sep - want) > pc.tolerance_px) return { ok: false, why: `patch separation ${sep.toFixed(2)}px ≠ thickness + clearance ${want}px (${sep > want ? "fingers hover" : "fingers intersect the object"})`, measurement: m };
  if (Math.abs(lt) > pc.tolerance_px || Math.abs(lf) > pc.tolerance_px) return { ok: false, why: `patches off the edge laterally (${lt.toFixed(2)} / ${lf.toFixed(2)}px)`, measurement: m };
  return { ok: true, why: null, measurement: m };
}
void apply;
