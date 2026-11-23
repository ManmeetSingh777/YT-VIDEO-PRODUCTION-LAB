#!/usr/bin/env node
// Human approval exchange (P04 §6.2). This tool prepares requests and verifies answers; it has no signing function and no access to a private key.
//   request --film DIR --scope story|direction|proposal|design|master|part|state|edge|deform|final_film [--id ID]
//   import  --film DIR --signed SIGNED_REVIEW.json [--notes TEXT]
//   ids: part ASSET | master IDENTITY | state RIG::STATE or RIG::CHANNEL.STATE | edge RIG::FROM::TO | deform MAP | design JOB | proposal PROPOSAL_ID
import path from "node:path"; import url from "node:url";
import { exportReviewRequest, importSignedReview } from "../art_bridge/review_requests.mjs";
export async function main(a = process.argv.slice(2), out = console.log) {
  const get = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
  if (a[0] === "request" && get("--film") && get("--scope")) { const r = await exportReviewRequest({ film: get("--film"), scope: get("--scope"), id: get("--id") }); out(JSON.stringify({ request_id: r.request_id, dir: r.dir, status: "AWAITING_INDEPENDENT_HUMAN_APPROVAL" })); return 0; }
  if (a[0] === "import" && get("--film") && get("--signed")) { out(JSON.stringify(await importSignedReview({ film: get("--film"), signed: path.resolve(get("--signed")), notes: get("--notes") || "" }))); return 0; }
  out("usage: review_sign.mjs request --film DIR --scope S [--id ID] | import --film DIR --signed FILE"); return 2;
}
if (process.argv[1] && import.meta.url === url.pathToFileURL(path.resolve(process.argv[1])).href) { try { process.exit(await main()); } catch (e) { console.error(`${e.code || "ERROR"}: ${e.human_readable_reason || e.message}`); process.exit(1); } }
