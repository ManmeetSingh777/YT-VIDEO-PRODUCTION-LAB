// Resolution contract (E01 resolution correction). One place decides, for every ArtJob of every family, what a single generation can
// deliver and where native detail must come from instead. It separates four quantities that were previously conflated:
//   1. provider canvas      — the pixel size ONE generation returns (only sizes the provider/route actually supports);
//   2. authored target      — the design's canonical output (design.output): the ASSEMBLED, registered asset, not one provider image;
//   3. component native px  — directed minimum native pixels for a named component (e.g. a head), transcribed with source citation;
//   4. projected screen px  — what the camera shows; known exactly only after the motion plan (never invented here).
// Rules: the requested canvas is a supported size chosen from the subject (a figure is portrait-led); fit k = native px the canvas gives per
// authored px. k >= 1 → the authored target is native in one image. k < 1 → one image cannot carry it: a MASTER may still be generated as the
// identity/registration master at density k ONLY if it has derived component jobs to carry the remaining native detail; every directed component
// requirement must name an existing component job. Anything else is IMPOSSIBLE_RESOLUTION_REQUEST and is never exported. Upscaled pixels never
// count as native: delivered sizes are measured, and a requirement is satisfied only by a component's own delivered pixels.
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { err } from "./errors.mjs";
import { componentCropPlan } from "./component_route.mjs";
import { readPNG } from "./png.mjs";

export const DEFAULT_PROVIDER_CANVASES = Object.freeze(["1024x1024", "1536x1024", "1024x1536"]); // gpt-image sizes (API and ChatGPT image tool)
export const CANVAS_MARGIN = 0.02; // transparent margin kept on each edge of the long axis for a figure (the drawing must not touch the edge)
// Same-aspect native sizes a route is OBSERVED to return for a requested canvas (never smaller, never another aspect). Evidence: E01 batch
// GPT_ART_BATCH_20261127_8b2ca7263773 — all 6 square ChatGPT image-tool requests returned 1254x1254, all 4 portrait/landscape requests
// returned exactly the requested size. Such an image is accepted as delivered (more native pixels, never resized); its size is recorded.
export const ROUTE_EQUIVALENT_CANVASES = Object.freeze({ "1024x1024": ["1254x1254"] });
export const acceptedCanvases = (requested) => [requested, ...(ROUTE_EQUIVALENT_CANVASES[requested] || [])];
const P = "engine/art_bridge/resolution_contract.mjs";
const sha = (s) => crypto.createHash("sha256").update(s).digest("hex");
const dims = (s) => { const m = /^(\d+)x(\d+)$/.exec(String(s)); if (!m) throw err("SCHEMA_VIOLATION", { reason: `canvas ${s} is not WxH`, producer: P }); return [+m[1], +m[2]]; };
const orient = (w, h) => (w > h * 1.1 ? "LANDSCAPE" : h > w * 1.1 ? "PORTRAIT" : "SQUARE");

/** the sizes ONE generation can return on this route: IMAGE_PROVIDER_SIZES="WxH,WxH" overrides; IMAGE_PROVIDER_SIZE pins one; else gpt-image's */
export function providerCanvases(env = process.env) {
  if (env.IMAGE_PROVIDER_SIZES) return env.IMAGE_PROVIDER_SIZES.split(",").map((s) => s.trim()).filter(Boolean).map((s) => (dims(s), s));
  if (env.IMAGE_PROVIDER_SIZE) return [(dims(env.IMAGE_PROVIDER_SIZE), env.IMAGE_PROVIDER_SIZE)];
  return [...DEFAULT_PROVIDER_CANVASES];
}

/** directed component minimums for the film (transcribed from approved sources, each with its citation); absent file = none declared */
export function loadNativeRequirements(film) {
  const f = film && path.join(path.resolve(film), "resolution", "NATIVE_RESOLUTION_REQUIREMENTS.json");
  if (!f || !fs.existsSync(f)) return { file: null, sha256: null, requirements: [] };
  const text = fs.readFileSync(f, "utf8"), doc = JSON.parse(text);
  for (const r of doc.requirements || []) {
    if (!r.component || !(r.min_native_px > 0) || !r.measure || !r.source?.file || !r.source?.sha256) throw err("SCHEMA_VIOLATION", { record_id: r.component ?? null, reason: "a native requirement needs component, measure, min_native_px and a source {file, sha256}", producer: P });
    const src = path.join(path.resolve(film), r.source.file);
    if (!fs.existsSync(src) || sha(fs.readFileSync(src)) !== r.source.sha256) throw err("STALE_DEPENDENCY", { record_id: r.component, reason: `the cited source ${r.source.file} is missing or changed; the requirement no longer has its authority`, producer: P });
  }
  return { file: path.relative(path.resolve(film), f).split(path.sep).join("/"), sha256: sha(text), requirements: doc.requirements || [] };
}

/** resolutionContract({job, design, film?, jobs?, env?}) → the generation contract for this job (throws IMPOSSIBLE_RESOLUTION_REQUEST) */
export function resolutionContract({ job, design, film = null, jobs = [], env = process.env, native = null }) {
  const o = design?.output || {}, aw = +o.authored_width_px || 0, ah = +o.authored_height_px || 0, fig = +o.figure_height_px || 0;
  const reqs = native || loadNativeRequirements(film), root = job.derived_from || job.root_dependency, master = !job.derived_from;
  const components = jobs.filter((j) => j.derived_from === root).map((j) => j.root_dependency);
  if (!(aw > 0 && ah > 0)) { // no authored target claimed: nothing to contradict. Canvas from the declared aspect (or a pinned size); directed minimums still apply
    const own = reqs.requirements.filter((r) => r.component === job.root_dependency || r.identity_asset === root);
    if (own.length) throw err("IMPOSSIBLE_RESOLUTION_REQUEST", { record_id: job.artjob_id, reason: `directed native minimums exist for ${root} but its design declares no authored pixel size to plan them against`, producer: P });
    const m = /^(\d+):(\d+)$/.exec(String(design?.canvas?.aspect || "")), [ax, ay] = m ? [+m[1], +m[2]] : [1, 1], want = orient(ax, ay), sizes = providerCanvases(env);
    const pick = sizes.find((s) => orient(...dims(s)) === want) || sizes[0], [cw, ch] = dims(pick);
    const c = { schema: "resolution_contract_v1", artjob: job.artjob_id, requested_canvas: pick, canvas_px: [cw, ch], canvas_orientation: orient(cw, ch), provider_canvases: sizes, authored_target: null, fit_scale: null, expected_native: { width_px: cw, height_px: ch },
      route: "NO_AUTHORED_TARGET_DECLARED", delegated_to_components: [], component_requirements: [], projected_screen_px: "DERIVED_AT_MOTION_PLAN (measured camera exposure; never assumed here)", native_rule: "only delivered pixels count; nothing is upscaled", requirements_file: reqs.file, requirements_sha256: reqs.sha256 };
    return { ...c, key: `${c.requested_canvas}|${sha(JSON.stringify(c))}` };
  }
  // the subject the canvas must hold: a figure by its height (portrait-led), anything else by its authored rectangle
  const fit = ([cw, ch]) => (fig ? Math.min(1, (ch * (1 - 2 * CANVAS_MARGIN)) / fig) : Math.min(1, cw / aw, ch / ah)); // a figure's width is measured from the art, never assumed
  const sizes = providerCanvases(env), want = fig ? "PORTRAIT" : orient(aw, ah);
  const ranked = sizes.map((s) => ({ s, d: dims(s) })).map((x) => ({ ...x, k: fit(x.d), same: orient(...x.d) === orient(aw, ah), lead: orient(...x.d) === want }))
    .sort((a, b) => (b.k >= 1) - (a.k >= 1) || (b.k >= 1 && a.k >= 1 ? b.same - a.same || a.d[0] * a.d[1] - b.d[0] * b.d[1] : b.k - a.k || b.lead - a.lead));
  const pick = ranked[0], k = +pick.k.toFixed(4), [cw, ch] = pick.d;
  const mine = reqs.requirements.filter((r) => r.identity_asset === root || r.component === job.root_dependency || (master && components.includes(r.component)));
  const problems = [];
  for (const r of mine) if (r.component !== job.root_dependency && !components.includes(r.component)) problems.push(`directed requirement for ${r.component} (${r.measure} >= ${r.min_native_px}px) names no component job of ${root}`);
  const own = mine.filter((r) => r.component === job.root_dependency);
  if (!master && own.length) { // a directed component minimum: only the source-attached crop route of the REGISTERED, approved master can meet it
    const req = [...own].sort((a, b) => b.min_native_px - a.min_native_px)[0], cc = componentCrop({ film, root, job, req, sizes: sizes.flatMap(acceptedCanvases) });
    if (!cc.ok) throw err("COMPONENT_NATIVE_RESOLUTION_UNVERIFIED", { record_id: job.artjob_id, reason: `${job.root_dependency} must reach ${own.map((r) => `${r.measure} >= ${r.min_native_px}px`).join(", ")} natively with its own pixels: ${cc.reason}`, producer: P, failed_invariant: "a directed component minimum is met by that component's own delivered pixels", repair_owner: "ENGINE", resume_at: "MASTER_REGISTRATION" });
    const c = { schema: "resolution_contract_v1", artjob: job.artjob_id, requested_canvas: cc.plan.canvas, accepted_canvases: [cc.plan.canvas], canvas_px: dims(cc.plan.canvas), canvas_orientation: orient(...dims(cc.plan.canvas)), provider_canvases: sizes, authored_target: { width_px: aw, height_px: ah, figure_height_px: fig || null, meaning: "the assembled, registered canonical asset (design.output) — not one provider image" },
      fit_scale: cc.plan.scale_from_master, expected_native: { [req.measure]: cc.plan.expected_delivered_span_px }, route: "SOURCE_ATTACHED_COMPONENT_CROP", component_crop: { ...cc.plan, master_file: cc.master_file, master_sha256: cc.master_sha256, registration_receipt_sha256: cc.receipt_sha256 }, delegated_to_components: [],
      component_requirements: own.map((r) => ({ component: r.component, measure: r.measure, min_native_px: r.min_native_px, basis: r.basis, source: r.source })), projected_screen_px: "DERIVED_AT_MOTION_PLAN (measured camera exposure; never assumed here)", native_rule: "only the component's own delivered pixels count; an upscaled crop is refused (native detail check)", requirements_file: reqs.file, requirements_sha256: reqs.sha256 };
    return { ...c, key: `${c.requested_canvas}|${sha(JSON.stringify(c))}` }; }
  let route;
  if (k >= 1) route = "NATIVE_IN_ONE_IMAGE";
  else if (master && components.length) route = "IDENTITY_MASTER_THEN_SOURCE_ATTACHED_COMPONENTS";
  else if (!master) route = "MASTER_DENSITY_EDIT_EXPOSURE_CHECKED_AT_MOTION_PLAN"; // no directed number for this component: it keeps the measured master density, and its native need is checked against measured camera exposure (never assumed satisfied)
  else problems.push(`the authored target ${fig ? `figure ${fig}px` : `${aw}x${ah}`} needs ${(1 / k).toFixed(2)}x the largest supported canvas (${sizes.join(", ")}) and ${master ? "this master has no component jobs" : "a component cannot delegate further"} to carry the remaining native detail`);
  if (problems.length) throw err("IMPOSSIBLE_RESOLUTION_REQUEST", { record_id: job.artjob_id, reason: problems.join("; "), producer: P, failed_invariant: "every exported request can actually be delivered at its required native resolution", repair_owner: "HUMAN_ART_DIRECTOR", resume_at: "ART_DESIGN_COMPILATION", details: { canvases: sizes, authored: [aw, ah], figure_height_px: fig || null, fit: k } });
  const c = { schema: "resolution_contract_v1", artjob: job.artjob_id, requested_canvas: pick.s, accepted_canvases: acceptedCanvases(pick.s), canvas_px: [cw, ch], canvas_orientation: orient(cw, ch), provider_canvases: sizes,
    authored_target: { width_px: aw, height_px: ah, figure_height_px: fig || null, meaning: "the assembled, registered canonical asset (design.output) — not one provider image" },
    fit_scale: k, expected_native: fig ? { figure_height_px: Math.floor(fig * k) } : { width_px: Math.floor(aw * k), height_px: Math.floor(ah * k) }, route,
    delegated_to_components: route === "IDENTITY_MASTER_THEN_SOURCE_ATTACHED_COMPONENTS" ? components : [],
    component_requirements: mine.map((r) => ({ component: r.component, measure: r.measure, min_native_px: r.min_native_px, basis: r.basis, source: r.source })),
    projected_screen_px: "DERIVED_AT_MOTION_PLAN (measured camera exposure; never assumed here)", native_rule: "only the delivered pixels of the job that owns a component count; upscaled or resampled pixels never satisfy a requirement",
    requirements_file: reqs.file, requirements_sha256: reqs.sha256 };
  return { ...c, key: `${c.requested_canvas}|${sha(JSON.stringify(c))}` };
}

/** the text the request carries so the artist receives ONE consistent size statement (appended after the design's OUTPUT block) */
export function canvasSection(c) {
  if (c.route === "SOURCE_ATTACHED_COMPONENT_CROP") { const cc = c.component_crop; return [`## GENERATION CANVAS (engine resolution contract — source-attached high-resolution component)`,
    `Deliver exactly ${c.requested_canvas} px, lossless PNG, transparent background, never upscaled or resized.`,
    `Attached COMPONENT_SOURCE_CROP.png is the APPROVED master's exact pixels (crop ${cc.crop_box.join(",")}, master density). Redraw THIS component natively at the canvas, ${cc.scale_from_master}x the master density, preserving identity, construction, colour planes and the landmark layout (normalised positions: ${Object.entries(cc.landmarks_in_crop).map(([k, v]) => `${k} ${v.join(",")}`).join("; ")}).`,
    `Native requirement: ${cc.requirement.measure} >= ${cc.requirement.min_native_px} px in the delivered pixels (expected ~${cc.expected_delivered_span_px} px). New native edge detail is required: a smooth enlargement of the crop is refused at import.`].join("\n"); }
  if (!c.authored_target) return `## GENERATION CANVAS (engine resolution contract)
Deliver exactly ${c.requested_canvas} px (${c.canvas_orientation.toLowerCase()}), lossless PNG, unmodified and never upscaled.`;
  const fig = c.authored_target.figure_height_px;
  return [`## GENERATION CANVAS (engine resolution contract — this overrides any single-image reading of the OUTPUT block above)`,
    `Deliver exactly ${c.requested_canvas} px (${c.canvas_orientation.toLowerCase()}), lossless PNG, unmodified and never upscaled.${(c.accepted_canvases || []).length > 1 ? ` If the image tool returns its native ${c.accepted_canvases.slice(1).join(" or ")} for this request, return that image as delivered: never resize it.` : ""}`,
    fig ? `Draw the complete figure as large as the canvas allows: about ${c.expected_native.figure_height_px} px tall, with at least ${Math.round(CANVAS_MARGIN * 100)}% transparent margin top and bottom; nothing touches the edge.` : `Fill the canvas with the complete subject at about ${c.expected_native.width_px}x${c.expected_native.height_px} px of native detail; nothing touches the edge unless it is a plate that must bleed.`,
    c.route === "NATIVE_IN_ONE_IMAGE" ? "This image carries the authored target natively." : `The OUTPUT block is the assembled canonical target. This image is the IDENTITY MASTER at ${Math.round(c.fit_scale * 100)}% of that density; the remaining native detail is delivered later by source-attached component edits of this approved master${c.component_requirements.length ? ` (${c.component_requirements.map((r) => `${r.component}: ${r.measure} >= ${r.min_native_px} px native`).join("; ")})` : ""}. Do not compromise identity, proportion or construction to fit more detail here.`].join("\n");
}

/** the contract identity a generation digest carries in place of a bare provider size (an impossible contract has its own stable key) */
export function resolutionKey({ job, design, film = null, jobs = [], env = process.env }) {
  try { return resolutionContract({ job, design, film, jobs, env }).key; }
  catch (e) { if (e.code === "IMPOSSIBLE_RESOLUTION_REQUEST" || e.code === "COMPONENT_NATIVE_RESOLUTION_UNVERIFIED") return `${e.code}|${sha(String(e.human_readable_reason || e.message))}`; throw e; }
}
/** the requested canvas of a COMPILED generation (the contract written beside its stage requests) */
export function compiledCanvas(compiledDir) {
  const f = path.join(compiledDir, "RESOLUTION_CONTRACT.json");
  if (!fs.existsSync(f)) throw err("STALE_COMPILED_REQUEST", { reason: `${compiledDir} has no RESOLUTION_CONTRACT.json (compiled before the resolution contract): re-export`, producer: P, resume_at: "EXPORT" });
  return JSON.parse(fs.readFileSync(f, "utf8")).requested_canvas;
}

/** componentCrop — the crop plan from the master's REGISTERED pixels and reviewed landmarks (null until the master is registered) */
function componentCrop({ film, root, job, req, sizes }) {
  if (!film) return { ok: false, reason: "no film to read the master registration from" };
  const F = path.resolve(film), docF = path.join(F, "handoff", "ART_AND_MOTION_MANIFEST_V2.json"); if (!fs.existsSync(docF)) return { ok: false, reason: `the master ${root} is not registered yet (no compiled manifest)` };
  const doc = JSON.parse(fs.readFileSync(docF, "utf8")), m = (doc.assets || []).find((a) => a.id === root), rf = path.join(F, "registration", root, "MASTER_REGISTRATION_RECEIPT.json");
  if (!m?.file || !fs.existsSync(rf)) return { ok: false, reason: `the master ${root} is not registered yet; its crop is measured from the registered master's reviewed landmarks` };
  const rtext = fs.readFileSync(rf, "utf8"), rec = JSON.parse(rtext), mf = path.join(F, m.file);
  if (!fs.existsSync(mf) || sha(fs.readFileSync(mf)) !== m.sha256 || rec.source?.sha256 !== m.sha256) return { ok: false, reason: `the registration receipt of ${root} does not measure the current master bytes` };
  const plan = componentCropPlan({ masterPng: readPNG(mf), landmarks: rec.landmark_sidecar?.landmarks || {}, componentLandmarks: job.motion_context?.required_continuity_landmarks || [], requirement: req, canvases: [...new Set(sizes)] });
  return plan.feasible ? { ok: true, plan, master_file: m.file, master_sha256: m.sha256, receipt_sha256: sha(rtext) } : { ok: false, reason: plan.reason };
}
