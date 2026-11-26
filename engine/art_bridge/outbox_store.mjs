// Immutable, content-addressed outbox (directive E3 / F048). Every job record and compiled request lives at
// jobs/<jobId>/<dependencyDigest>/ and compiled/<jobId>/<dependencyDigest>/; nothing is ever deleted or overwritten. A generation is written
// into a temporary directory and renamed into place only when complete; CURRENT.json is rewritten atomically AFTER all records are verified.
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { err } from "./errors.mjs";
const fsha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex");

export const genDir = (out, kind, jobId, digest) => path.join(out, kind, jobId, digest);
/** writeOnce(file, data) — exclusive create; an existing file with DIFFERENT bytes is an immutability violation */
export function writeOnce(file, data) {
  const buf = Buffer.isBuffer(data) ? data : Buffer.from(typeof data === "string" ? data : JSON.stringify(data, null, 1));
  if (fs.existsSync(file)) { if (!fs.readFileSync(file).equals(buf)) throw err("OUTBOX_IMMUTABLE_VIOLATION", { file, reason: "a content-addressed record would be overwritten with different bytes", producer: "engine/art_bridge/outbox_store.mjs#writeOnce" }); return false; }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  try { fs.writeFileSync(file, buf, { flag: "wx" }); return true; }
  catch (e) { if (e.code !== "EEXIST") throw e; // a concurrent writer created it first: identical bytes are idempotent, different bytes are a violation
    if (!fs.readFileSync(file).equals(buf)) throw err("OUTBOX_IMMUTABLE_VIOLATION", { file, reason: "a concurrent writer created this content-addressed record with different bytes", producer: "engine/art_bridge/outbox_store.mjs#writeOnce" }); return false; }
}
/** materialize(finalDir, build) — build(tmpDir) fills a temp dir; renamed to finalDir only if finalDir does not exist (same digest ⇒ idempotent) */
export function materialize(finalDir, build) {
  if (fs.existsSync(path.join(finalDir, ".COMPLETE"))) return { created: false, dir: finalDir };
  if (fs.existsSync(finalDir)) throw err("OUTBOX_IMMUTABLE_VIOLATION", { file: finalDir, reason: "an incomplete generation directory exists; it is kept as evidence and never reused", producer: "engine/art_bridge/outbox_store.mjs#materialize" });
  const tmp = `${finalDir}.tmp-${process.pid}-${crypto.randomBytes(4).toString("hex")}`; fs.mkdirSync(tmp, { recursive: true });
  const result = build(tmp);
  const listing = fs.readdirSync(tmp).sort().map((f) => [f, fs.statSync(path.join(tmp, f)).isFile() ? fsha(path.join(tmp, f)) : "dir"]);
  fs.writeFileSync(path.join(tmp, ".COMPLETE"), JSON.stringify({ files: listing }, null, 1));
  fs.mkdirSync(path.dirname(finalDir), { recursive: true });
  try { fs.renameSync(tmp, finalDir); }
  catch (e) { // a concurrent export completed the same generation first: accept it only if its sealed listing is byte-identical to ours
    if (!fs.existsSync(path.join(finalDir, ".COMPLETE"))) throw e;
    const theirs = fs.readFileSync(path.join(finalDir, ".COMPLETE"), "utf8"), ours = fs.readFileSync(path.join(tmp, ".COMPLETE"), "utf8");
    if (theirs !== ours) throw err("OUTBOX_IMMUTABLE_VIOLATION", { file: finalDir, reason: "a concurrent export sealed this generation with different contents", producer: "engine/art_bridge/outbox_store.mjs#materialize", details: { kept_candidate: tmp } });
    fs.rmSync(tmp, { recursive: true, force: true }); return { created: false, dir: finalDir, result, concurrent: true }; }
  return { created: true, dir: finalDir, result };
}
/** atomic CURRENT pointer update (write temp + rename) */
export function writeCurrent(out, current) { const f = path.join(out, "CURRENT.json"), t = `${f}.tmp-${process.pid}-${crypto.randomBytes(4).toString("hex")}`; fs.writeFileSync(t, JSON.stringify(current, null, 1)); fs.renameSync(t, f); }
export function readCurrent(out, jobId) {
  const f = path.join(out, "CURRENT.json"); if (!fs.existsSync(f)) return null;
  const c = JSON.parse(fs.readFileSync(f, "utf8"))[jobId]; if (!c) return null;
  const jobFile = path.join(genDir(out, "jobs", jobId, c.digest), "job.json"), compiledDir = genDir(out, "compiled", jobId, c.digest);
  return { digest: c.digest, job: { ...JSON.parse(fs.readFileSync(jobFile, "utf8")), ...(c.mutable || {}) }, jobFile, compiledDir: fs.existsSync(path.join(compiledDir, ".COMPLETE")) ? compiledDir : null };
}
/** verifyGeneration(dir) — every file listed in .COMPLETE still has its recorded hash (a tampered compiled request is refused) */
export function verifyGeneration(dir) {
  const c = JSON.parse(fs.readFileSync(path.join(dir, ".COMPLETE"), "utf8")), bad = c.files.filter(([f, h]) => h !== "dir" && (!fs.existsSync(path.join(dir, f)) || fsha(path.join(dir, f)) !== h)).map(([f]) => f);
  return { ok: bad.length === 0, changed: bad };
}
