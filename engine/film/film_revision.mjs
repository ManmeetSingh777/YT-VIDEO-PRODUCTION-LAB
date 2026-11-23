// FilmRevision (P02 directive F077; F058/F060). A recursive, allowlisted, content-addressed dependency closure of EVERYTHING production-reachable:
// all engine code (art_bridge incl. runtime/bridge_rt.js, story, film, production, tools, runtime nu.js/mn.js/gsap, methods/source), the
// installed F01–F80 skill (SKILL.md, scripts, references), schemas, and the film's authority inputs — manifest, plans, motion plans, direction,
// story contracts, designs, the ACTUAL bytes of every delivered asset (re-hashed, never trusted from the manifest), registration receipts,
// audio/script/alignment, approval pointers + receipts + review history. Scoped digests let consumers go stale only when THEIR scope changes.
// Excluded by rule (documented in REVISION_DEPENDENCIES.json): logs, qa/, render/, production/, compositions, outbox history, generated reports.
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", "..");
const fsha = (f) => crypto.createHash("sha256").update(fs.readFileSync(f)).digest("hex"), sha = (o) => crypto.createHash("sha256").update(JSON.stringify(o)).digest("hex");
function walk(root, keep, skip = () => false) { const out = []; if (!fs.existsSync(root)) return out; (function w(d) { for (const f of fs.readdirSync(d).sort()) { const p = path.join(d, f); if (skip(p)) continue; const s = fs.lstatSync(p); if (s.isSymbolicLink()) continue; if (s.isDirectory()) w(p); else if (keep(p)) out.push(p); } })(root); return out; }
const relR = (p) => path.relative(REPO, p).split(path.sep).join("/");
export const EXCLUDED = ["intake/INTAKE_LOG.jsonl and other *.log/*.jsonl logs (except reviews/HISTORY.jsonl, which carries revocations)", "qa/ (QA outputs bind TO a revision)", "downstream review receipts/history lines of scopes shot_review, unlike_transfer, film (they review a revision; their bundles bind its digest)", "render/ (outputs)", "production/ (the ledger records revisions; hashing it would cycle)", "story/FILM_CONTRACT_REPORT.json (generated report)", "hybrid_v2/art_outbox (request history)", "hybrid_v2/work (scratch)"];
/** code closure: every file the production path can execute or read as authority (recursive) */
export function codeClosure() {
  const files = [...walk(path.join(REPO, "engine"), (p) => /\.(mjs|js|json|py)$/.test(p), (p) => /node_modules|__pycache__/.test(p)), ...walk(path.join(REPO, "schemas"), (p) => p.endsWith(".json")),
    ...["SKILL.md"].map((f) => path.join(REPO, "reference", "construct-kurzgesagt-art", f)).filter((f) => fs.existsSync(f)), ...walk(path.join(REPO, "reference", "construct-kurzgesagt-art", "scripts"), (p) => p.endsWith(".py")), ...walk(path.join(REPO, "reference", "construct-kurzgesagt-art", "references"), () => true)];
  return files.map((f) => [relR(f), fsha(f)]);
}
// P04 §7.8: the code closure is CONTENT-hashed on every call — a file rewritten with the same size and mtime must change the digest. The walk is
// memoised only within one synchronous call chain (a per-call cache keyed by a content digest, never by filesystem timestamps).
let codeCache = null;
function cachedCode() { return codeClosure(); }
/** DOWNSTREAM review scopes review a revision (their bundle binds the revision digest); hashing them INTO the revision would make every such
 *  review stale itself (cycle). Upstream approvals (story, direction, design, identity, asset, state, edge, ...) are inputs and are hashed. */
export const DOWNSTREAM_REVIEW_SCOPES = ["shot_review", "unlike_transfer", "film"];
function upstreamReviews(F) {
  const d = path.join(F, "reviews"); if (!fs.existsSync(d)) return [];
  const down = (scope) => DOWNSTREAM_REVIEW_SCOPES.includes(scope), out = [];
  for (const f of fs.readdirSync(d).sort()) { const p = path.join(d, f);
    if (f.endsWith(".json")) { let sc = null; try { sc = JSON.parse(fs.readFileSync(p, "utf8")).scope; } catch { sc = null; } if (!down(sc)) out.push([f, fsha(p)]); }
    else if (f.endsWith("HISTORY.jsonl")) { const up = fs.readFileSync(p, "utf8").split("\n").filter((l) => { if (!l.trim()) return false; try { return !down(JSON.parse(l).scope); } catch { return true; } }); if (up.length) out.push([f, sha(up.join("\n"))]); } }
  return out;
}
export function buildFilmRevision(FILM, { manifest = "handoff/ART_AND_MOTION_MANIFEST_V2.json" } = {}) {
  const F = path.resolve(FILM), doc = JSON.parse(fs.readFileSync(path.join(F, manifest), "utf8")), opt = (rel) => (fs.existsSync(path.join(F, rel)) ? fsha(path.join(F, rel)) : null), integrity = [];
  const dir = (rel, keep = () => true) => walk(path.join(F, rel), keep).map((f) => [path.relative(F, f).split(path.sep).join("/"), fsha(f)]);
  const assets = Object.fromEntries((doc.assets || []).map((a) => { const f = path.join(F, a.file); if (!fs.existsSync(f)) { integrity.push({ asset: a.id, problem: "file missing" }); return [a.id, { declared: a.sha256, actual: null }]; } const actual = fsha(f); if (actual !== a.sha256) integrity.push({ asset: a.id, problem: "bytes differ from the manifest hash" }); return [a.id, { declared: a.sha256, actual }]; }));
  const scopes = {
    code: sha(cachedCode()),
    story: sha({ intent: opt("story/FILM_INTENT.json"), contract: opt("story/STORY_CONTRACT.json"), semantic_actions: opt("story/SEMANTIC_ACTIONS.json"), proposal: opt("direction/EXPERIENCE_DIRECTOR_PROPOSAL.md") }),
    direction: sha({ shot_score: opt("direction/SHOT_SCORE_60FPS.json"), action_coverage: opt("story/ACTION_COVERAGE.json"), phrases: opt("story/ACTION_PHRASES.json"), beats: opt("story/BEAT_MEDIA.json") }),
    contracts: sha({ manifest: opt(manifest), dependency_plan: opt("handoff/ART_DEPENDENCY_PLAN.json"), motion_plans: dir("handoff", (p) => /MOTION_PLAN.*\.json$/.test(p)) }),
    designs: sha(dir("art_designs", (p) => p.endsWith(".design.json"))),
    art: sha(assets), registration: sha(dir("registration", (p) => p.endsWith(".json"))),
    audio: sha(["narration_file", "narration_timeline_file", "script_file", "word_alignment_file"].map((k) => [k, doc.audio?.[k] ? opt(doc.audio[k]) : null]).concat(doc.audio?.narration_timeline_file && fs.existsSync(path.join(F, doc.audio.narration_timeline_file)) ? [["alignment_output", (() => { const t = JSON.parse(fs.readFileSync(path.join(F, doc.audio.narration_timeline_file), "utf8")); return t.alignment?.output_file ? opt(t.alignment.output_file) : null; })()]] : [])),
    approvals: sha({ pointers: [...dir("approvals"), ...dir("art_designs", (p) => p.endsWith(".APPROVAL_POINTER.json"))], reviews: upstreamReviews(F) }),
    canvas: sha({ width: doc.stage?.width, height: doc.stage?.height, fps: doc.stage?.fps, total_frames: doc.stage?.total_frames }),
  };
  return { digest: sha(scopes), scopes, integrity, parts: { assets, runtime_nu_js: fsha(path.join(REPO, "engine", "runtime", "nu.js")), canvas: { width: doc.stage?.width ?? 1920, height: doc.stage?.height ?? 1080, fps: doc.stage?.fps, total_frames: doc.stage?.total_frames } } };
}
/** the dependency report (what is hashed, what is excluded and why) */
export function revisionDependencies(FILM) { const r = buildFilmRevision(FILM); return { film: path.basename(path.resolve(FILM)), digest: r.digest, scopes: r.scopes, integrity: r.integrity, code_files: codeClosure().map(([f, h]) => ({ file: f, sha256: h })), excluded_by_rule: EXCLUDED }; }
/** checkTiling(shots, transitions, total) — shot intervals tile [0,total) exactly; transitions sit on a shot boundary and own no extra frames */
export function checkTiling(shots, transitions = [], total = 7200) {
  const f = [], s = [...shots].sort((a, b) => a.start_frame - b.start_frame); let cur = 0;
  for (const x of s) { if (!Number.isInteger(x.start_frame) || !Number.isInteger(x.end_frame)) f.push({ code: "FRAME_TILING_GAP", record_id: x.id, reason: "non-integer frame bounds" });
    if (x.start_frame > cur) f.push({ code: "FRAME_TILING_GAP", record_id: x.id, frame_ranges: [[cur, x.start_frame]], reason: `frames ${cur}..${x.start_frame - 1} owned by no shot` });
    if (x.start_frame < cur) f.push({ code: "FRAME_TILING_GAP", record_id: x.id, frame_ranges: [[x.start_frame, cur]], reason: `frames ${x.start_frame}..${cur - 1} owned twice` }); cur = Math.max(cur, x.end_frame); }
  if (cur !== total) f.push({ code: "FRAME_TILING_GAP", record_id: "film", reason: `shots end at ${cur}, film needs exactly ${total}` });
  for (const t of transitions) { const a = s.find((x) => x.id === t.from_shot), b = s.find((x) => x.id === t.to_shot); if (!a || !b || a.end_frame !== b.start_frame) f.push({ code: "FRAME_TILING_GAP", record_id: `${t.from_shot}->${t.to_shot}`, reason: "transition does not join adjacent shots on a shared boundary" }); }
  return { ok: f.length === 0, failures: f };
}
