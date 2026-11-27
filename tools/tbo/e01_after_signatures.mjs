#!/usr/bin/env node
// ONE continuation command after the director's signing session (signed receipts already imported by the signing helper):
// accept packet 04+05 → register the engine vector constructions → extract the background-group bodies/states from their signed masters →
// rebuild the closure ledger → `advance` (releases every newly unblocked dependent and exports what still needs artwork). Approves nothing.
//   node tools/tbo/e01_after_signatures.mjs --film films/e01 --out <outbox> --packet <signed packet digest>
import path from "node:path"; import url from "node:url"; import { execFileSync } from "node:child_process";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const FILM = arg("film"), OUT = arg("out"), PK = arg("packet"), run = (label, args) => { process.stdout.write(`\n== ${label}\n`); try { process.stdout.write(execFileSync(process.execPath, args, { cwd: REPO, encoding: "utf8", maxBuffer: 1 << 28 }).slice(-4000)); } catch (e) { process.stdout.write(`FAILED: ${(e.stdout || "").slice(-2000)}${(e.stderr || e.message).slice(-2000)}\n`); } };
run("constructions (accept packet, register report page/type and restaurant)", ["tools/tbo/e01_ingest_constructions.mjs", "--film", FILM, "--out", OUT, "--accept", PK]);
for (const m of ["ART_BG01.BG_OCCUPANCY.MASTER", "ART_BG02.BG_QUEUE.MASTER"]) {
  run(`segment ${m}`, ["-e", `require("child_process").execFileSync(process.env.PYTHON||"python",["-I","engine/tools/segment_master.py","${FILM}/assets/art/${m}.png","${FILM}/segmentation/${m}.seeds.json","${FILM}/segmentation/${m}"],{stdio:"inherit"})`]);
  run(`extract ${m}`, ["engine/art_bridge/component_extract.mjs", "--film", FILM, "--out", OUT, "--master", m, "--seg", `${FILM}/segmentation/${m}`, "--map", `${FILM}/segmentation/${m}.map.json`]); }
run("closure ledger", ["tools/tbo/e01_closure_ledger.mjs", "--film", FILM, "--program", `${FILM}/artwork_handoff/REQUESTS_V4.json`, "--out", "engineering/e01_production/CLOSURE_LEDGER.json"]);
run("advance", ["engine/tools/art_outbox.mjs", "advance", "--film", FILM, "--out", OUT, "--operator", "e01_director"]);
