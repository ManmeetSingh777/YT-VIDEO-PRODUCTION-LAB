#!/usr/bin/env node
// AFTER the director signs packet amendment 04 (ecee2867…): accept it, then register the engine vector constructions through the normal intake
// (provenance ENGINE_VECTOR_CONSTRUCTION: refused unless the ACTIVE packet authorizes that exact spec hash and the record re-executes), and
// create their review requests. Approves nothing. Landmarks are the construction's own exact coordinates scaled by its raster scale.
//   node tools/tbo/e01_ingest_constructions.mjs --film films/e01 --out <outbox> [--accept <packet digest>]
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto"; import { execFileSync } from "node:child_process";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const FILM = path.resolve(REPO, arg("film")), OUT = path.resolve(arg("out")), I = await import(url.pathToFileURL(path.join(REPO, "engine/art_bridge/art_intake.mjs")));
const node = (args) => execFileSync(process.execPath, args, { encoding: "utf8", cwd: REPO }).trim().split("\n").pop();
if (arg("accept")) console.log(node([path.join(REPO, "engine/tools/creative_handoff.mjs"), "accept", "--film", FILM, "--packet-digest", arg("accept")]));
const vdir = path.join(OUT, "prepared", "vector"), env = J(path.join(FILM, "environment", "CONSTRUCTED.json")), masterLm = J(path.join(FILM, "registration", "ART_P02.MASTER", "LANDMARK_SIDECAR.json")).landmarks;
const recFor = (spec) => fs.readdirSync(vdir).filter((f) => f.endsWith(".CONSTRUCTION.json")).map((f) => J(path.join(vdir, f))).filter((r) => JSON.stringify(r.spec) === JSON.stringify(spec)).pop();
const side = (name, lm, note) => { const f = path.join(vdir, `${name}.LANDMARKS.json`); fs.writeFileSync(f, JSON.stringify({ landmarks: lm, reviewed_by: note, method: "exact construction coordinates scaled by the raster scale" }, null, 1)); return f; };
const jobs = [];
for (const a of ["ART_P02.body", "ART_TXT01.report_native"]) { const spec = J(path.join(FILM, "vector", `${a}.spec.json`)), rec = recFor(spec), k = spec.scale;
  jobs.push({ asset: a, kind: "part", file: path.join(vdir, `${rec.result_sha256.slice(0, 16)}.png`), lm: side(a, Object.fromEntries(Object.entries(masterLm).map(([n, [x, y]]) => [n, [x * k, y * k]])), "signed ART_P02.MASTER registration landmarks x construction scale") }); }
for (const a of ["ART_ENV01.MASTER", "ART_ENV01.far", "ART_ENV01.mid", "ART_ENV01.counter", "ART_ENV01.counter_occluder"]) { const spec = J(path.join(FILM, "environment", `${a}.spec.json`)), k = spec.scale;
  jobs.push({ asset: a, kind: a.endsWith(".MASTER") ? "master" : "part", file: env[a].file, lm: side(a, Object.fromEntries(Object.entries(spec.landmarks).map(([n, [x, y]]) => [n, [x * k, y * k]])), "constructed geometry (exact) x construction scale") }); }
const res = [];
const fsha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex"), docNow = () => J(path.join(FILM, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"));
const V = await import(url.pathToFileURL(path.join(REPO, "engine/art_bridge/vector_construct.mjs"))), sha = (x) => crypto.createHash("sha256").update(x).digest("hex");
const ONLY = arg("only") ? arg("only").split(",") : null; for (const j of jobs.filter((x) => !ONLY || ONLY.includes(x.asset))) { const spec = J(path.join(FILM, /^ART_ENV01/.test(j.asset) ? "environment" : "vector", `${j.asset}.spec.json`)), lineage = { kind: "vector", spec: sha(JSON.stringify(spec)), svg: sha(V.svgFor(spec)) };
  if (I.intakeUnchanged({ film: FILM, asset: j.asset, file: j.file, landmarks: j.lm, lineage })) { res.push({ asset: j.asset, outcome: "UNCHANGED (bytes + landmarks + construction spec identical; not re-registered, approval untouched)" }); continue; } // complete-fingerprint idempotence
  try { const r = j.kind === "master" ? await I.ingestMaster({ film: FILM, asset: j.asset, file: j.file, landmarks: j.lm, provenance: "ENGINE_VECTOR_CONSTRUCTION", outbox: OUT }) : await I.ingestPart({ film: FILM, asset: j.asset, file: j.file, landmarks: j.lm, provenance: "ENGINE_VECTOR_CONSTRUCTION", outbox: OUT });
    let request = null; if (r.status === "REGISTERED_PENDING_REVIEW") { const id = j.kind === "master" ? J(path.join(FILM, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")).identities.find((i) => i.canonical_asset_id === j.asset).id : j.asset; request = JSON.parse(node([path.join(REPO, "engine/tools/review_sign.mjs"), "request", "--film", FILM, "--scope", j.kind, "--id", id])).request_id; }
    res.push({ asset: j.asset, outcome: r.status, request, failures: r.failures?.map((f) => f.human_readable_reason) || null }); }
  catch (e) { res.push({ asset: j.asset, outcome: "REFUSED", code: e.code || null, reason: e.human_readable_reason || e.message }); } }
console.log(JSON.stringify(res, null, 1)); if (res.some((r) => /REFUSED|REJECTED/.test(r.outcome))) process.exitCode = 1; // a refused registration FAILS the operation for dependency-aware callers
