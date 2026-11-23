// Operative-control proofs: build + render the SAME scene under controlled variants and measure where pixels changed.
//   node ../../engine/tools/control_proof.mjs <name> --at 1.0 --variant 'ENV=VAL,ENV2=VAL' [--expect x,y,w,h]
// Writes proof/control/<name>/{base,variant,diff}.png + result.json:
//   changed-pixel bbox, fraction inside the expected region (the owned subject/region), and the variant's ICD errors
//   (an ablated required method must surface as an identified failure, not pass silently).
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const ENGINE = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const [name, ...rest] = process.argv.slice(2);
const A = (k, d) => (rest.includes("--" + k) ? rest[rest.indexOf("--" + k) + 1] : d);
const at = A("at", "1.0"), variant = A("variant", ""), expect = A("expect");
const dir = `proof/control/${name}`; fs.mkdirSync(dir, { recursive: true });
const env = (extra) => Object.assign({}, process.env, extra);
const parseV = (v) => Object.fromEntries(v.split(";").filter(Boolean).map((kv) => { const i = kv.indexOf("="); return [kv.slice(0, i), kv.slice(i + 1)]; }));
function shot(tag, extra) {
  const out = execSync(`node ${path.join(ENGINE, "tools/build.mjs")} --rough`, { env: env(extra), encoding: "utf8" });
  const tmp = `${dir}/_snap_${tag}`; fs.rmSync(tmp, { recursive: true, force: true });
  execSync(`npx --yes hyperframes@0.9.11 snapshot --at ${at} --no-end -o ${tmp}`, { stdio: "ignore", shell: true });
  const png = fs.readdirSync(tmp).find((f) => f.endsWith(".png")); fs.copyFileSync(`${tmp}/${png}`, `${dir}/${tag}.png`); fs.rmSync(tmp, { recursive: true, force: true });
  const icd = fs.readdirSync("production/icd").filter((f) => f.includes(".ablate-") || !extra.MN_ABLATE).map((f) => ({ f, j: JSON.parse(fs.readFileSync(`production/icd/${f}`, "utf8")) }));
  return { build: out.trim().split("\n").slice(-4), icd };
}
const base = shot("base", {});
const vb = shot("variant", parseV(variant));
const py = execSync(`python -I ${path.join(ENGINE, "tools/mninspect.py")} diffbox ${dir}/base.png ${dir}/variant.png ${dir}/diff.png ${expect ? "--expect " + expect : ""}`, { encoding: "utf8" }).trim();
const metrics = JSON.parse(py.split("\n").pop());
const errors = vb.icd.flatMap(({ f, j }) => (f.includes(".ablate-") || parseV(variant).MN_ABLATE ? j.errors.map((e) => `${j.subject}: ${e}`) : []));
const lessons = vb.icd.flatMap(({ j }) => j.lessons_applied.map((l) => `${j.subject}: ${l.rule_id} ${l.skipped ? "SKIPPED" : JSON.stringify(l.changed)}`));
const res = { name, at, variant, expect, metrics, identified_failures: errors, lessons_in_variant: lessons, base_sha256: crypto.createHash("sha256").update(fs.readFileSync(`${dir}/base.png`)).digest("hex"), variant_sha256: crypto.createHash("sha256").update(fs.readFileSync(`${dir}/variant.png`)).digest("hex") };
fs.writeFileSync(`${dir}/result.json`, JSON.stringify(res, null, 1));
// restore the normal build
execSync(`node ${path.join(ENGINE, "tools/build.mjs")} --rough`, { env: env({}), stdio: "ignore" });
console.log(JSON.stringify({ name, metrics, identified_failures: errors.slice(0, 6), lessons_in_variant: lessons }, null, 1));
