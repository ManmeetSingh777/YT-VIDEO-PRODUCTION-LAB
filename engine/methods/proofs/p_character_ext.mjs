// Isolated Stage-1 proofs (diagnostic fixtures, NOT artwork): body/garment, hands, family routing, creature graph, state families,
// motion ownership/contacts, transitions, alpha/underpaint.
import { prove } from "../proof.mjs";
import { solvePalette } from "../palette.mjs";
import { constructBody } from "../body.mjs";
import { constructHand, graspIndicatesProp } from "../hand.mjs";
import { routeFamily, constructCreature } from "../family.mjs";
import { buildStateFamily } from "../states.mjs";
import { assignOwnership, scheduleEvents, solveContacts, proofSamples } from "../motion.mjs";
import { planTransition } from "../transition.mjs";
import { ownLayers } from "../layers.mjs";
import { constructSilhouette, silhouetteElement } from "../contour.mjs";
import { compose } from "../emit.mjs";

const ring = (pts, ch = []) => ({ landmarks: pts.map(([id, x, y, j]) => ({ id, p: [x, y], joint: j || "smooth" })), spans: pts.map((p, i) => ({ from: p[0], to: pts[(i + 1) % pts.length][0], character: ch[i]?.[0] ?? "convex", amount: ch[i]?.[1] ?? 0.12 })) });
const PAL = { situation: "quiet_light_field", roles: {
  field: { slot: "primary_substrate", hue: 95, chroma: 0.07, owners: ["bg"] }, torsoCloth: { slot: "main_subject", hue: 230, chroma: 0.12, owners: ["torso"], L: 0.55 },
  sleeveCloth: { slot: "main_subject", hue: 235, chroma: 0.12, owners: ["arms"], L: 0.5 }, trouserCloth: { slot: "shadow_anchor", hue: 270, chroma: 0.08, owners: ["legs"], L: 0.3 },
  skin: { slot: "main_subject", hue: 55, chroma: 0.09, owners: ["hands"], L: 0.78 }, cuffNear: { slot: "accent", hue: 30, chroma: 0.13, owners: ["cuff"], L: 0.7 }, cuffFar: { slot: "material_dark_plane", hue: 30, chroma: 0.1, owners: ["cuff"], L: 0.5 },
  foldShade: { slot: "material_dark_plane", hue: 245, chroma: 0.1, owners: ["arms"], L: 0.4 }, farLeg: { slot: "material_dark_plane", hue: 270, chroma: 0.07, owners: ["legs"], L: 0.22 } }, pairs: [{ a: "torsoCloth", b: "field", channel: "luminance", min: 3 }] };
const BODY = { id: "bd", pal: PAL, layer: 1, pose: { pelvis: [400, 545], torsoAngle: 6, torsoLen: 190, shoulderWidth: 150, hipWidth: 110, shoulderTilt: -4, hipTilt: 3, state: "held" },
  torsoGarment: { chestBulge: 0.08, waistTaper: 0.05, hemDrop: 30, collar: "v", collarDepth: 40 }, support: { weightFoot: "legNear", groundY: 820, footLength: 90 },
  limbs: [{ id: "armNear", root: "shoulderNear", lengths: [110, 100], widths: [44, 36, 26], angles: [100, -70], garment: "sleeve", bendSign: 1, stiffness: 0.3, cuff: { at: 0.75, thickness: 14, flare: 4 } },
    { id: "armFar", root: "shoulderFar", lengths: [110, 100], widths: [40, 33, 24], angles: [80, 20], garment: "sleeve", bendSign: -1, stiffness: 0.3, cuff: { at: 0.75, thickness: 14, flare: 4 } },
    { id: "legNear", root: "hipNear", lengths: [168, 160], widths: [58, 44, 34], target: [410, 820], garment: "trouser", bendSign: -1, stiffness: 0.5 },
    { id: "legFar", root: "hipFar", lengths: [168, 158], widths: [54, 42, 32], target: [470, 815], garment: "trouser", bendSign: -1, stiffness: 0.5 }] };
const HAND = { id: "hd", pal: PAL, wrist: [500, 400], forearmDir: [1, 0.25], grip: "power", palm: { length: 46, width: 40 }, fingers: { length: 52, thickness: 13, groups: 2 }, thumb: { length: 34, thickness: 12, side: "near" }, propLayer: 5, prop: { id: "pole", axisPoint: [560, 300], axisDir: [0.15, 1], radius: 14 } };

export function run() {
  const R = [];
  const bodyP = (d) => constructBody({ ...d, colors: solvePalette(d.pal).roles });
  R.push(prove({ method: "F66", class: "ART_DESIGN", name: "F06/F66 constructBody", base: BODY, producer: bodyP, inputs: ["pose", "limbs", "torsoGarment", "support"],
    perturb: [{ path: "limbs.0.angles", value: [100, -120], expect: /armNear(\.fold|\.cuff|$)/, confine: /bd\.armNear|data:limbs|data:weight/ }, { path: "limbs.0.stiffness", value: 0.9, expect: /armNear\.fold/ }, { path: "torsoGarment.chestBulge", value: -0.1, expect: /bd\.torso$/, confine: /bd\.(torso|collar)$/ }, { path: "pose.torsoAngle", value: 20, expect: /bd\.torso$|armNear/ }, { path: "torsoGarment.collar", value: "stand", expect: /collar/, confine: /collar/ }],
    refuse: [{ path: "limbs.2.target", value: [900, 900], why: "UNREACHABLE target (no silent IK clamp)" }, { path: "limbs", value: (ls) => ls.map((l) => ({ ...l, widths: [40, 40, 40], lengths: [120, 120] })), why: "ARTISTIC F06: identical uniform tubes" }, { path: "support.weightFoot", value: "tail", why: "support foot must be a constructed limb" }],
    falsifier: (r) => ({ pass: r.data.limbs.armNear.folds >= 1 && r.data.weight.grounded, detail: { folds: r.data.limbs.armNear.folds, weight: r.data.weight, failure: r.data.weightFailure } }) }));
  const handP = (d) => constructHand({ ...d, colors: solvePalette(d.pal).roles });
  R.push(prove({ method: "F06", class: "ART_DESIGN", name: "F06/F59 constructHand", base: HAND, producer: handP, inputs: ["grip", "prop.axisPoint", "prop.axisDir", "prop.radius", "fingers", "thumb.side"],
    perturb: [{ path: "prop.radius", value: 9, expect: /finger/ }, { path: "prop.axisDir", value: [0.6, 1], expect: /finger/ }, { path: "thumb.side", value: "far", expect: /thumb|data:stack/ }, { path: "grip", value: "hook", expect: /finger|data:grip/ }],
    refuse: [{ path: "prop.radius", value: 60, why: "grip cannot close around a thick handle" }, { path: "forearmDir", value: [0.15, 1], why: "hand cannot close across a handle it runs along" }, { path: "grip", value: "claw", why: "unknown grip" }],
    falsifier: (r) => { const g = graspIndicatesProp(r, HAND.prop); const st = r.elements.find((e) => /finger0/.test(e.id)).layer > HAND.propLayer && r.elements.find((e) => /palm/.test(e.id)).layer < HAND.propLayer; return { pass: g.pass && st, detail: { g, nearFingersOverPropPalmBehind: st } }; } }));
  R.push(prove({ method: "F64", class: "ROUTING", name: "F64 routeFamily", base: { subjectKind: "human", faceVisible: true, bodyVisible: true, screenHeightPx: 700, headPx: 220, task: "expression", gear: false }, producer: (d) => ({ data: routeFamily(d) }), inputs: ["subjectKind", "faceVisible", "screenHeightPx", "headPx", "task"],
    perturb: [{ path: "faceVisible", value: false, expect: /data:/ }, { path: "screenHeightPx", value: 60, expect: /data:/ }, { path: "task", value: "gesture", expect: /data:/ }], refuse: [{ path: "subjectKind", value: "cartoon", why: "unknown kind" }] }));
  const CRE = { id: "cr", pal: { ...PAL }, family: "quadruped", species: "diagnostic quadruped", farShift: 0.1, distinguishes: "diagnostic fixture: long neck wedge + short tail identify the species graph",
    parts: [{ id: "torso", parent: null, class: "torso", design: { view: "profile_left", identity: ["withers"], ...ring([["withers", 400, 300, "corner"], ["rump", 600, 310], ["belly", 560, 420, "corner"], ["chest", 420, 410]], [["concave", 0.05], ["convex", 0.15], ["straight", 0], ["convex", 0.12]]) }, joint_type: "rooted", fillRole: "torsoCloth" },
      { id: "neck", parent: "torso", class: "neck_head", design: { view: "profile_left", identity: ["muzzle"], ...ring([["base", 0, 0, "corner"], ["poll", -60, -110], ["muzzle", -120, -70, "corner"], ["throat", -40, 10]]) }, socket: "base", anchor: "withers", joint_type: "inserted", insertion_depth: 10, angle: 0, front: true, fillRole: "torsoCloth" },
      { id: "legN", parent: "torso", class: "leg_near", design: { view: "profile_left", identity: ["hoof"], ...ring([["top", 0, 0], ["k", 18, 60, "corner"], ["hoof", 10, 120, "corner"], ["b", -14, 60]]) }, socket: "top", anchor: "chest", joint_type: "inserted", insertion_depth: 12, angle: 0, front: true, fillRole: "torsoCloth" },
      { id: "legF", parent: "torso", class: "leg_far", farRole: "farLeg", design: { view: "profile_left", identity: ["hoof"], ...ring([["top", 0, 0], ["k", 18, 60, "corner"], ["hoof", 10, 120, "corner"], ["b", -14, 60]]) }, socket: "top", anchor: "belly", joint_type: "inserted", insertion_depth: 12, angle: 0, front: true, fillRole: "torsoCloth" },
      { id: "tail", parent: "torso", class: "tail", design: { view: "profile_left", identity: ["tip"], ...ring([["r", 0, 0], ["tip", 30, 70, "corner"], ["s", -8, 30]]).landmarks.length ? { ...ring([["r", 0, 0], ["m", 20, 20], ["tip", 30, 70, "corner"], ["s", -8, 30]]) } : {} }, socket: "r", anchor: "rump", joint_type: "inserted", insertion_depth: 6, angle: 0, front: false, fillRole: "trouserCloth" }] };
  CRE.parts[4].design = { view: "profile_left", identity: ["tip"], ...ring([["r", 0, 0], ["m", 20, 20], ["tip", 30, 70, "corner"], ["s", -8, 30]]) };
  const creP = (d) => constructCreature({ ...d, colors: solvePalette(d.pal).roles });
  R.push(prove({ method: "F07", class: "ART_DESIGN", name: "F07 constructCreature", base: CRE, producer: creP, inputs: ["family", "parts"],
    perturb: [{ path: "parts.1.angle", value: 25, expect: /cr\.neck/, confine: /cr\.neck|data:/ }, { path: "parts.3.farRole", value: "torsoCloth", expect: /cr\.legF/ }],
    refuse: [{ path: "parts.3.farRole", delete: true, why: "near/far limbs undifferentiated" }, { path: "parts.4.class", value: "ear", why: "quadruped graph lacks tail" }, { path: "family", value: "macro", why: "macro parts must name biological subparts" }],
    falsifier: (r) => { const f = r.elements.find((e) => e.id === "cr.legF"), n = r.elements.find((e) => e.id === "cr.legN"); return { pass: f.fill !== n.fill, detail: { far: f.fill, near: n.fill } }; } }));
  // state family over the body producer: pose states redraw, identity anchors registered, pelvis rule
  const famP = (d) => buildStateFamily({ id: "bodyStates", producer: (x) => { const r = bodyP(x); return { ...r, landmarks: { neck: r.joints.neck, pelvis: r.joints.pelvis, sN: r.joints.shoulderNear } }; }, canonical: d.canonical, anchors: ["neck", "pelvis", "sN"], tolerance: d.tolerance, poseStates: ["reach"],
    states: [{ id: "reach", change: "view_pose", patch: (x) => { x.pose.torsoAngle = d.reachLean; x.limbs[0].angles = [20, -10]; return x; } }, { id: "lift", change: "expression_hand_contact", patch: (x) => { x.limbs[0].angles = [60, -100]; return x; } }] });
  R.push(prove({ method: "F30", class: "MOTION_STATE", name: "F14/F30/F67 buildStateFamily", base: { canonical: BODY, tolerance: 2, reachLean: 14 }, producer: (d) => { const r = famP(d); return { elements: r.atlas.reach.elements, data: { table: r.data.table } }; }, inputs: ["canonical", "tolerance"],
    perturb: [{ path: "reachLean", value: 25, expect: /bd\.torso$/ }],
    refuse: [{ path: "reachLean", value: 6, why: "ARTISTIC F06: pose state over a static pelvis/torso" }],
    falsifier: () => { const r = famP({ canonical: BODY, tolerance: 2, reachLean: 14 }); return { pass: r.data.pass && r.data.table.every((t) => t.transitionFromCanonical === "DRAWN_STATE_OR_CUT" || t.transitionFromCanonical === "INTERPOLATE"), detail: r.data.table }; } }));
  // motion
  const MOT = { regions: [{ id: "city", primary: "WORLD", channels: ["transform"] }, { id: "cam", primary: "CAMERA", channels: ["transform"] }, { id: "hand", primary: "SUBJECT_PART", channels: ["transform", "deform"] }],
    events: [{ id: "reach", offset: 0.2, duration: 0.8, owner: "SUBJECT_PART", beat: "b1", state_to: "reach" }, { id: "grab", after: ["reach"], offset: 0, duration: 0.3, owner: "REDRAWN_STATE", beat: "b1", state_to: "grip" }, { id: "lift", after: ["grab"], offset: 0.1, duration: 1, owner: "SUBJECT_PART", beat: "b2", state_to: "lifted" }],
    tracks: { hand: { keys: [{ t: 0, v: [0, 0] }, { t: 1, v: [100, 0] }, { t: 3, v: [100, -50] }], ease: "organic" }, handle: { keys: [{ t: 0, v: [100, 0] }, { t: 1.4, v: [100, 0] }, { t: 2.4, v: [100, -120] }], ease: "mechanical" } },
    contacts: [{ member: "hand", target: "handle", from: 1.0, to: 2.4, kind: "grasp" }] };
  const motP = (d) => { const o = assignOwnership(d.regions), s = scheduleEvents(d.events), c = solveContacts({ tracks: d.tracks, contacts: d.contacts, times: [0, 0.5, 1, 1.5, 2, 2.4, 3] }); const ps = proofSamples({ events: s.schedule, contacts: d.contacts, swaps: [1.0] }); return { data: { tracks: o.tracks, schedule: s.schedule, drift: c.maxContactDrift, hand2: c.frames[4].pos.hand, samples: ps.frames } }; };
  R.push(prove({ method: "F31", class: "MOTION_STATE", name: "F15/F31 ownership+schedule+contacts", base: MOT, producer: motP, inputs: ["regions", "events", "tracks", "contacts"],
    perturb: [{ path: "events.1.duration", value: 0.6, expect: /data:schedule/ }, { path: "tracks.handle.keys.2.v", value: [140, -120], expect: /data:hand2/ }, { path: "contacts.0.to", value: 1.2, expect: /data:hand2/ }],
    refuse: [{ path: "regions.0.channels", value: ["deform"], why: "WORLD under camera pan cannot morph" }, { path: "events.0.after", value: ["lift"], why: "cyclic events" }, { path: "regions", value: (r) => [...r, { id: "city", primary: "CAMERA", channels: ["transform"] }], why: "two primary owners" }],
    falsifier: (r) => ({ pass: r.data.drift === 0, detail: { drift: r.data.drift } }) }));
  // transitions: plates are produced drawings (diagnostic silhouettes)
  const plate = (dx) => { const els = [0, 1, 2].map((k) => silhouetteElement(`p${dx}_${k}`, constructSilhouette({ view: "front", identity: ["a"], ...ring([["a", 100 + dx + k * 90, 100, "corner"], ["b", 170 + dx + k * 90, 120], ["c", 150 + dx + k * 90, 200, "corner"], ["d", 100 + dx + k * 90, 190]]) }), "#556677", k)); return compose(`plate${dx}`, els); };
  const TR = { id: "tr", op: "part_to_whole", reason: "reveal_containment_context", frames: { start: 1, mid: 1.5, end: 2 }, invariant: { identity: "anchor object", anchorsOut: [[100, 100], [300, 120], [200, 300]], anchorsIn: [[400, 300], [500, 310], [450, 400]] } };
  const trP = (d) => planTransition({ ...d, out: plate(0), in: plate(400) });
  R.push(prove({ method: "F78", class: "MOTION_STATE", name: "F16/F35/F78 planTransition", base: TR, producer: trP, inputs: ["op", "invariant.anchorsOut", "invariant.anchorsIn", "frames"],
    perturb: [{ path: "invariant.anchorsIn", value: [[400, 300], [600, 320], [500, 500]], expect: /data:/ }, { path: "frames.mid", value: 1.2, expect: /data:states/ }],
    refuse: [{ path: "invariant.anchorsOut", value: [[100, 100], [300, 120]], why: "<3 shared landmarks" }, { path: "invariant.anchorsIn", value: [[400, 300], [900, 310], [450, 900]], why: "landmarks not related by one camera transform" }, { path: "op", value: "dissolve", why: "unknown op" }] }));
  // F79
  const L = { motion: [{ t: 0, dx: 0, dy: 0 }, { t: 1, dx: 200, dy: 0 }], cameras: [{ t: 0, rect: [0, 0, 800, 450] }], master: [-100, -100, 1200, 700], under: 900 };
  const layP = (d) => { const sub = compose("sub", [silhouetteElement("s", constructSilhouette({ view: "front", identity: ["a"], ...ring([["a", 100, 100, "corner"], ["b", 200, 110], ["c", 190, 220, "corner"], ["d", 110, 210]]) }), "#333333", 2)]);
    const und = compose("und", [silhouetteElement("u", constructSilhouette({ view: "front", identity: ["a"], ...ring([["a", 0, 0, "corner"], ["b", d.under, 0, "corner"], ["c", d.under, 400, "corner"], ["dd", 0, 400, "corner"]], [["straight", 0], ["straight", 0], ["straight", 0], ["straight", 0]]) }), "#999999", 0)]);
    const r = ownLayers({ subject: sub, underpaint: und, motion: d.motion, cameras: d.cameras, master: d.master }); return { data: { ...r.data, pass: r.pass } }; };
  R.push(prove({ method: "F79", class: "GEOMETRY", name: "F79 ownLayers", base: L, producer: layP, inputs: ["motion", "cameras", "master"], perturb: [{ path: "under", value: 300, expect: /data:uncoveredRevealCells|data:pass/ }, { path: "cameras.0.rect", value: [0, 0, 1300, 450], expect: /data:overscan|data:pass/ }],
    falsifier: (r) => ({ pass: r.data.pass === true, detail: r.data }) }));
  return R;
}
