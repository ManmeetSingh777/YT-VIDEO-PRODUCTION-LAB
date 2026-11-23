// Rig binding (spec §5.1). Correspondence with the live repo (recorded in BASELINE.md): engine/runtime/mn.js `MN.rig` and engine/compiler/
// rig.mjs `defineRig` place hand-authored SVG parts and write rotate() strings through S.k; mn.js ik2 clamps (mn.js:167). For approved IMAGE
// parts the bridge keeps the same scene runtime (nu.js NU.scene: S.at / S.render / S.done, unmodified) but owns the transform itself: one
// FK cache per frame from temporal.stateAtFrame, non-clamping IK from constraints.mjs, written once per pass group. Approved pixels are
// never edited; only <g> transforms/visibility change.
import { err } from "./errors.mjs";
import { stateAtFrame } from "./temporal.mjs";

/** bindRig(scene, rigMeta, assetState) — scene = composeShot(...) result, rigMeta = manifest rig record, assetState = compiled plan */
export function bindRig(scene, rigMeta, assetState) {
  const passIds = scene.runtimeIds.filter((id) => id.includes(`${rigMeta.id}--`));
  if (!passIds.length) throw err("UNKNOWN_REFERENCE", { record_id: rigMeta.id, reason: "rig has no emitted paint passes in this scene" });
  for (const p of rigMeta.render_parts) if (!rigMeta.joints.some((j) => j.id === p.joint_id)) throw err("INVALID_RIG_DAG", { record_id: `${rigMeta.id}.${p.asset_id}`, reason: `render part bound to unknown joint ${p.joint_id}` });
  return Object.freeze({
    rig_id: rigMeta.id, passIds,
    /** solveRigAt(frame) → {joints: {id: matrix}, sockets: {id: [x,y]}, failures} from the single transform cache */
    solveRigAt(frame) {
      const st = stateAtFrame(assetState, frame), M = st.matrices[rigMeta.id];
      if (!M) throw err("UNKNOWN_REFERENCE", { record_id: rigMeta.id, frame_range: [frame, frame + 1], reason: "rig not placed at this frame" });
      return { joints: M, sockets: Object.fromEntries(rigMeta.sockets.map((s) => [s.id, assetState.socketWorld(rigMeta.id, M, s.id)])), failures: st.failures, contacts: st.contacts };
    },
  });
}
