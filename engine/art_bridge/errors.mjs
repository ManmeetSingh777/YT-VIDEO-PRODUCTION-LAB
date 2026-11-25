// Structured bridge errors (spec §3.6). An error NEVER triggers visual improvisation; it names the dependency and the producer to resume.
export const CODES = Object.freeze([
  "MISSING_ART_ASSET", "MISSING_CANONICAL_MASTER", "UNAPPROVED_ART", "IMAGE_DIMENSION_MISMATCH", "ALPHA_INVALID", "ART_IDENTITY_DRIFT",
  "UNREGISTERED_PIVOT", "INVALID_RIG_DAG", "DUPLICATE_ELEMENT_ID", "INVALID_TRANSFORM_OWNER", "MISSING_UNDERPAINT", "OCCLUSION_CONFLICT",
  "UNSUPPORTED_VIEW", "UNSUPPORTED_STATE_EDGE", "INVALID_MORPH_TOPOLOGY", "UNREACHABLE_IK", "CONTACT_DRIFT", "FOOT_SLIDE",
  "OUTSIDE_CAMERA_FOOTPRINT", "MISSING_TRANSITION_STATE", "MISSING_WORD_ALIGNMENT", "UNQUALIFIED_STYLE_ASSET", "METHOD_NO_REAL_CONSUMER",
  "UNDETERMINISTIC_FRAME", "RENDER_CAPTURE_FAILURE", "ART_CONTRACT_REFUSED",
  // additional codes (spec says "at minimum"): schema/path/hash/coverage integrity
  "SCHEMA_VIOLATION", "ASSET_PATH_INVALID", "ASSET_HASH_MISMATCH", "SHOT_COVERAGE_GAP", "STATIC_PLATE_NOT_RIG", "UNKNOWN_REFERENCE",
  "UNSUPPORTED_MOTION_CLASS", "INVALID_FRAME_RANGE", "DEGENERATE_IK", "JOINT_LIMIT_EXCEEDED", "INVALID_IK_INPUT", "UNAPPROVED_BEND_BRANCH",
  // system-correction directive (C1-C7): universal fail-closed contracts and producers
  "ART_CONTRACT_NOT_EVALUATED", "UNSUPPORTED_ART_FAMILY", "ART_DESIGN_UNSPECIFIED", "STORY_APPROVAL_REQUIRED", "DIRECTION_APPROVAL_REQUIRED",
  "DESIGN_APPROVAL_REQUIRED", "STALE_COMPILED_REQUEST", "TEST_TRUST_FORBIDDEN", "PROVIDER_NOT_AUTHORIZED", "REQUEST_BUDGET_EXCEEDED",
  "STAGE_PREDECESSOR_MISSING", "WITNESS_REGION_INVALID", "WITNESS_OBSERVATION_UNCONFIRMED", "FACT_CHECK_REQUIRED", "MECHANISM_CONTRADICTION",
  "UNCOMPILED_SEMANTIC_ACTION", "ORPHAN_ACTION", "CONTACT_CONFLICT", "POSSESSION_TELEPORT", "OBSTACLE_UNRESOLVED", "CONTINUITY_BREAK",
  "DIRECTION_DECISION_INERT", "NARRATION_NOT_MEASURED", "STALE_DEPENDENCY", "CONTACT_ORIENTATION_UNSATISFIABLE", "FOOT_SUPPORT_UNSATISFIABLE",
  "ART_STATE_REQUIRED", "CONTACT_PATCH_MISS", "INVALID_DEFORM_MAP", "SHADOW_RELATION_MISSING", "FRAME_TILING_GAP", "RENDER_RECEIPT_INVALID",
  "REPAIR_RULE_CONFLICT", "QA_LAYER_FAILED", "OUTBOX_IMMUTABLE_VIOLATION", "INTERFACE_UNFITTED", "METHOD_DECISION_INERT",
  // P02 directive (F073-F092)
  "STATE_CHANNEL_CONFLICT", "ACTING_UNEXECUTABLE", "PHRASE_UNEXECUTABLE", "DEFORM_RENDER_FAILURE", "GRIP_MORPHOLOGY_FAILED", "BALANCE_FAILED", "REACTION_UNSATISFIABLE", "INERT_ACTION_OWNER", "AUDIO_SYNC_MISMATCH", "AUDIO_MIX_FAILED",
  "PROVENANCE_COUNTERFEIT", "INERT_CONTROL", "FROZEN_FRAME", "INERT_ACTION_INTERVAL", "COVERAGE_GAP", "RUN_NOT_AUTHORIZED", "LEDGER_CHAIN_BROKEN", "EXTERNAL_OUTCOME_UNKNOWN", "CAPABILITY_UNVERIFIED", "LEASE_LOST",
  // P04 universal pipeline closure
  "STATE_CONFLICT", "ACTING_INVALID", "PLAN_AMBIGUOUS", "PLAN_MISSING", "EMPTY_STAGE_OBLIGATION", "FRAME_EVALUATION_FAILED", "FEASIBILITY_NOT_EVALUATED", "UNSUPPORTED_SEMANTIC_ACTION", "GRIP_CONTRACT_MISSING", "IR_ARROW_MISSING", "DEFORM_APPROVAL_MISSING", "PREFLIGHT_MUTATION", "AUDIO_STREAM_MISSING", "CUE_STEM_MISMATCH", "STORY_HANDOFF_INVALID", "SEMANTIC_CONSEQUENCE_UNMET", "SUBJECT_CROPPED", "RENDER_SCALE_EXCEEDED",
  // P05 creative packet integration
  "UNIMPLEMENTABLE_CREATIVE_REQUIREMENT", "MOTION_OBLIGATION_UNMET", "ORPHAN_MOTION_TRACK", "GEOMETRY_UNMEASURED", "AUDIO_INPUT_MISSING", "ART_JOB_INPUT_MISSING", "SHADOW_DISCONTINUOUS", "TRANSITION_GEOMETRY_INVALID",
  // Better One first film: model-driven decoder, Blender host passes, production quality-gate registry
  "DECODER_MODEL_INVALID", "MODEL_CONSTRAINT_VIOLATED", "DECODER_INERT_OR_MISLEADING", "HOST_3D_ASSET_PENDING", "HOST_INTEGRATION_INVALID", "QUALITY_GATE_UNPROVEN",
  // P06 reusable performance commands
  "PERFORMANCE_COMMAND_INVALID", "PERFORMANCE_CAPABILITY_MISSING", "PERFORMANCE_PROFILE_INVALID", "PERFORMANCE_EFFECT_UNMET",
]);
/** directive N2: every refusal carries the same machine-readable fields (producer, invariant, owner, resume point, revisions, evidence) */
const N2 = ["producer", "failed_invariant", "dependency_ids", "required_art_or_operation", "repair_owner", "resume_at", "input_revision_hashes", "diagnostic_evidence", "severity", "frame_ranges"];
export class BridgeError extends Error {
  constructor(code, { file = null, record_id = null, shot_id = null, frame_range = null, dependency = null, suggested_producer = null, reason = "", details = undefined, ...rest } = {}) {
    if (!CODES.includes(code)) throw new Error(`BridgeError: unknown code ${code}`);
    super(`${code}${record_id ? ` [${record_id}]` : ""}: ${reason}`);
    Object.assign(this, { code, file, record_id, shot_id, frame_range, dependency, suggested_producer, human_readable_reason: reason, details });
    for (const k of N2) this[k] = rest[k] ?? (k === "severity" ? "BLOCKING" : k === "frame_ranges" ? (frame_range ? [frame_range] : []) : ["dependency_ids", "required_art_or_operation", "diagnostic_evidence"].includes(k) ? (k === "dependency_ids" && dependency ? [dependency] : []) : k === "input_revision_hashes" ? {} : null);
  }
  toJSON() { const { code, file, record_id, shot_id, frame_range, dependency, suggested_producer, human_readable_reason, details } = this; return { code, file, record_id, shot_id, frame_range, dependency, suggested_producer, human_readable_reason, ...Object.fromEntries(N2.map((k) => [k, this[k]])), ...(details !== undefined ? { details } : {}) }; }
}
export const err = (code, o) => new BridgeError(code, o);
