// Directive I5/I6 — M12 coherent action phrase (synchronized owners, conditional phases) + unlike phrase in a different world; isolated
// single-owner motion refused; M13 seeded per-frame state: random seek == sequential replay; F069 shutter samples are a compositor consumer.
import test from "node:test"; import assert from "node:assert/strict";
const P = await import("../../engine/art_bridge/motion_systems.mjs");
const phrase = (owners, phases) => P.compilePhrase({ id: "ph", start_frame: 1000, phases, owners });

test("M12 one phrase drives body, prop, face, camera and sound on shared integer frames with overlap; isolated motion is refused", () => {
  const phases = [{ phase: "ATTENTION", frames: 18 }, { phase: "ANTICIPATION", frames: 10 }, { phase: "CONTACT", frames: 6 }, { phase: "ACTION", frames: 24 }, { phase: "CONSEQUENCE", frames: 20 }, { phase: "FOLLOW_THROUGH", frames: 12 }, { phase: "SETTLE", frames: 16 }];
  const r = phrase([{ id: "arm", kind: "ACTOR", values: { ATTENTION: 0, ANTICIPATION: -8, CONTACT: 30, ACTION: 75, SETTLE: 60 } }, { id: "door", kind: "PROP", offset_frames: 2, values: { CONTACT: 0, ACTION: 80, CONSEQUENCE: 95, SETTLE: 90 } },
    { id: "gaze", kind: "FACE", offset_frames: -4, values: { ATTENTION: "handle", ACTION: "door", CONSEQUENCE: "drum" } }, { id: "cam", kind: "CAMERA", offset_frames: 6, values: { ACTION: 1.0, CONSEQUENCE: 1.08 } }, { id: "clunk", kind: "SOUND", values: { CONSEQUENCE: "latch_open" } }], phases);
  assert.ok(r.ok, JSON.stringify(r.failures)); assert.equal(r.end_frame, 1000 + 106); assert.ok(r.simultaneity.owner_kinds.length >= 4 && r.simultaneity.phases_with_overlap >= 3);
  assert.equal(r.tracks.clunk.keys[0][0], r.phase_bounds.find((b) => b.phase === "CONSEQUENCE").frames[0], "sound lands on the consequence frame");
  const lone = phrase([{ id: "arm", kind: "ACTOR", values: { ACTION: 1, CONSEQUENCE: 2 } }], [{ phase: "ACTION", frames: 10 }, { phase: "CONSEQUENCE", frames: 10 }]); assert.ok(lone.failures.some((x) => x.code === "DIRECTION_DECISION_INERT"));
  assert.ok(phrase([{ id: "a", kind: "ACTOR", values: {} }, { id: "b", kind: "PROP", values: {} }], [{ phase: "ACTION", frames: 4 }, { phase: "ATTENTION", frames: 4 }]).failures.some((x) => x.code === "SCHEMA_VIOLATION"));
  // unlike phrase: an organism releasing a shell underwater — same scheduler, different owners and world consequence
  const u = phrase([{ id: "arm3", kind: "ACTOR", values: { PREPARATION: 0, ACTION: 1, FOLLOW_THROUGH: 0.4 } }, { id: "shell", kind: "PROP", values: { ACTION: "released", CONSEQUENCE: "sinks" } }, { id: "silt", kind: "WORLD", offset_frames: 3, values: { CONSEQUENCE: "plume" } }], [{ phase: "PREPARATION", frames: 12 }, { phase: "ACTION", frames: 8 }, { phase: "CONSEQUENCE", frames: 30 }, { phase: "FOLLOW_THROUGH", frames: 14 }]);
  assert.ok(u.ok, JSON.stringify(u.failures));
});

test("M13 seeded particle/phase state is a pure function of (seed, frame): random seek equals sequential replay; shutter samples are deterministic", () => {
  const seq = []; for (let f = 0; f < 240; f++) seq.push(JSON.stringify(P.seededParticles(1234, f)));
  for (const f of [0, 1, 59, 60, 119, 120, 239]) assert.equal(JSON.stringify(P.seededParticles(1234, f)), seq[f]);
  assert.notEqual(JSON.stringify(P.seededParticles(1235, 10)), seq[10], "seed is an input");
  const motion = (t) => [t * 12, 0], s = P.shutterSamples(motion, 100, { shutter: 0.5, samples: 4 }); assert.deepEqual(s.map((p) => p[0]), [1200.75, 1202.25, 1203.75, 1205.25]);
});
