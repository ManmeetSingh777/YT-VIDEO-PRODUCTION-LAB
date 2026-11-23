// Differential causal verification of a design decision (rejects self-declared provenance).
//   node ../../engine/tools/decision_proof.mjs <name> --decide '{"key": value}' [--scene sheet] [--at 1.0] [--render]
// 1. builds the project normally and with MN_DECIDE overriding ONE decision
// 2. compares every emitted element's geometry/fill in compositions/<scene>.html (exact, structural)
// 3. reports: elements changed, elements unchanged, and whether the change is CONFINED to the regions the
//    construction actually built from that decision (traced reads in the ICD receipt of the baseline build)
// 4. optional --render: snapshot both builds and measure the pixel bbox of the change
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const ENGINE = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const [name, ...rest] = process.argv.slice(2);
const A = (k, d) => (rest.includes("--" + k) ? rest[rest.indexOf("--" + k) + 1] : d);
const scene = A("scene", "sheet"), decide = A("decide"), at = A("at", "1.0");
// ISOLATED run: the film is copied to a scratch workspace; the real project's builds/receipts are never touched
const HOME = process.cwd(), dir = path.join(HOME, `proof/decisions/${name}`); fs.mkdirSync(dir, { recursive: true });
const WS = path.join(path.dirname(ENGINE), ".proofws", `${name}-${process.pid}`, "films", path.basename(HOME)); // same depth → relative imports resolve
fs.rmSync(WS, { recursive: true, force: true });
fs.cpSync(HOME, WS, { recursive: true, filter: (p) => !/[\\/](qa|proof|renders|\.hyperframes|node_modules)([\\/]|$)/.test(p.slice(HOME.length)) && !p.endsWith(".mp4") });
{ const root = path.dirname(path.dirname(WS)), studio = path.dirname(ENGINE);
  for (const d of ["engine", "learning", "reference", "style"]) if (fs.existsSync(path.join(studio, d))) fs.symlinkSync(path.join(studio, d), path.join(root, d), "junction"); }
process.chdir(WS);
process.on("exit", () => { try { process.chdir(HOME); const root = path.dirname(path.dirname(WS)); for (const d of ["engine", "learning", "reference", "style"]) { try { fs.unlinkSync(path.join(root, d)); } catch (e) {} } fs.rmSync(root, { recursive: true, force: true }); } catch (e) {} });
const build = (env) => execSync(`node ${path.join(ENGINE, "tools/build.mjs")} --rough`, { env: Object.assign({}, process.env, env), encoding: "utf8" });
const elements = (html) => { const m = {}; for (const x of html.matchAll(/<(path|use|g|circle)\b([^>]*?)\bid="([^"]+)"([^>]*)>/g)) m[x[3]] = (x[2] + x[4]).replace(/\s+/g, " "); return m; };
const snap = (tag) => { if (!rest.includes("--render")) return; const tmp = `${dir}/_${tag}`; fs.rmSync(tmp, { recursive: true, force: true }); execSync(`npx --yes hyperframes@0.9.11 snapshot --at ${at} --no-end -o ${tmp}`, { stdio: "ignore", shell: true }); const f = fs.readdirSync(tmp).find((x) => x.endsWith(".png")); fs.copyFileSync(`${tmp}/${f}`, `${dir}/${tag}.png`); fs.rmSync(tmp, { recursive: true, force: true }); };

build({}); snap("base");
const base = elements(fs.readFileSync(`compositions/${scene}.html`, "utf8"));
const receipts = fs.readdirSync("production/icd").filter((f) => f.endsWith(".json") && !f.includes(".ablate-")).map((f) => JSON.parse(fs.readFileSync(`production/icd/${f}`, "utf8")));
build({ MN_DECIDE: decide }); snap("variant");
const vari = elements(fs.readFileSync(`compositions/${scene}.html`, "utf8"));
const key = Object.keys(JSON.parse(decide))[0];
const changed = Object.keys(base).filter((id) => vari[id] !== undefined && vari[id] !== base[id]);
const added = Object.keys(vari).filter((id) => base[id] === undefined), removed = Object.keys(base).filter((id) => vari[id] === undefined);
// regions the construction BUILT from this decision (traced reads), mapped to emitted element ids
const traced = new Set();
// decisions derived from the tested decision (e.g. a lesson rule computing one colour from another) are followed transitively
const keys = new Set([Object.keys(JSON.parse(decide))[0]]);
for (let grew = true; grew;) { grew = false; for (const r of receipts) for (const [k, d] of Object.entries(r.decisions)) if (!keys.has(k) && (d.derivedFrom || []).some((x) => keys.has(x))) { keys.add(k); grew = true; } }
for (const r of receipts) for (const o of r.operations) if ((o.traced || []).some((k) => keys.has(k))) {
  const P = r.context.prefix; traced.add(P + "M-" + o.region); traced.add(P + "F-" + o.region); traced.add(P + o.region);
  // operator-derived dependency (engine-defined, not author-declared): a material group's plane offsets are computed
  // from its members' dimensions, so a member's geometry change legitimately moves that group's LIT/HI planes
  if (o.group) { traced.add(P + "LIT-" + o.group); traced.add(P + "HI-" + o.group); traced.add(P + "C-" + o.group); }
  if (o.op === "materialGroup") { traced.add(P + "G-" + o.region); traced.add(P + "LIT-" + o.region); traced.add(P + "HI-" + o.region); }
}
const allChanged = [...changed, ...added, ...removed];
const outside = allChanged.filter((id) => ![...traced].some((t) => id === t || id.startsWith(t)));
let pixels = null;
if (rest.includes("--render")) pixels = JSON.parse(execSync(`python -I ${path.join(ENGINE, "tools/mninspect.py")} diffbox ${dir}/base.png ${dir}/variant.png ${dir}/diff.png`, { encoding: "utf8" }).trim().split("\n").pop());
const res = { name, decision: JSON.parse(decide), elements_total: Object.keys(base).length, changed: changed.length, added: added.length, removed: removed.length, unchanged: Object.keys(base).length - changed.length - removed.length,
  traced_regions: [...traced].length, changed_outside_traced: outside.slice(0, 40), outside_count: outside.length, verdict: allChanged.length === 0 ? "NO_EFFECT (decision does not control geometry)" : outside.length === 0 ? "CONTROLS+CONFINED (differential change = traced consumers)" : "CONTROLS, TRACE_INCOMPLETE (differential change exceeds traced consumers: inspect list)", pixels, sample_changed: allChanged.slice(0, 20) };
fs.writeFileSync(`${dir}/result.json`, JSON.stringify(res, null, 1));
console.log(JSON.stringify(res, null, 1));
