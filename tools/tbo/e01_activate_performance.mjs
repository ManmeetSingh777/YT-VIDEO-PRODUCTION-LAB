#!/usr/bin/env node
// E01: activate the performance runtime inputs AFTER their packet is signed and accepted. The profiles/commands/support contracts become production
// inputs only if the ACTIVE accepted packet carries them byte-for-byte as source documents; each profile then records the packet's approval
// receipt (sha256 of the receipt file) — the approval is the director's signature on that packet, never a self-assigned status.
//   node tools/tbo/e01_activate_performance.mjs --film films/e01
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), sha = (b) => crypto.createHash("sha256").update(b).digest("hex"), arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const FILM = path.resolve(REPO, arg("film")), cur = J(path.join(FILM, "creative", "CURRENT.json")), pdir = path.join(FILM, "creative", "packets", cur.packet_sha256), pk = J(path.join(pdir, "CREATIVE_PACKET.json"));
const doc = (name) => { const d = pk.source.documents.find((x) => x.file === name); if (!d) throw new Error(`active packet ${cur.packet_sha256.slice(0, 12)} does not carry ${name}`); const b = fs.readFileSync(path.join(pdir, "source", name)); if (sha(b) !== d.sha256) throw new Error(`${name} bytes do not match the signed packet`); return b; };
const rf = path.join(FILM, "reviews", `${cur.approval_receipt}.json`); if (!cur.approval_receipt || !fs.existsSync(rf)) throw new Error("the active packet has no approval receipt on disk");
const receipt_sha256 = sha(fs.readFileSync(rf)), profiles = JSON.parse(doc("E01_PERFORMANCE_PROFILES.json"));
for (const p of Object.values(profiles)) p.approval = { status: "APPROVED", receipt_sha256, packet_sha256: cur.packet_sha256, receipt: cur.approval_receipt, reviewer_kind: cur.reviewer_kind, note: "approved as a verbatim source document of the signed creative packet" };
const H = (f) => path.join(FILM, "handoff", f);
fs.writeFileSync(H("PERFORMANCE_PROFILES.json"), JSON.stringify(profiles, null, 1)); fs.writeFileSync(H("PERFORMANCE_COMMANDS.APPROVED.json"), doc("E01_PERFORMANCE_COMMANDS.json")); fs.writeFileSync(H("PROP_SUPPORT.APPROVED.json"), doc("E01_PROP_SUPPORT.json"));
console.log(JSON.stringify({ packet: cur.packet_sha256, receipt: cur.approval_receipt, reviewer_kind: cur.reviewer_kind, profiles: Object.keys(profiles), status: "PERFORMANCE_INPUTS_ACTIVE" }, null, 1));
