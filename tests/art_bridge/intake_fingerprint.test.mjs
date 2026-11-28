// IF-1: the intake fingerprint covers bytes, landmarks and lineage (construction/preparation), never the packet digest: identical inputs →
// unchanged; any changed landmark or construction spec → changed.
import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import { intakeFingerprint, lineageKey } from "../../engine/art_bridge/art_intake.mjs";
test("IF-1 complete intake fingerprint", () => { const d = fs.mkdtempSync(path.join(os.tmpdir(), "if1-")), f = path.join(d, "a.png"), l1 = path.join(d, "l1.json"), l2 = path.join(d, "l2.json");
  fs.writeFileSync(f, "bytes"); fs.writeFileSync(l1, JSON.stringify({ landmarks: { b: [1, 2], a: [3, 4] } })); fs.writeFileSync(l2, JSON.stringify({ landmarks: { a: [3, 4], b: [1, 2.5] } }));
  const v = { vector_construction: { spec_sha256: "s1", svg_sha256: "g1" }, packet_sha256: "P1" }, v2 = { ...v, packet_sha256: "P2" };
  assert.deepEqual(intakeFingerprint({ file: f, landmarks: l1, lineage: v }), intakeFingerprint({ file: f, landmarks: l1, lineage: v2 })); // packet change alone: unchanged
  assert.deepEqual(lineageKey(v), lineageKey({ kind: "vector", spec: "s1", svg: "g1" })); // declared key == intake key
  assert.notEqual(intakeFingerprint({ file: f, landmarks: l1, lineage: v }).landmarks_sha256, intakeFingerprint({ file: f, landmarks: l2, lineage: v }).landmarks_sha256);
  assert.notEqual(intakeFingerprint({ file: f, landmarks: l1, lineage: v }).lineage_sha256, intakeFingerprint({ file: f, landmarks: l1, lineage: { vector_construction: { spec_sha256: "s2", svg_sha256: "g1" } } }).lineage_sha256); });
