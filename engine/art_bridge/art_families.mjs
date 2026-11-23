// Universal art-family registry (system-correction directive E1). A family selects CONSTRUCTION OPERATIONS and motion obligations;
// it never selects a stock silhouette. Every production ArtJob resolves to exactly one registered family or fails closed with
// UNSUPPORTED_ART_FAMILY — there is no default to CHARACTER and no family-specific bypass.
import { err } from "./errors.mjs";
import { stateIntervals } from "./asset_state.mjs";

// kinds = manifest identity kinds a family may legitimately describe; topics = the subject-specific construction topics a design must
// decide for that family (each answered in `design.construction_topics[topic]` with a concrete operation, never an adjective).
export const FAMILIES = Object.freeze({
  ACTING_HUMAN: { kinds: ["CHARACTER"], topics: ["silhouette_and_gesture", "head_and_face_grammar", "hands_and_contact_shapes", "garment_masses", "state_ancestry"], face: true, articulated: true },
  DISTANT_HUMAN: { kinds: ["CHARACTER"], topics: ["silhouette_and_gesture", "population_grouping", "reduced_feature_grammar"], face: false, articulated: true },
  ANIMAL_OR_ORGANISM: { kinds: ["CHARACTER", "ORGANISM"], topics: ["silhouette_and_gesture", "body_topology", "feature_grammar", "appendage_construction", "surface_material", "state_ancestry"], face: true, articulated: true },
  MACHINE_OR_MECHANISM: { kinds: ["MACHINE"], topics: ["functional_topology", "volume_planes_and_projection", "moving_parts_and_axes", "material_surfaces", "state_ancestry"], face: false, articulated: true },
  PROP: { kinds: ["MACHINE", "PROP"], topics: ["functional_topology", "volume_planes_and_projection", "grip_or_contact_surfaces", "material_surfaces"], face: false, articulated: false },
  INTERIOR_WORLD: { kinds: ["WORLD"], topics: ["world_definition", "projection_grammar", "depth_planes_and_occluders", "detail_budget_by_distance", "light_and_material_owners", "world_life_owners"], face: false, articulated: false },
  EXTERIOR_WORLD: { kinds: ["WORLD"], topics: ["world_definition", "projection_grammar", "depth_planes_and_occluders", "detail_budget_by_distance", "light_and_material_owners", "world_life_owners"], face: false, articulated: false },
  NATURAL_WORLD: { kinds: ["WORLD"], topics: ["world_definition", "projection_grammar", "coverage_substrate_and_plant_systems", "depth_planes_and_occluders", "detail_budget_by_distance", "light_and_material_owners"], face: false, articulated: false },
  DIAGRAM_OR_INFO: { kinds: ["DIAGRAM"], topics: ["representational_grammar", "variable_to_geometry_mapping", "glyph_and_label_parts", "reveal_states", "detail_budget_by_attention"], face: false, articulated: false },
  ABSTRACT_OR_MICRO_WORLD: { kinds: ["WORLD"], topics: ["world_definition", "parent_anatomy_or_coordinate_system", "network_or_population_generator", "depth_planes_and_occluders", "detail_budget_by_distance"], face: false, articulated: false },
  EFFECT_OR_MATERIAL: { kinds: ["EFFECT"], topics: ["physical_optics_owner", "time_bounded_states", "material_geometry"], face: false, articulated: false },
  TRANSITION_OR_CAMERA_PLATE: { kinds: ["TRANSITION", "WORLD"], topics: ["conserved_invariant", "aperture_and_mask_geometry", "overscan_and_correspondence"], face: false, articulated: false },
  TYPOGRAPHY_OR_SYMBOL: { kinds: ["DIAGRAM", "SYMBOL"], topics: ["glyph_construction", "label_attachment", "legibility_at_scale"], face: false, articulated: false },
});

/** resolveFamily(design, identity) → family id, or throws UNSUPPORTED_ART_FAMILY. The design must DECLARE `art_family`; nothing is inferred. */
export function resolveFamily(design, identity, record_id = null) {
  const fam = design?.art_family;
  if (!fam || !FAMILIES[fam]) throw err("UNSUPPORTED_ART_FAMILY", { record_id, reason: `design declares art_family ${JSON.stringify(fam ?? null)}; one of ${Object.keys(FAMILIES).join(", ")} is required (no default)`, producer: "engine/art_bridge/art_families.mjs#resolveFamily", failed_invariant: "every production ArtJob resolves to one registered art family", repair_owner: "SOURCE_TO_ART_COMPILER", resume_at: "ART_DESIGN_COMPILATION", required_art_or_operation: ["declare art_family in the design"] });
  if (identity && !FAMILIES[fam].kinds.includes(identity.kind)) throw err("UNSUPPORTED_ART_FAMILY", { record_id, reason: `art_family ${fam} cannot describe identity kind ${identity.kind} (allowed kinds ${FAMILIES[fam].kinds.join("/")})`, producer: "engine/art_bridge/art_families.mjs#resolveFamily", failed_invariant: "family is compatible with the identity's semantic kind", repair_owner: "SOURCE_TO_ART_COMPILER", resume_at: "ART_DESIGN_COMPILATION" });
  return fam;
}

/** subjectFacts — the facts applicability predicates run over: from the manifest/plan (motion/story side) + the design's declared subject profile
 *  (artistic topology the art director decides). Nothing here is a coordinate. */
export function subjectFacts({ design, job, doc, plan }) {
  const identity = doc.identities.find((i) => i.id === job.identity_id) || null, family = resolveFamily(design, identity, job.artjob_id), F = FAMILIES[family];
  const rigs = doc.rigs.filter((r) => r.identity_id === job.identity_id), rigIds = new Set(rigs.map((r) => r.id));
  const iv = stateIntervals(doc).filter((x) => rigIds.has(x.rig)), states = new Set(), views = new Set(), contacts = [];
  for (const x of iv) { if (x.pose) states.add(x.pose); if (x.facing) views.add(x.facing); for (const c of x.contacts) if (c.source_rig && rigIds.has(c.source_rig)) contacts.push(c.contact_type); }
  for (const r of rigs) for (const s of [...r.pose_states, ...r.view_states]) states.add(s.id);
  const acts = doc.actions.filter((a) => a.actors.some((x) => rigIds.has(x.rig_id)) || (a.required_assets || []).some((id) => id === job.root_dependency) || a.targets?.some?.((t) => t === job.identity_id));
  const shots = new Set([...acts.map((a) => a.shot_id), ...(identity?.required_shot_ids || []), ...(job.motion_context?.shots || [])]);
  const world = (doc.worlds || []).find((w) => w.id === identity?.world_id || w.identity_id === identity?.id || w.canonical_asset_id === job.root_dependency) || null;
  const transitions = (doc.transitions || []).filter((t) => shots.has(t.from_shot) || shots.has(t.to_shot));
  const parts = (plan?.assets || []).filter((p) => p.derived_from === job.root_dependency);
  const prof = design?.subject_profile || {};
  return { family, identity_kind: identity?.kind ?? null, has_face: !!(F.face && prof.face_visible !== false), human: ["ACTING_HUMAN", "DISTANT_HUMAN"].includes(family), organism: family === "ANIMAL_OR_ORGANISM",
    world: /_WORLD$/.test(family), diagram: family === "DIAGRAM_OR_INFO", typography: family === "TYPOGRAPHY_OR_SYMBOL", machine: family === "MACHINE_OR_MECHANISM" || !!prof.mechanism, prop: family === "PROP", effect: family === "EFFECT_OR_MATERIAL", transition_plate: family === "TRANSITION_OR_CAMERA_PLATE",
    articulated: F.articulated, rigs: rigs.map((r) => r.id), joints: rigs.flatMap((r) => r.joints.map((j) => j.id)), sockets: rigs.flatMap((r) => r.sockets.map((s) => s.id)), states: [...states], views: [...views], contacts: [...new Set(contacts)],
    motion: acts.length > 0 || rigs.length > 0, causal: acts.some((a) => (a.causal_effects || []).length) || family === "DIAGRAM_OR_INFO", shots: [...shots], transitions: transitions.length > 0 || family === "TRANSITION_OR_CAMERA_PLATE",
    camera_moves: !!world?.camera_moves || !!job.motion_context?.camera_footprint, depth_planes: world?.depth_bands?.length || world?.planes?.length || (prof.depth_planes ?? 0), overscan: !!world?.overscan_rect,
    parts: parts.length > 0, alpha: job.motion_context?.alpha_requirement || null,
    // artistic topology declared by the design (reviewed by the art director; cross-checked where the manifest knows the answer)
    built: !!prof.built_elements || ["INTERIOR_WORLD", "EXTERIOR_WORLD"].includes(family), natural: !!prof.natural_elements || family === "NATURAL_WORLD", micro: !!prof.micro_biology || (family === "ABSTRACT_OR_MICRO_WORLD" && prof.micro_biology !== false),
    optical_materials: !!prof.optical_materials, luminous_volume: !!prof.luminous_volume, portal: !!prof.portal || transitions.some((t) => /PORTAL|APERTURE/i.test(t.kind || t.type || "")), time_of_day: !!prof.time_of_day_states, perception: !!prof.perception_effects,
    population: !!prof.population, scientific_interaction: !!prof.scientific_interaction, map: !!prof.map, schematic: !!prof.schematic || family === "DIAGRAM_OR_INFO", era_specific: !!prof.era_specific, comparison: !!prof.parallel_states,
    repeats: !!prof.repeats, labels: !!prof.labels || family === "TYPOGRAPHY_OR_SYMBOL", macro_lens: !!prof.macro_lens, cosmic: !!prof.cosmic, effects: !!prof.effects || family === "EFFECT_OR_MATERIAL", nested_world: !!prof.nested_world,
    topics: F.topics };
}
