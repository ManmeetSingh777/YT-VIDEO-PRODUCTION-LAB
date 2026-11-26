#!/usr/bin/env node
// Better One repeatable, deterministic SOURCE packer. This packages text already
// present in the checked-out repository. It does not grant creative approval,
// prove runtime feasibility, read licensed image witnesses or generate art.
import { readFileSync, writeFileSync, realpathSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve, isAbsolute, sep, relative, extname } from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";

const ROOT = realpathSync(fileURLToPath(new URL("../../", import.meta.url)));
const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");
const fail = message => { throw new Error("[SESSION_PACK_ERROR] " + message); };

function arg(name) {
  const i = process.argv.indexOf("--" + name);
  return i >= 0 ? process.argv[i + 1] : null;
}
function safeSource(rel) {
  if (typeof rel !== "string" || !rel || isAbsolute(rel) ||
      rel.split(/[\\/]/).includes("..")) fail("Unsafe source path " + String(rel));
  if (/(^|\/)(\.git|\.env|\.proofws|node_modules)(\/|$)/i.test(rel) ||
      /(^|\/)(assets|private|secrets)(\/|$)/i.test(rel) ||
      /\.(pem|key|p12|pfx)$/i.test(rel) || /REVIEWERS\.json$/i.test(rel)) {
    fail("Private, licensed or non-text path refused: " + rel);
  }
  const abs = realpathSync(resolve(ROOT, rel));
  if (abs !== ROOT && !abs.startsWith(ROOT + sep)) fail("Source escapes repository: " + rel);
  return abs;
}
const manifestPath = arg("manifest");
const outputPath = arg("out");
if (!manifestPath || !outputPath) fail("Usage: node tools/tbo/build_session_pack.mjs --manifest docs/the-better-one/session-packs/E01_CREATIVE.json --out exports/session_packs/E01_CREATIVE.md");
const manifest = JSON.parse(readFileSync(safeSource(manifestPath), "utf8"));
if (manifest.schema_version !== "1.0.0" || !manifest.pack_id || !manifest.episode_id ||
    !manifest.stage || !Array.isArray(manifest.sources) || !manifest.sources.length) fail("Incomplete/invalid manifest v1");
if (manifest.sources.length > 40) fail("Limit is 40 source documents per pack");
const seen = new Set();
const sources = [];
for (const src of manifest.sources) {
  if (!src || typeof src.path !== "string" || typeof src.role !== "string") fail("Invalid source record");
  if (seen.has(src.path)) fail("Duplicate source path: " + src.path);
  seen.add(src.path);
  const abs = safeSource(src.path);
  if (![".md", ".txt", ".json", ".csv", ".yaml", ".yml"].includes(extname(abs).toLowerCase())) fail("Only text sources allowed: " + src.path);
  const bytes = readFileSync(abs);
  if (bytes.length > 1048576) fail("Single source exceeds 1MiB: " + src.path);
  if (bytes.includes(0)) fail("Binary/zero byte in source: " + src.path);
  sources.push({ path:src.path, role:src.role, sha256:sha256(bytes), bytes:bytes.length, content:bytes.toString("utf8") });
}
if (sources.reduce((n,x)=>n+x.bytes,0) > 4194304) fail("Source pack exceeds 4MiB");
const git = spawnSync("git", ["rev-parse","HEAD"], {cwd:ROOT,encoding:"utf8"});
const commit = git.status === 0 && /^[a-f0-9]{40}$/.test(git.stdout.trim()) ? git.stdout.trim() : null;
const header = [
  "# BETTER ONE — REPRODUCIBLE SESSION SOURCE PACK",
  "",
  "Pack ID: " + manifest.pack_id,
  "Episode: " + manifest.episode_id,
  "Stage: " + manifest.stage,
  "Approval status: " + (manifest.approval_status || "NOT_SIGNED"),
  "Source Git HEAD (verify dirty tree separately): " + (commit || "UNKNOWN"),
  "",
  "## Source index (actual SHA-256, not claims of approvals)",
  ...sources.map((s,i)=>String(i+1)+". "+s.path+" | role="+s.role+" | SHA-256="+s.sha256+" | "+s.bytes+" bytes"),
  "",
  "## Operating limitations",
  "This pack copies source text. It does NOT certify source approval, execution feasibility, source media rights, visual quality or clean Git state.",
  "Check the live repository diff, exact runtime schema and latest approved episode state before acting.",
  "Only attached content exists; do not hallucinate absent E01 evidence, full Director packets, images, keys or signed reviews.",
  ""
].join("\n");
let body = header;
for (const [index,s] of sources.entries()) {
  body += "\n---\n\n# SOURCE " + (index+1) + ": " + s.path + "\n\nROLE: " + s.role + "\nSHA256: " + s.sha256 + "\n\n" + s.content + "\n\n# END SOURCE " + (index+1) + "\n";
}
const out = isAbsolute(outputPath) ? outputPath : resolve(ROOT,outputPath);
mkdirSync(dirname(out),{recursive:true});
writeFileSync(out,body,"utf8");
const proof = {schema_version:"1.0.0",pack_id:manifest.pack_id,episode_id:manifest.episode_id,stage:manifest.stage,approval_status:manifest.approval_status||"NOT_SIGNED",git_head:commit,output_sha256:sha256(Buffer.from(body)),sources:sources.map(({content,...rest})=>rest)};
writeFileSync(out+".sources.json",JSON.stringify(proof,null,2)+"\n","utf8");
console.log(JSON.stringify({output:out,proof:out+".sources.json",source_count:sources.length,bytes:Buffer.byteLength(body),sha256:proof.output_sha256},null,2));
