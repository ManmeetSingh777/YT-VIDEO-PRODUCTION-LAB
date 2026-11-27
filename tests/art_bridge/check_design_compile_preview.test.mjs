// check-design PASS must mean "this design compiles into a deliverable request": the gate result is followed by the real skill compile and
// stage planner in a throwaway folder (nothing is sent). A design whose identity header + footer + largest method block exceeds the provider
// prompt limit is REFUSED here, before a human signs it, with the exact numbers — never at export after approval.
import { test } from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import url from "node:url"; import { spawnSync } from "node:child_process";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), J = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
const { diagnosticAudit } = await import("../tbo/pregen_audit_fixture.mjs");
const check = (F) => { const r = spawnSync(process.execPath, [path.join(REPO, "engine/tools/art_outbox.mjs"), "check-design", "--film", F, "--asset", "ines_master"], { encoding: "utf8" }); return { code: r.status, out: JSON.parse(r.stdout) }; };
test("CDP-1 a passing design reports its compiled stages; the same design made over-long is refused before signing", () => {
  const F = fs.mkdtempSync(path.join(os.tmpdir(), "cdp-")); fs.cpSync(path.join(REPO, "films", "hv2_film001"), F, { recursive: true });
  try {
    const dF = path.join(F, "art_designs", "ines_master.design.json"), aF = path.join(F, "art_designs", "ines_master.pregen_audit.json");
    const d = J(dF); fs.writeFileSync(aF, JSON.stringify(diagnosticAudit(F, d), null, 1));
    const ok = check(F); assert.equal(ok.code, 0, JSON.stringify(ok.out.failures)); assert.equal(ok.out.compile_preview.status, "COMPILED"); assert.ok(ok.out.compile_preview.stages.length >= 1);
    for (const s of ok.out.compile_preview.stages) assert.ok(s.characters <= 32000);
    const big = { ...d, motion_requirements: { ...(d.motion_requirements || {}), note: "x".repeat(40000) } }; fs.writeFileSync(dF, JSON.stringify(big, null, 1)); fs.writeFileSync(aF, JSON.stringify(diagnosticAudit(F, big), null, 1));
    const no = check(F); assert.equal(no.code, 1); assert.equal(no.out.status, "REFUSED"); assert.equal(no.out.compile_preview.code, "REQUEST_BUDGET_EXCEEDED"); assert.match(no.out.compile_preview.reason, /exceeds the provider limit 32000/);
  } finally { fs.rmSync(F, { recursive: true, force: true }); }
});
