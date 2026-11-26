// P08 F02 — dependency-scoped production: changing ONE mouth state inside one chunk re-renders only that chunk; the others are reused by their
// own unchanged inputs (visible rows of their frames + bytes of the assets they draw + static scene inputs); a tampered stored chunk is never
// reused. Real Chrome renderer through segment_render.renderFilm. DIAGNOSTIC character fixture copy.
import test from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import path from "node:path";
process.env.ART_BRIDGE_TEST_TRUST = "1";
const CF = await import("./character_fixture.mjs"), { renderFilm } = await import("../../engine/film/segment_render.mjs"), { buildFilmRevision } = await import("../../engine/film/film_revision.mjs"), { isolatedWork } = await import("../_lib/isolated_work.mjs");
const { rt } = await CF.film(), W = isolatedWork("p08_f02"), FILM = path.join(W, "film"); fs.cpSync(rt.film, FILM, { recursive: true, filter: (s) => !/[\\/](render|production|qa)([\\/]|$)/.test(s) });
const plan = (state) => ({ ...CF.basePlan(), composition: { schema_version: "1.0.0", primitives: [{ id: "kade_says", kind: "STATE_SWAP", owner: "kade_rig.mouth", frames: [25, 35], inputs: { events: [{ at: 0, state: state }, { at: 9, state: "NEUTRAL_REST" }] }, expected_effect: { kind: "S" } }] } });
const render = async (state) => { const pf = path.join(FILM, "handoff", "MOTION_PLAN.json"); fs.writeFileSync(pf, JSON.stringify(plan(state), null, 1)); return renderFilm({ film: FILM, revision: buildFilmRevision(FILM), renderer: "art_bridge_chrome_frames", rendererArgs: { planFile: pf, runType: "DIAGNOSTIC" }, total: 60, chunkSize: 20, outName: `f02_${state}.mp4` }); };
const chunks = () => JSON.parse(fs.readFileSync(path.join(FILM, "render", "FRAME_MANIFEST.json"), "utf8")).chunks;
test("F02 one mouth state changed inside the middle chunk: only that chunk re-renders; the unaffected chunks are reused by their own inputs; a tampered stored chunk is regenerated", { timeout: 1800000 }, async () => {
  await render("NEUTRAL_AA"); const first = chunks(); assert.equal(first.length, 3); assert.ok(first.every((c) => !c.reused_by_input), "first render: everything rendered");
  await render("NEUTRAL_EE"); const second = chunks(); assert.ok(second[0].reused_by_input && second[2].reused_by_input, "chunks whose frames do not show the changed mouth are reused"); assert.ok(!second[1].reused_by_input, "the chunk that shows the changed mouth is re-rendered");
  assert.notEqual(second[1].chunk_sha256, first[1].chunk_sha256, "its pixels really changed"); assert.equal(second[0].chunk_sha256, first[0].chunk_sha256);
  const store = path.join(FILM, "render", "chunks", "by_input"), victim = fs.readdirSync(store).filter((x) => x.endsWith(".mkv")).map((x) => path.join(store, x)).find((x) => x.includes(second[2].reused_by_input.input_key_sha256)); fs.appendFileSync(victim, Buffer.from([0]));
  for (const d of fs.readdirSync(path.join(FILM, "render", "chunks"))) if (d !== "by_input") fs.rmSync(path.join(FILM, "render", "chunks", d), { recursive: true, force: true }); // only the input-keyed store can supply chunks now
  await render("NEUTRAL_EE"); const third = chunks(); assert.ok(!third[2].reused_by_input, "a stored chunk whose bytes no longer match its receipt is never reused"); assert.ok(third[0].reused_by_input);
});
