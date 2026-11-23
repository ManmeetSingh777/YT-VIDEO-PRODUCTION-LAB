// QUESTION → SOURCE EVIDENCE → CONDITIONAL RULE → EXECUTABLE CONSTRUCTION → RENDER → INSPECTION → REPAIR → LEARNING
// Operative form of VISUAL_CLUSTER_ATLAS §3 (priority 4C+3G+3R+2U, seven-move loop), HISTORICAL_QUESTION_LOOP
// lifecycle, AUTONOMOUS_VISUAL_PRODUCTION_LOOP §3B and REPAIR_LEARNING_TO_FIRST_PASS, adapted from image-provider
// calls to code construction + HyperFrames rendering. Run from a film dir:  node ../../engine/tools/loop.mjs <cmd> ...
//
//  open    --id Q01 --family B2 --C 3 --G 2 --R 2 --U 1 --observed "..." --question "..." --evidence qa/x.png [--class ART_PIXEL]
//  list                                   open questions sorted by priority (the next one to work is first)
//  witness Q01 --confirm <ref img> --counter <ref img> --observe "..."      (move 3: files must exist; sha recorded)
//  produce Q01 --if "..." --then "..." --falsifier "..." --op "file#symbol: change" [--counterexample "..."]   (moves 4–5)
//  before  Q01 --at 3.2,8.1 [--video qa/x.mp4]       frames from an ACTUAL render (move 1/6 evidence)
//  after   Q01 --at 3.2,8.1 --video qa/y.mp4 [--box x,y,w,h] [--verdict improved|regressed|unchanged] [--note "..."]
//  learn   Q01 --scope LOCAL_IDENTITY|CONDITIONAL_FAMILY --applies '{"subject_id":"keeper"}' [--params '{"k":v}']
//          --positive "construction op" --not "where it must NOT be generalized"
//  status  Q01 --to TRANSFER_TESTED|REVISED|BLOCKED --note "..."
//  evidence --identity keeper --methods F58,F02 --png qa/x.png --verdict pass|fail --note "..."   (ledger pixel evidence)
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ENGINE = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const STUDIO = path.dirname(ENGINE);
const [cmd, ...rest] = process.argv.slice(2);
const pos = rest.filter((x, i) => !x.startsWith("--") && !(i > 0 && rest[i - 1].startsWith("--")));
const A = (k, d) => (rest.includes("--" + k) ? rest[rest.indexOf("--" + k) + 1] : d);
const readJ = (p, d) => (fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : d);
const writeJ = (p, o) => { fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, JSON.stringify(o, null, 1)); };
const sha = (p) => crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");
const QF = "learning/QUESTIONS.json";
const db = readJ(QF, { questions: [] });
const now = () => new Date().toISOString();
const get = (id) => { const q = db.questions.find((x) => x.id === id); if (!q) throw new Error("no question " + id); return q; };
const prio = (q) => 4 * q.C + 3 * q.G + 3 * q.R + 2 * q.U;
const LIFE = ["QUESTION_OPEN", "WITNESSES_FOUND", "CONTRADICTION_SEARCHED", "PRODUCER_SPECIFIED", "OUTPUT_DEMONSTRATED", "TRANSFER_TESTED", "REVISED", "BLOCKED"];
const py = (args) => execFileSync("python", ["-I", path.join(ENGINE, "tools/mninspect.py"), ...args], { encoding: "utf8" });
const save = () => writeJ(QF, db);

function frames(q, tag, at, video) {
  if (!video && A("png")) { // still evidence (hero frame / snapshot) instead of video frames
    const dir = `learning/evidence/${q.id}/${tag}`; fs.mkdirSync(dir, { recursive: true });
    return A("png").split(",").map((src, i) => { const dst = `${dir}/still_${i}.png`; fs.copyFileSync(src, dst); return { png: dst, sha256: sha(dst), source: src }; });
  }
  const dir = `learning/evidence/${q.id}/${tag}`;
  py(["frames", video, dir, "--at", at]);
  return fs.readdirSync(dir).filter((f) => f.endsWith(".png")).map((f) => ({ png: `${dir}/${f}`, sha256: sha(`${dir}/${f}`), video, video_sha256: sha(video) }));
}

if (cmd === "open") {
  const q = { id: A("id"), family: A("family"), class: A("class", "ART_PIXEL"), C: +A("C"), G: +A("G"), R: +A("R"), U: +A("U", 0),
    observed: A("observed"), question: A("question"), evidence: A("evidence") ? [{ png: A("evidence"), sha256: sha(A("evidence")) }] : [],
    status: "QUESTION_OPEN", witnesses: [], producer: null, before: [], after: [], history: [{ at: now(), to: "QUESTION_OPEN" }] };
  for (const k of ["id", "family", "observed", "question"]) if (!q[k]) throw new Error("missing --" + k);
  if (q.question.length < 25 || /\b(better|nicer|richer|more cinematic|prettier)\b/i.test(q.question)) throw new Error("question must be discriminating and drawable, not an adjective");
  q.priority = prio(q);
  db.questions = db.questions.filter((x) => x.id !== q.id).concat(q); save();
  console.log(`${q.id} priority ${q.priority} (4C+3G+3R+2U = 4·${q.C}+3·${q.G}+3·${q.R}+2·${q.U})`);
} else if (cmd === "list") {
  const open = db.questions.filter((q) => !["TRANSFER_TESTED", "BLOCKED"].includes(q.status)).sort((a, b) => b.priority - a.priority);
  for (const q of open) console.log(`${String(q.priority).padStart(3)}  ${q.id.padEnd(5)} ${q.status.padEnd(22)} [${q.family}/${q.class}] ${q.question}`);
  const done = db.questions.filter((q) => ["TRANSFER_TESTED", "OUTPUT_DEMONSTRATED", "BLOCKED"].includes(q.status));
  if (done.length) console.log("closed/demonstrated:", done.map((q) => `${q.id}:${q.status}`).join(" "));
} else if (cmd === "witness") {
  const q = get(pos[0]);
  const resolve = (p) => (fs.existsSync(p) ? p : path.join(STUDIO, "reference/construct-kurzgesagt-art/assets", p));
  const c = resolve(A("confirm")), x = resolve(A("counter"));
  for (const p of [c, x]) if (!fs.existsSync(p)) throw new Error("witness file not found: " + p);
  q.witnesses.push({ confirm: path.relative(STUDIO, c), confirm_sha256: sha(c), counter: path.relative(STUDIO, x), counter_sha256: sha(x), observed: A("observe"), at: now() });
  q.status = "CONTRADICTION_SEARCHED"; q.history.push({ at: now(), to: q.status }); save(); console.log(q.id, q.status);
} else if (cmd === "produce") {
  const q = get(pos[0]);
  if (!q.witnesses.length && !rest.includes("--no-source")) throw new Error("move 3 first: record confirming + counter witnesses (or --no-source with a reason for pure engine/runtime faults)");
  const op = A("op"); const [file, sym] = op.split(":")[0].split("#");
  if (!fs.existsSync(file) && !fs.existsSync(path.join(STUDIO, file))) throw new Error("op must name a real producing file: " + file);
  const src = fs.readFileSync(fs.existsSync(file) ? file : path.join(STUDIO, file), "utf8");
  if (sym && !src.includes(sym)) throw new Error(`symbol ${sym} not found in ${file}`);
  q.producer = { if: A("if"), then: A("then"), falsifier: A("falsifier"), counterexample: A("counterexample"), op, no_source_reason: A("no-source-reason"), at: now() };
  q.status = "PRODUCER_SPECIFIED"; q.history.push({ at: now(), to: q.status }); save(); console.log(q.id, q.status, op);
} else if (cmd === "before") {
  const q = get(pos[0]); q.before = frames(q, "before", A("at"), A("video")); save(); console.log(q.before.map((f) => f.png).join("\n"));
} else if (cmd === "after") {
  const q = get(pos[0]);
  if (!q.producer) throw new Error("no producer specified: a repair must change a named producing operation (move 4–6)");
  q.after = frames(q, "after", A("at"), A("video"));
  q.comparisons = q.before.map((b, i) => {
    const a = q.after[i]; if (!a) return null;
    const out = `learning/evidence/${q.id}/compare_${i}.png`;
    const m = JSON.parse(py(["diff", b.png, a.png, out, ...(A("box") ? ["--box", A("box")] : [])]).trim().split("\n").pop());
    return { before: b.png, after: a.png, sheet: out, metrics: m };
  }).filter(Boolean);
  q.verdict = A("verdict", "unreviewed"); q.note = A("note");
  if (q.verdict === "improved") { q.status = "OUTPUT_DEMONSTRATED"; q.history.push({ at: now(), to: q.status }); }
  if (q.verdict === "regressed") { q.history.push({ at: now(), to: "REGRESSED", note: q.note }); }
  save(); console.log(q.id, q.verdict, JSON.stringify(q.comparisons.map((c) => c.metrics)));
} else if (cmd === "learn") {
  const q = get(pos[0]);
  if (q.verdict !== "improved" || !q.after.length) throw new Error("only a demonstrated before/after repair becomes a lesson");
  const scope = A("scope"); if (!["LOCAL_IDENTITY", "CONDITIONAL_FAMILY"].includes(scope)) throw new Error("scope must be LOCAL_IDENTITY or CONDITIONAL_FAMILY");
  const lesson = {
    rule_id: `${path.basename(process.cwd())}:${q.id}`, scope, status: "REPAIR_DEMONSTRATED",
    applies_when: JSON.parse(A("applies", "{}")), params: A("params") ? JSON.parse(A("params")) : undefined,
    observed_mismatch: q.observed, question: q.question, source_evidence: q.witnesses, root_cause: q.producer.if ? `missing operation: IF ${q.producer.if}` : q.observed,
    incorrect_operation: A("was"), corrected_operation: q.producer.op, positive_construction_ops: [A("positive")], regression_boundary: A("not"),
    before: q.before.map((b) => ({ png: b.png, sha256: b.sha256 })), after: q.after.map((b) => ({ png: b.png, sha256: b.sha256 })), comparisons: q.comparisons,
    recorded: now(),
  };
  if (!lesson.regression_boundary) throw new Error("--not is required: state where this repair must NOT be generalized");
  const target = scope === "CONDITIONAL_FAMILY" && rest.includes("--studio") ? path.join(STUDIO, "learning/REPAIR_MEMORY.json") : "learning/REPAIR_MEMORY.json";
  const mem = readJ(target, { version: 1, lessons: [] });
  mem.lessons = mem.lessons.filter((l) => l.rule_id !== lesson.rule_id).concat(lesson); writeJ(target, mem);
  q.lesson = { file: target, rule_id: lesson.rule_id }; save(); console.log("lesson", lesson.rule_id, "→", target);
} else if (cmd === "status") {
  const q = get(pos[0]); const to = A("to"); if (!LIFE.includes(to)) throw new Error("status ∈ " + LIFE.join("|"));
  q.status = to; q.history.push({ at: now(), to, note: A("note") }); save(); console.log(q.id, to);
} else if (cmd === "evidence") {
  const ef = "learning/EVIDENCE.json", ev = readJ(ef, { records: [] }), png = A("png");
  ev.records.push({ identity: A("identity"), methods: A("methods").split(","), png, sha256: sha(png), verdict: A("verdict"), note: A("note"), at: now() });
  writeJ(ef, ev); console.log("evidence recorded for", A("identity"), A("methods"));
} else {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(0, 18).join("\n"));
}
