// DIAGNOSTIC pre-generation audit builder for tests: assembles the ten domain passes from a design's OWN recorded decisions so the gate mechanics can
// be exercised. It is labelled DIAGNOSTIC in every text field; it is not an art review and never written into a production film.
import { DOMAINS, witnessManifestSha } from "../../engine/art_bridge/pregen_audit.mjs";
import { bundleHash } from "../../engine/art_bridge/approvals.mjs";
export const WITNESS_DOMAINS = ["native_grammar_witnesses_originality", "anatomy_proportion_perspective", "color_material_edge_light", "face_expression_hands_identity_views", "world_depth_camera_light"];
export function diagnosticAudit(film, d, witness = Object.values(d.design_grounding || {})[0]?.witness) {
  const md = d.method_decisions, w = (obs) => ({ file: witness, region_px: [0, 0, 64, 64], observation: obs });
  const passes = DOMAINS.map((dom, i) => ({ domain: dom, question: `DIAGNOSTIC ${dom}: what must ${d.job_id} decide about ${dom.replace(/_/g, " ")} before its first image (pass ${i + 1})?`,
    findings: `DIAGNOSTIC finding ${i + 1} for ${d.job_id}: ${md[i % md.length].specific_decision ?? md[i % md.length].method_id} — recorded from the design's own decision, checked against the witness grammar for ${dom}.`,
    decisions: dom === "method_to_construction_mapping" ? md.map((m) => ({ decision: `${m.method_id} → ${m.visible_construction_operation ?? m.specific_decision ?? "construction operation recorded in the design"}`, method_ids: [m.method_id] }))
      : [{ decision: `DIAGNOSTIC decision ${i + 1}: ${md[(i + 3) % md.length].visible_construction_operation ?? md[(i + 3) % md.length].specific_decision} (${dom})`, method_ids: [md[(i + 3) % md.length].method_id], ...(WITNESS_DOMAINS.includes(dom) ? { witness: w(`DIAGNOSTIC observation ${i + 1}: the witness reads through one continuous outline for ${dom}`) } : {}) }],
    ...(dom === "emergent_gap_finder" ? { reopens: ["articulation_occlusion_alternate_art"] } : {}) }));
  return { schema_version: "1.0.0", job_id: d.job_id, design_sha256: bundleHash(d), witness_manifest_sha256: witnessManifestSha(film), operator: "diagnostic-test-fixture", skill_version_verified: "DIAGNOSTIC SKILL.md sha recorded by the operator", passes };
}
