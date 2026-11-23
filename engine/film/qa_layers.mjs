// Honest QA proof layers (directive J3; F041, F044, F059, F061, F063). Each layer is computed from its own evidence; a missing proof is never
// PASS by default. TEST_TRUST / diagnostic provenance can only ever produce TEST_PASS; PRODUCTION_PASS needs every layer from real evidence.
export const LAYERS = ["SCHEMA_PASS", "MECHANICAL_DIAGNOSTIC_PASS", "REAL_ART_MOTION_PASS", "UNLIKE_TRANSFER_PASS", "FULL_FILM_REVIEWED"];
export function computeLayers({ schema, mechanical, realArt, unlike, fullFilm, testTrust = false, diagnosticProvenance = false }) {
  const st = { SCHEMA_PASS: schema, MECHANICAL_DIAGNOSTIC_PASS: mechanical, REAL_ART_MOTION_PASS: realArt, UNLIKE_TRANSFER_PASS: unlike, FULL_FILM_REVIEWED: fullFilm };
  const layers = Object.fromEntries(LAYERS.map((k) => [k, st[k] === true ? "PASS" : st[k] === false ? "FAIL" : "NOT_EVALUATED"]));
  const all = LAYERS.every((k) => layers[k] === "PASS"), failing = LAYERS.filter((k) => layers[k] !== "PASS");
  const verdict = !all ? "FAIL" : testTrust || diagnosticProvenance ? "TEST_PASS" : "PRODUCTION_PASS";
  return { layers, verdict, failing_layers: failing, note: verdict === "TEST_PASS" ? "every layer passed on diagnostic/test-trusted evidence: never production" : null };
}
