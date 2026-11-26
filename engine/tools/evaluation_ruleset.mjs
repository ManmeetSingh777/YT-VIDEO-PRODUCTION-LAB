#!/usr/bin/env node
// Ruleset version CLI for the art-gate checking rules (engine/art_bridge/evaluation_identity.mjs).
//   show                                  current version, current rule-source sha, lock status
//   bump --version V --reason TEXT [--amend]  record the CURRENT rule-defining sources as version V (append-only; --amend re-records the
//                                         current version only while it is an unfrozen working-tree version)
//   record-git --rev SHA --version V --reason TEXT   record the rule-source sha of a historical commit (lineage only; does not change current)
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto"; import { execFileSync } from "node:child_process";
import { LOCK_FILE, RULE_SOURCES, ruleSourceSha, rulesetVersion } from "../art_bridge/evaluation_identity.mjs";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const a = process.argv.slice(2), cmd = a[0], opt = (k) => { const i = a.indexOf(`--${k}`); return i >= 0 ? a[i + 1] : null; };
const lock = fs.existsSync(LOCK_FILE) ? JSON.parse(fs.readFileSync(LOCK_FILE, "utf8")) : { schema_version: "1.0.0", rule_sources: RULE_SOURCES, current: null, versions: [] };
const save = () => fs.writeFileSync(LOCK_FILE, JSON.stringify(lock, null, 1) + "\n");
if (cmd === "show") { let st; try { st = { ok: true, version: rulesetVersion() }; } catch (e) { st = { ok: false, code: e.code, reason: e.human_readable_reason }; } console.log(JSON.stringify({ current: lock.current, rule_source_sha256: ruleSourceSha(), status: st }, null, 1)); }
else if (cmd === "bump") { const v = opt("version"), reason = opt("reason"); if (!v || !reason) throw new Error("bump needs --version and --reason");
  const ex = lock.versions.find((x) => x.version === v);
  if (ex && !(a.includes("--amend") && lock.current === v && ex.source === "WORKING_TREE" && !ex.frozen_at_commit)) throw new Error(`version ${v} already exists (append-only; --amend only re-records the current, not-yet-frozen working-tree version)`);
  if (ex) Object.assign(ex, { rule_source_sha256: ruleSourceSha(), reason }); else lock.versions.push({ version: v, rule_source_sha256: ruleSourceSha(), reason, source: "WORKING_TREE" }); lock.current = v; save(); console.log(`ruleset ${v} recorded`); }
else if (cmd === "record-git") { const rev = opt("rev"), v = opt("version"), reason = opt("reason"); if (!rev || !v || !reason) throw new Error("record-git needs --rev --version --reason");
  const h = sha(JSON.stringify(RULE_SOURCES.map((f) => { try { return [f, sha(execFileSync("git", ["-C", REPO, "show", `${rev}:${f}`]))]; } catch { return [f, null]; } })));
  if (lock.versions.some((x) => x.version === v)) throw new Error(`version ${v} already exists`); lock.versions.push({ version: v, rule_source_sha256: h, reason, source: `git:${rev}` }); save(); console.log(`ruleset ${v} = ${h} (lineage)`); }
else { console.error("usage: evaluation_ruleset.mjs show | bump --version V --reason T | record-git --rev SHA --version V --reason T"); process.exit(2); }
