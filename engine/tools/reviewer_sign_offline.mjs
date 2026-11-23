#!/usr/bin/env node
// Runs on the REVIEWER's machine (P04 §6.2). Standalone: no repository imports, so it can be copied and read in full. It signs a review request with
// the reviewer's own ed25519 private key. It refuses a key inside any checkout of this studio (and warns inside any other git repository) and refuses to run without an
// interactive terminal: an automated agent cannot sign by piping input. It never writes the key anywhere.
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto"; import readline from "node:readline";
const a = process.argv.slice(2), get = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; }, die = (m) => { console.error(m); process.exit(1); };
const reqF = get("--request"), keyF = get("--key"), reviewer = get("--reviewer"), verdict = get("--verdict"), out = get("--out") || "SIGNED_REVIEW.json";
if (!reqF || !keyF || !reviewer || !verdict) die("usage: reviewer_sign_offline.mjs --request REVIEW_REQUEST.json --key PRIVATE.pem --reviewer ID --verdict APPROVED|REJECTED|REVISE_AT_ART_SOURCE|REVISE_AT_RIG_SOURCE [--out FILE]");
if (!["APPROVED", "REJECTED", "REVISE_AT_ART_SOURCE", "REVISE_AT_RIG_SOURCE", "REVOKED"].includes(verdict)) die(`unknown verdict ${verdict}`);
for (let d = path.dirname(path.resolve(keyF)); ; d = path.dirname(d)) { if (fs.existsSync(path.join(d, "engine", "art_bridge"))) die(`the private key is inside a repository of this studio (${d}); keep it outside`); if (fs.existsSync(path.join(d, ".git"))) console.warn(`warning: ${d} is a git repository; make sure this key is never committed there`); if (d === path.dirname(d)) break; }
if (!process.stdin.isTTY || !process.stdout.isTTY) die("signing needs an interactive terminal: run this yourself");
const req = JSON.parse(fs.readFileSync(reqF, "utf8")); if (crypto.createHash("sha256").update(JSON.stringify(req.packet)).digest("hex") !== req.packet_sha256) die("the request packet does not match its hash");
const canon = (v) => (Array.isArray(v) ? v.map(canon) : v && typeof v === "object" ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])])) : v);
console.log(`Film ${req.packet.film_id} | ${req.packet.scope} ${req.packet.id ?? ""}\nPacket ${req.packet_sha256}\nFiles:\n${req.packet.files.map((x) => `  ${x.file}  ${x.sha256}`).join("\n")}\nVerdict: ${verdict}`);
const rl = readline.createInterface({ input: process.stdin, output: process.stdout }), typed = await new Promise((ok) => rl.question("Type the first 8 characters of the packet hash to sign: ", ok)); rl.close();
if (typed.trim() !== req.packet_sha256.slice(0, 8)) die("not signed");
const key = crypto.createPrivateKey(fs.readFileSync(keyF));
const envelopes = req.envelopes.map((e) => { const x = { ...e, verdict, reviewer_id: reviewer }; return { ...x, signature: crypto.sign(null, Buffer.from(JSON.stringify(canon({ ...x, signature: undefined }))), key).toString("base64") }; });
fs.writeFileSync(out, JSON.stringify({ request_id: req.request_id, envelopes }, null, 1)); console.log(`signed: ${path.resolve(out)}`);
