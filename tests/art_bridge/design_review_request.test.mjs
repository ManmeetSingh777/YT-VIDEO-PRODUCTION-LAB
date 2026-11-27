// A design review request must put the job's ACTUAL design file and its pre-generation audit in front of the reviewer and hash-bind both.
// Designs are stored by asset id (art_designs/<asset>.design.json) while requests are addressed by ArtJob id; the request previously looked
// for art_designs/<ArtJob id>.design.json, found nothing, and exported files: [] (an empty look_at, no file binding).
import { test } from "node:test"; import assert from "node:assert/strict"; import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
import { exportReviewRequest } from "../../engine/art_bridge/review_requests.mjs"; import { planJobs } from "../../engine/art_bridge/art_intake.mjs";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), sha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");
test("DRQ-1 a design request addressed by ArtJob id binds and shows the asset's design and audit", async () => {
  const F = fs.mkdtempSync(path.join(os.tmpdir(), "drq-")); fs.cpSync(path.join(REPO, "films", "hv2_film001"), F, { recursive: true });
  try {
    const jobs = (await planJobs({ film: F })).jobs, job = jobs.find((j) => j.state_kind === "MASTER" && fs.existsSync(path.join(F, "art_designs", `${j.root_dependency}.design.json`)));
    assert.ok(job, "fixture has a master with a design"); assert.notEqual(job.artjob_id, job.root_dependency);
    const r = await exportReviewRequest({ film: F, scope: "design", id: job.artjob_id }), req = JSON.parse(fs.readFileSync(path.join(r.dir, "REVIEW_REQUEST.json"), "utf8"));
    const rel = `art_designs/${job.root_dependency}.design.json`, got = req.packet.files.find((x) => x.file === rel);
    assert.ok(got, `request binds ${rel}`); assert.equal(got.sha256, sha(path.join(F, rel)));
    assert.ok(fs.existsSync(path.join(r.dir, "look_at", rel.replace(/\//g, "__"))), "reviewer sees the design");
    const audit = rel.replace(/\.design\.json$/, ".pregen_audit.json"), amend = rel.replace(/\.design\.json$/, ".AMENDMENT_RECORD.json");
    assert.equal(req.packet.files.some((x) => x.file === audit), fs.existsSync(path.join(F, audit)), "the audit is bound exactly when it exists");
    assert.equal(req.packet.files.some((x) => x.file === amend), fs.existsSync(path.join(F, amend)), "an amendment record is bound exactly when it exists");
  } finally { fs.rmSync(F, { recursive: true, force: true }); }
});
