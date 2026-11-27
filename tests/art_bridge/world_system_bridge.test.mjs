// compileWorldSystem carries the COMPLETE authored world specification to the strict F01–F80 skill compiler (compile_art_job.py#validate).
// The skill's own validator is the oracle: before this fix the 10-key whitelist dropped 11 fields the skill requires.
import { test } from "node:test"; import assert from "node:assert/strict"; import { spawnSync } from "node:child_process"; import path from "node:path"; import url from "node:url";
import { compileWorldSystem } from "../../engine/art_bridge/source_method_causality.mjs"; import { fixedFrameRig as fixedFrameRigProbe } from "../../engine/art_bridge/art_contract.mjs";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), SCRIPTS = path.join(REPO, "reference", "construct-kurzgesagt-art", "scripts");
const skillWorldErrors = (world_system) => { const job = { world_system, method_bindings: [{ method_id: "F49" }] };
  const py = `import sys,json; sys.path.insert(0, ${JSON.stringify(SCRIPTS)}); import compile_art_job as C\nfrom unittest import mock\njob=json.loads(sys.stdin.read())\nerrs=[]\n` +
    `w=job['world_system']\nfor k in C.WORLD_REQUIRED_TEXT:\n  (C.nonempty(w.get(k)) or errs.append('world_system.%s missing'%k))\nfor k in C.WORLD_REQUIRED_COLLECTIONS:\n  ((isinstance(w.get(k),list) and w[k]) or errs.append('world_system.%s must be a nonempty list'%k))\n` +
    `full={**{k:{} for k in C.MANDATORY_SECTIONS}, 'original_content':{'script_excerpt':'x','scene_goal':'x','new_subjects':['x'],'noncopy_source_content':True}, 'subject_graph':[{'id':'a','family':'f','whole_silhouette':'s','view_dependent_parts':'v','attachment_and_contact':'c','surface_materials':'m'}], 'method_bindings':[{'method_id':'F49','conditions':'c','source_witnesses':['w'],'invariant_transferred':'i','variation_required':'v','observable_verification':'o'}], 'observable_negative_tests':['n'], 'world_system':w}\n` +
    `errs+= [e for e in C.validate(full) if e.startswith('world_system') or 'F37' in e]\nprint(json.dumps(sorted(set(errs))))`;
  const r = spawnSync(process.env.PYTHON || "python", ["-I", "-c", py], { input: JSON.stringify(job), encoding: "utf8" }); assert.equal(r.status, 0, r.stderr); return JSON.parse(r.stdout); };
const part = (id) => ({ id, silhouette: `${id} silhouette`, projection: "oblique 3/4", function: `${id} function` });
const WORLD = { world_class: "SCENIC_INTERIOR", purpose: "room", world_purpose: "where the award is set down", substrate: "tiled floor plane", coord_system: "room origin at counter front", focal_read_test: "award reads at 1/8 scale",
  projection: "OBLIQUE", depth_layers: ["far", "mid", "counter"], regions: [{ id: "counter_zone" }], parts: [part("counter"), part("window")], relationships: [{ from: "window", to: "counter", type: "behind" }],
  detail_generators: [{ id: "tile_rows" }], material_owners: ["counter"], material_ownership: [{ owner: "counter", material: "laminate" }],
  effect_ownership: [{ owner: "window", kind: "glare", allowed_region: "glass", count_or_coverage_limit: "1", forbidden_regions: ["faces"] }], visibility_masks: [{ id: "counter_occluder" }],
  native_crop_tests: [{ crop: "counter", reads: "support surface" }], source_only_witnesses: ["w1.png", "w2.png"], content_noncopy_invariants: ["no source room layout"], allowed_subject_ids: ["counter"], forbidden_extras: ["extra diners"] };
const design = (extra = {}) => ({ job_id: "W", world_construction: structuredClone(WORLD), ...extra });

test("WS-1 the full authored world specification crosses the bridge and satisfies the strict skill compiler", () => {
  const ws = compileWorldSystem(design());
  for (const k of Object.keys(WORLD)) assert.deepEqual(ws[k], WORLD[k], `field ${k} preserved`);
  assert.deepEqual(skillWorldErrors(ws), []);
});
test("WS-2 the old whitelist is refused by the skill (the defect this fixes)", () => {
  const keep = ["world_class", "purpose", "projection", "depth_layers", "parts", "relationships", "material_owners", "source_only_witnesses", "effect_ownership", "allowed_subject_ids"];
  const errs = skillWorldErrors(Object.fromEntries(keep.map((k) => [k, WORLD[k]])));
  for (const k of ["world_purpose", "substrate", "coord_system", "focal_read_test", "regions", "detail_generators", "material_ownership", "visibility_masks", "native_crop_tests", "content_noncopy_invariants", "forbidden_extras"]) assert.ok(errs.some((e) => e.includes(`.${k} `)), `${k} reported missing`);
});
test("WS-3 the skill stays the authority: a field the design omits is still reported, never filled in", () => {
  const d = design(); delete d.world_construction.substrate; const ws = compileWorldSystem(d);
  assert.equal("substrate" in ws, false); assert.deepEqual(skillWorldErrors(ws), ["world_system.substrate missing"]);
});
test("WS-4 a design carrying a different world_system is refused; an identical one is accepted", () => {
  assert.doesNotThrow(() => compileWorldSystem(design({ world_system: structuredClone(WORLD) })));
  const other = structuredClone(WORLD); other.substrate = "carpet"; assert.throws(() => compileWorldSystem(design({ world_system: other })), (e) => /differs/.test(e.message) && e.details.differing_keys.join() === "substrate");
  const d = design(); d.world_construction.relationships[0].to = "zz"; assert.throws(() => compileWorldSystem(d), /dangling/);
});
test("WS-5 a zero-freedom rig is a fixed socket frame; any freedom makes it articulated", () => {
  const r = () => ({ joints: [{ id: "root", parent_id: null, rotation_limits_deg: [0, 0], scale_limits: [1, 1] }], pose_states: [{ id: "base" }], view_states: [], state_channels: [], allowed_state_edges: [], constraints: [], sockets: [{ id: "s" }] });
  assert.equal(fixedFrameRigProbe(r()), true);
  for (const mut of [(x) => (x.joints[0].rotation_limits_deg = [-5, 5]), (x) => (x.joints[0].scale_limits = [0.9, 1.1]), (x) => x.joints.push({ id: "j2", parent_id: "root" }), (x) => x.pose_states.push({ id: "p2" }),
    (x) => x.view_states.push({ id: "v" }), (x) => x.state_channels.push({ id: "c" }), (x) => x.allowed_state_edges.push({ from: "a", to: "b" }), (x) => x.constraints.push({ id: "k" }), (x) => (x.joints[0].rotation_limits_deg = [10, 10])]) { const x = r(); mut(x); assert.equal(fixedFrameRigProbe(x), false); }
});
