// Stage-1 provenance gate (spec §4.1, Gate A).
// • Regions can be emitted ONLY inside a live call of a producer registered from the frozen CATALOG (bindings.mjs).
// • A region may only claim F-methods its producer is catalogued for (plus the methods of a region it explicitly re-emits).
// • Receipts record ACTUAL reads (traced proxy on the call's inputs, validation reads excluded), emitted region ids and footprints.
// • compose() accepts only regions emitted by a registered producer call; raw objects / forged ids never reach the renderer.
// Not a security boundary against code edits (a local registry cannot be): producer-contract edits require source-diff review.
import { tracked, OPAQUE } from "./core.mjs";
import { CATALOG, METHOD_IDS } from "./bindings.mjs";
import { RULES } from "./knowledge.mjs";
import crypto from "node:crypto";

const REGIONS = new WeakMap();           // region → {producerId, callId}
const REGISTERED = new Map();            // producerId → implementationHash
const FRAMES = [];                       // live producer call stack
const RECEIPTS = [];                     // every executed producer call this process
let CALL = 0;

/** registerProducer(id, impl) → traced wrapper. id must be in the frozen catalog; each id registers once. */
export function registerProducer(id, impl) {
  const c = CATALOG[id];
  if (!c) throw new Error(`registerProducer: "${id}" is not a catalogued producer (bindings.mjs)`);
  if (REGISTERED.has(id)) throw new Error(`registerProducer: "${id}" already registered`);
  if (typeof impl !== "function") throw new Error(`registerProducer(${id}): implementation function required`);
  const implementationHash = crypto.createHash("sha256").update(impl.toString()).digest("hex").slice(0, 16);
  REGISTERED.set(id, implementationHash);
  const wrapped = function (...args) {
    const log = new Set(), frame = { id, callId: ++CALL, methods: c.methods, regions: [] };
    FRAMES.push(frame);
    let res;
    try { res = impl.apply(this, args.map((a, i) => tracked(a, log, `in${i}`))); }
    finally { FRAMES.pop(); }
    const receipt = Object.freeze({ actualProducerId: id, callId: frame.callId, class: c.class, implementationHash, actualDecisionReads: Object.freeze([...log].sort()), emittedRegionIds: Object.freeze(frame.regions.map((r) => r.id)), sourceMethodsUsed: Object.freeze([...new Set(frame.regions.flatMap((r) => r.prov.method))]) });
    RECEIPTS.push(receipt);
    if (res && typeof res === "object" && !OPAQUE.has(res) && Object.isExtensible(res)) Object.defineProperty(res, "receipt", { value: receipt, enumerable: false });
    return res;
  };
  Object.defineProperty(wrapped, "producerId", { value: id });
  return wrapped;
}

/** emitRegion — callable only from inside a live registered producer call */
export function emitRegion(methods, fn, el, reads_ignored, opts = {}) {
  const frame = FRAMES.at(-1);
  if (!frame) throw new Error(`emitRegion(${[].concat(methods)}): no live registered producer call — regions cannot be minted outside a catalogued producer`);
  const ms = [].concat(methods);
  const inherited = opts.from && REGIONS.has(opts.from) ? opts.from.prov.method : [];
  for (const m of ms) {
    if (!METHOD_IDS.includes(m)) throw new Error(`emitRegion: unknown method id "${m}"`);
    if (!frame.methods.includes(m) && !inherited.includes(m)) throw new Error(`emitRegion: producer "${frame.id}" is not catalogued for ${m}`);
  }
  if (!el || typeof el.d !== "string" || !/^M/.test(el.d)) throw new Error(`emitRegion(${frame.id}): region needs computed path geometry "d"`);
  const { prov: _drop, ...clean } = el;
  const region = Object.freeze({ id: el.id || `${frame.id}_${frame.callId}_${frame.regions.length}`, layer: el.layer ?? 0, opacity: el.opacity ?? 1, ...clean, prov: Object.freeze({ method: Object.freeze(ms), fn, producerId: frame.id, callId: frame.callId }) });
  REGIONS.set(region, { producerId: frame.id, callId: frame.callId });
  OPAQUE.add(region);
  frame.regions.push(region);
  return region;
}
export const isMinted = (e) => !!e && REGIONS.has(e) && REGISTERED.has(REGIONS.get(e).producerId);
export const receipts = () => RECEIPTS.slice();
export const receiptsFor = (producerId) => RECEIPTS.filter((r) => r.actualProducerId === producerId);

/** compose a drawing from produced regions only; duplicate ids, unknown producers and raw objects are refused */
export function compose(name, elements) {
  const flat = elements.flat(Infinity).filter(Boolean);
  const bad = flat.filter((e) => !isMinted(e));
  if (bad.length) throw new Error(`compose(${name}): ${bad.length} element(s) were not emitted by a registered producer call (e.g. ${JSON.stringify(bad[0]).slice(0, 120)}).`);
  const ids = new Set(); for (const e of flat) { if (ids.has(e.id)) throw new Error(`compose(${name}): duplicate region id ${e.id}`); ids.add(e.id); }
  RULES.F62_universal_outline(flat, `compose(${name})`);
  const sorted = [...flat].sort((a, b) => a.layer - b.layer);
  const methods = {}; for (const e of sorted) for (const m of e.prov.method) (methods[m] ||= []).push(e.id);
  const drawing = Object.freeze({ name, elements: Object.freeze(sorted), methods });
  OPAQUE.add(drawing);
  return drawing;
}

/** SVG serialisation (for inspection / runtime); only composed drawings */
export function toSVG(drawing, [x, y, w, h] = [0, 0, 1920, 1080], bg = null) {
  if (!drawing || !drawing.elements || !OPAQUE.has(drawing)) throw new Error("toSVG: needs compose() output");
  const defs = [], body = [];
  for (const e of drawing.elements) {
    let clip = "";
    if (e.clip) { const cid = `c_${e.id.replace(/[^\w-]/g, "_")}`; defs.push(`<clipPath id="${cid}"><path d="${e.clip}" clip-rule="evenodd"/></clipPath>`); clip = ` clip-path="url(#${cid})"`; }
    const paint = e.stroke ? `fill="none" stroke="${e.stroke}" stroke-width="${e.strokeWidth || 2}" stroke-linecap="round" stroke-linejoin="round"` : `fill="${e.fill}" fill-rule="evenodd"`;
    body.push(`<path id="${e.id}" data-method="${e.prov.method.join(",")}" data-producer="${e.prov.producerId}" d="${e.d}" ${paint} opacity="${e.opacity}"${clip}/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${x} ${y} ${w} ${h}" width="${w}" height="${h}">${bg ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${bg}"/>` : ""}<defs>${defs.join("")}</defs>${body.join("")}</svg>`;
}

/** stable signature of every element's geometry+paint (proof harness) */
export function signature(elements) {
  const s = {};
  for (const e of [].concat(elements).flat(Infinity).filter(Boolean)) s[e.id] = `${e.d}|${e.fill || ""}|${e.stroke || ""}|${e.opacity}|${e.clip || ""}|${e.layer}`;
  return s;
}
