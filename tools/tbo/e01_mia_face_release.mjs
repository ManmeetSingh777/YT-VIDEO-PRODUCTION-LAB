#!/usr/bin/env node
// E01: release Mia's to_regular facial requests on the ACTUAL registered, approved head (V6 + Delta 01 items; no new program). Each request attaches
// the exact registered head bytes; the facial geometry block separates OBSERVED landmarks (measured colour regions on these pixels) from INFERRED
// ones (transferred from the approved master through the measured fit). Yields already registered AND compatible with this head are not requested.
//   node tools/tbo/e01_mia_face_release.mjs --film films/e01 --v6 <V6 dir> --delta <Delta 01 dir> --out <dir>
import fs from "node:fs"; import path from "node:path"; import url from "node:url"; import crypto from "node:crypto";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), sha = (b) => crypto.createHash("sha256").update(b).digest("hex"), arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const FILM = path.resolve(REPO, arg("film")), V6 = path.resolve(arg("v6")), DL = path.resolve(arg("delta")), OUT = path.resolve(arg("out")), doc = J(path.join(FILM, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"));
const HID = "ART_M04.CHAR_MIA.head_to_regular", head = doc.assets.find((a) => a.id === HID), reg = J(path.join(FILM, "registration", HID, `${HID}__REGISTRATION_RECEIPT.json`)), side = J(path.join(FILM, "registration", HID, "LANDMARK_SIDECAR.json"));
if (!head?.approved_review_id) throw new Error(`${HID} is not approved`); const hb = fs.readFileSync(path.join(FILM, head.file)); if (sha(hb) !== head.sha256) throw new Error("registered head bytes do not match the manifest");
const [cx, cy] = reg.source_pixel_crop_in_raw, R = (p) => [+(p[0] - cx).toFixed(2), +(p[1] - cy).toFixed(2)];
// observed (measured on these pixels; raw coordinates from the V6 return evaluation) vs inferred (master landmark through the measured fit)
const observed = { chin_lowest_face_skin: R([411.5, 987]), inner_ear_centroid: R([711.11, 792.87]), nose_mark_centroid: R([305.85, 766.92]), face_skin_bbox_xyxy: [...R([201, 472]), ...R([792, 987])] };
const inferred = Object.fromEntries(Object.entries(side.landmarks).map(([k, v]) => [k, R(v)]));
// compatibility of the existing approved facial drawings with this head (measured share of each drawing on the head's face skin)
const fit = { "ART_M06.CHAR_MIA.mouth": 100, "ART_M06.CHAR_MIA.mouth_rest": 100, "ART_M04.CHAR_MIA.eyes": 78.8, "ART_M05.CHAR_MIA.brows": 71.7, "ART_M05.CHAR_MIA.cheeks": 70.5 }, compatible = new Set(Object.entries(fit).filter(([, v]) => v >= 99.5).map(([k]) => k));
const items = J(path.join(V6, "ITEMS.json")).items, delta = new Map(J(path.join(DL, "ITEMS_DELTA.json")).items.map((x) => [x.id, x]));
const faces = items.filter((x) => x.edit === "ITEM:MIA.H.to_regular").map((x) => delta.get(x.id) || x);
fs.rmSync(OUT, { recursive: true, force: true }); fs.mkdirSync(path.join(OUT, "requests"), { recursive: true }); fs.writeFileSync(path.join(OUT, "HEAD_TO_REGULAR.png"), hb);
const geo = { asset_id: HID, file: "HEAD_TO_REGULAR.png", sha256: head.sha256, size_px: [965, 1437], approval_receipt: head.approved_review_id, raster_to_canonical: reg.raster_to_canonical, note_transform: "canonical = [a c e; b d f] · [x y 1] with [a,b,c,d,e,f] = raster_to_canonical (similarity: scale 0.4762, rotation 4.8°)", source: { raw_sha256: reg.source.raw_sha256, crop_in_raw_xywh: reg.source_pixel_crop_in_raw, return: "E01_ARTWORK_V6_RETURN.zip returns/MIA.H.to_regular/round01.png (sha256 29efa808…), collar removed by selection" },
  landmarks_observed: observed, landmarks_inferred: inferred, inferred_method: side.reviewed_by, compatible_existing: [...compatible], incompatible_existing: Object.keys(fit).filter((k) => !compatible.has(k)).map((k) => `${k} (${fit[k]}% on face skin)`) };
fs.writeFileSync(path.join(OUT, "HEAD_REGISTRATION.json"), JSON.stringify(geo, null, 1));
const released = [], skipped = [];
for (const it of faces) { const need = it.yields.filter((y) => !compatible.has(y)); if (!need.length) { skipped.push({ id: it.id, reason: "every yield is an existing drawing that fits this head" }); continue; }
  const src = fs.existsSync(path.join(DL, "requests", `${it.n}_${it.id}`, "REQUEST.md")) ? path.join(DL, "requests", `${it.n}_${it.id}`, "REQUEST.md") : path.join(V6, "requests", `${it.n}_${it.id}`, "REQUEST.md");
  let md = fs.readFileSync(src, "utf8"); md = md.replace(/## Attach\n[\s\S]*?\n## /, "## Attach\n- HEAD_TO_REGULAR.png  (the APPROVED registered head itself — edit exactly these pixels; sha256 " + head.sha256 + ")\n\n## ");
  md = md.replace(/Edit the attached SELECTED to_regular head:/, "Edit the attached registered head HEAD_TO_REGULAR.png (Mia's approved to_regular head, 965x1437):");
  md += ["", "## Facial geometry of THIS head (pixels of HEAD_TO_REGULAR.png, origin top-left)", `- OBSERVED (measured on these pixels): chin ${observed.chin_lowest_face_skin}, inner-ear centre ${observed.inner_ear_centroid}, nose mark ${observed.nose_mark_centroid}, face-skin box ${observed.face_skin_bbox_xyxy}.`,
    `- INFERRED (approved master landmarks through the measured fit; not visible here): cranium top ${inferred.cranium_top}, neck pivot ${inferred.neck}.`,
    "- Every eye, lid, brow and cheek mark lies INSIDE the face skin of this head; the far (screen-left) eye and cheek sit inside the far face contour (the master's far features do not fit this head).",
    `- Do not redraw the head outline, hair, ear, nose or neck; the existing neutral mouth${compatible.has("ART_M06.CHAR_MIA.mouth") ? " (ART_M06.CHAR_MIA.mouth / mouth_rest) already fits this head" : ""} — draw only this state's mouth shape.`,
    `- Yields still needed from this request: ${need.join(", ")}.`, ""].join("\n");
  fs.mkdirSync(path.join(OUT, "requests", `${it.n}_${it.id}`), { recursive: true }); fs.writeFileSync(path.join(OUT, "requests", `${it.n}_${it.id}`, "REQUEST.md"), md); released.push({ id: it.id, n: it.n, yields: need, from: path.relative(path.dirname(V6), src) }); }
fs.writeFileSync(path.join(OUT, "RELEASE.json"), JSON.stringify({ released, skipped, head: geo }, null, 1));
fs.writeFileSync(path.join(OUT, "README.md"), `# Mia to_regular facial release 01\n\nAttach HEAD_TO_REGULAR.png (approved registered head, sha256 ${head.sha256}) to every request below; these supersede the V6/Delta 01 attachment line "your SELECTED result of MIA.H.to_regular" only (prompts, methods and acceptance unchanged).\n\n${released.map((r) => `- ${r.n}_${r.id}: ${r.yields.length} yields`).join("\n")}\n`);
console.log(JSON.stringify({ released: released.map((r) => `${r.n}_${r.id}`), skipped, compatible: [...compatible] }, null, 1));
