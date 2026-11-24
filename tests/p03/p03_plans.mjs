// P03 directed motion plans for the two-subject DIAGNOSTIC fixture. Direction owns timing and intent; the engine layers phrases, acting,
// constraints, reactions, deformation, morphs and shadows. Nothing here is a coordinate fitted to the fixture pixels except the plant targets,
// which are DERIVED from the approved rest pose (feet stay where the standing drawing puts them).
export function directedPlan(doc, { only = null } = {}) {
  const A = (id) => doc.assets.find((a) => a.id === id), nova = doc.rigs.find((r) => r.id === "nova_rig");
  const body = A("lumen_body"), [bx, by, bw, bh] = body.canonical_rect, gx = [bx, bx + bw / 2, bx + bw], gy = [by, by + bh / 2, by + bh]; // the mesh tiles the WHOLE approved drawing
  const V = []; for (const y of gy) for (const x of gx) V.push([x, y]); const Tri = []; for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) { const i = r * 3 + c; Tri.push([i, i + 1, i + 4], [i, i + 4, i + 3]); }
  const targets = V.map(([x, y], i) => (i < 3 ? [x + (x - (bx + bw / 2)) * 0.04, y - bh * 0.05] : i < 6 ? [x + (x - (bx + bw / 2)) * 0.06, y] : [x, y])); // inhale: the back rises and the belly widens; the base (contact with ground) stays
  const floorY = 520 + (nova.joints.find((j) => j.id === "ankle_l").rest_xy[1] - nova.joints.find((j) => j.id === "pelvis").rest_xy[1]) + 8;
  const plan = { id: "p03_directed",
    tracks: { nova_rig: { root: { x: [[0, 0], [90, 0], [150, -19, "sine.inOut"], [200, -19], [235, -4, "sine.inOut"]], y: [[0, 0], [50, 0], [80, 12, "sine.inOut"], [200, 12], [236, 5, "sine.inOut"]] }, joints: { head: [[0, 0], [120, -4, "sine.inOut"], [220, 0, "sine.inOut"]] } },
      lumen_rig: { joints: { neck1: [[240, 0], [330, 18, "sine.inOut"], [420, 12, "sine.inOut"]], head: [[240, 0], [330, -10, "sine.inOut"], [460, -6, "sine.inOut"]], tail1: [[240, 0], [300, 14, "sine.inOut"], [360, -10, "sine.inOut"], [420, 8, "sine.inOut"], [479, 0, "sine.inOut"]] } } },
    // primary phrase (layer 2): torso anticipation → pull → follow-through → settle, with the camera sharing the phrase boundaries
    phrases: [{ id: "pull_phrase", start_frame: 50, phases: [{ phase: "ANTICIPATION", frames: 15 }, { phase: "ACTION", frames: 40 }, { phase: "FOLLOW_THROUGH", frames: 30 }, { phase: "SETTLE", frames: 40 }],
      owners: [{ id: "nova_rig.chest", kind: "ACTOR", values: { ANTICIPATION: 8, ACTION: -8, FOLLOW_THROUGH: -6, SETTLE: 0 } }, { id: "cam_a.zoom", kind: "CAMERA", values: { ANTICIPATION: 1.4, ACTION: 1.48, SETTLE: 1.45 } }] }],
    acting: { nova_rig: { lag: { frames_per_depth: 3, lead_joints: ["pelvis"] }, anticipation: { frames: 8, ratio: 0.25, min_delta_deg: 5 }, settle: { overshoot_ratio: 0.15, frames: 10, min_delta_deg: 5 }, breath: { joint: "chest", amplitude_deg: 0.8, period_frames: 200 },
        follow: [{ joint: "hair", driver_joint: "chest", stiffness: 70, damping: 6, gain: 0.4 }], blink: { channel: "eyes", open: "open", closed: "closed", period_frames: 150, duration_frames: 7, phase_frames: 30 },
        speech: { channel: "mouth", rest: "rest", open: "open", mid: "mid", words: [{ start_s: 0.5, end_s: 0.9, w: "pull" }, { start_s: 1.0, end_s: 1.6, w: "together" }] }, gaze: { joint: "head", target: { rig: "lever_rig", socket: "lever_handle" }, gain: 0.5, max_deg: 12, forward_deg: 0 } },
      lumen_rig: { lag: { frames_per_depth: 4 }, breath: { joint: "body", amplitude_deg: 1.5, period_frames: 160 }, follow: [{ joint: "tail2", driver_joint: "tail1", stiffness: 80, damping: 6, gain: 3 }], blink: { channel: "eye", open: "open", closed: "closed", period_frames: 120, duration_frames: 8, phase_frames: 260 }, gaze: { joint: "head", target: { world_xy: [760, 540] }, gain: 0.6, max_deg: 15, forward_deg: 0, frames: [330, 480] } } },
    reaches: { "nova_pull_lever:nova_grip": { approach: [30, 70], release: [200, 232], orient: "RELATIVE" } },
    reactions: [{ id: "lever_follow", type: "HINGE_FOLLOW", rig: "lever_rig", joint: "arm", handle_socket: "lever_handle", driver: { rig: "nova_rig", joint: "shoulder_r" }, frames: [70, 200], hold_after: true, allowed_error_px: 1 }],
    support: { nova_rig: { feet: ["nova_sole_l", "nova_sole_r"], mass: { pelvis: 3, chest: 3, head: 1.5 }, margin_px: 8, grip_support: ["nova_grip"] } },
    grips: { "nova_pull_lever:nova_grip": { hand_channel: "hand_r", palm_basis_deg: 194, handle_basis_deg: 0, closure_state: "grip", near_far: "HAND_IN_FRONT", single_layer_reason: "DIAGNOSTIC fist: one closed drawing seen from the back of the hand hides the far fingers", tol_deg: 30, prop_relation: "REACTION" } },
    paint_order: [{ above: "nova_hand_open", below: "lever_arm" }, { above: "nova_forearm", below: "lever_arm" }],
    shadows: ["nova_torso", "nova_thigh_l", "nova_shin_l", "nova_thigh_r", "nova_shin_r"].map((slot) => ({ id: `nova_floor_${slot}`, ground_contact: true, occluder: { rig: "nova_rig", slot }, receiver: { id: "floor", plane_y: floorY, material: "floor", foreshorten: 0.22 }, light: { direction: [0.7, 1], state: "key_left" } })),
    morphs: { nova_pull_lever: { rig: "nova_rig", slot: "nova_brow_neutral", from: "nova_brow_neutral", to: "nova_brow_raised", weight: [[0, 0], [60, 0], [90, 1, "sine.inOut"], [200, 1], [230, 0, "sine.inOut"]] } },
    deform_maps: { lumen_watch: { rig: "lumen_rig", slot: "lumen_body", asset: "lumen_body", approved_receipt: "DIAGNOSTIC_MESH_TEST_TRUST", vertices: V, triangles: Tri, targets, weight: [[240, 0], [300, 1, "sine.inOut"], [360, 0, "sine.inOut"], [420, 1, "sine.inOut"], [479, 0, "sine.inOut"]] } },
    cameras: { cam_a: { x: [[0, 640]], y: [[0, 430]] }, cam_b: { x: [[240, 560]], y: [[240, 520]], zoom: [[240, 1.6]] } } };
  if (only) for (const k of Object.keys(plan)) if (!["id", "tracks", "cameras", "reaches", ...only].includes(k)) delete plan[k];
  return plan;
}
/** the bare plan of the same shots (direction keys only) — the "before" for every capability */
export const barePlan = (doc) => directedPlan(doc, { only: [] });
