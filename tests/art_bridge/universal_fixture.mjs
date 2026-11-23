// Shared DIAGNOSTIC fixture for the universal-contract suites: a temp copy of the proposed film with TEST_TRUST receipts (labelled; never
// production). Nothing here is art. The story contract written here is a diagnostic stand-in so the approval machinery can be exercised.
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const here = path.dirname(url.fileURLToPath(import.meta.url)), REPO = path.resolve(here, "..", "..");
export const W = path.join(REPO, "hybrid_v2", "work", "universal");
export const STUB_PNG = path.join(REPO, "tests", "art_bridge", "fixtures", "diag2", "hand_palm.png");
const STUB_HEAD = fs.readFileSync(path.join(REPO, "tests", "art_bridge", "fixtures", "diag2", "hand_palm.png")), STUB_SIZE = `${STUB_HEAD.readUInt32BE(16)}x${STUB_HEAD.readUInt32BE(20)}`;
// the requested size is part of every job generation: the fixture EXPORTS at the size its stub returns (an operator configures size before export)
process.env.IMAGE_PROVIDER_SIZE = STUB_SIZE;
export const stubEnv = (url) => ({ IMAGE_PROVIDER_SIZE: STUB_SIZE, IMAGE_PROVIDER: "openai-images", IMAGE_PROVIDER_MODEL: "stub", OPENAI_API_KEY: "test-key-not-real", OPENAI_BASE_URL: url, IMAGE_PROVIDER_CAPS: JSON.stringify({ generate: true, edit: true, transparentRaster: true, multipleReferences: true }) });
export const TT = { method: "TEST_TRUST", note: "DIAGNOSTIC fixture approval (ART_BRIDGE_TEST_TRUST=1); never production" };

export function tempFilm(tag) {
  const d = path.join(W, tag, "film"); fs.rmSync(path.join(W, tag), { recursive: true, force: true });
  fs.cpSync(path.join(REPO, "films", "hv2_film001"), d, { recursive: true, filter: (s) => !s.includes(`${path.sep}qa${path.sep}`) && !s.includes(`${path.sep}reviews${path.sep}`) && !s.includes(`${path.sep}approvals${path.sep}`) && !s.endsWith(".APPROVAL_POINTER.json") });
  fs.writeFileSync(path.join(d, ".diagnostic_namespace"), "DIAGNOSTIC fixture film: test-trusted receipts are valid only here (F087)\n");
  fs.mkdirSync(path.join(d, "story"), { recursive: true });
  fs.writeFileSync(path.join(d, "story", "STORY_CONTRACT.json"), JSON.stringify({ provenance: "DIAGNOSTIC_FIXTURE", note: "stand-in for the approval machinery only; not a fact-checked story", claims: [] }, null, 1));
  return d;
}
/** approve story, direction and the given designs with TEST_TRUST receipts (diagnostic only) */
export async function approveAll(film, assets = ["ines_master"]) {
  const C = await import("../../engine/art_bridge/art_contract.mjs"), I = await import("../../engine/art_bridge/art_intake.mjs");
  await C.approveScope({ film, scope: "story", reviewer: "fixture-reviewer", verdict: "APPROVED", attestation: TT });
  await C.approveScope({ film, scope: "direction", reviewer: "fixture-reviewer", verdict: "APPROVED", attestation: TT });
  const { jobs } = await I.planJobs({ film }); const doc = JSON.parse(fs.readFileSync(path.join(film, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"), "utf8"));
  for (const a of assets) await C.approveDesign({ film, doc, job: jobs.find((j) => j.root_dependency === a), reviewer: "fixture-art-director", verdict: "APPROVED", attestation: TT });
  return jobs;
}
