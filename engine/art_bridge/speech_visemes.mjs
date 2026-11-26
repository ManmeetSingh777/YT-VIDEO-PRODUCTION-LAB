// P08 C03 — real visemes from MEASURED phone alignment. Input is a SPEECH_ALIGNMENT v1 record per spoken cue: the exact take (WAV sha256),
// the phone-level aligner (tool/version/acoustic model/dictionary), the source-file sample interval of every word and phone, and the placement
// of the trimmed source on the film clock. Nothing is inferred from text: no evenly spaced vowels, no typed timestamps.
//   film sample clock: sr / fps samples per frame (48000 / 60 = 800); absolute sample = file sample − file_in_sample + timeline_clip_start_sample
//   visible viseme at frame f = the phone containing the frame's MIDPOINT sample (f·spf + spf/2); silence → REST
//   bilabial closures (MBP) shorter than a frame are forced visible on the frame nearest their centre and REPORTED (subframe ambiguity);
//   any other phone that no midpoint lands in is reported as SUBFRAME_PHONE_NOT_VISIBLE (never silently dropped)
// The visible drawing is the tuple (view, emotion-conditioned mouth family, viseme) → an approved MOUTH-channel state whose `face` record says
// exactly that; an unused combination is never demanded (no Cartesian explosion), a missing used one is MISSING_ART_ASSET with the tuple.
import { err } from "./errors.mjs";
const P = "engine/art_bridge/speech_visemes.mjs";
export const SPEECH_ALIGNMENT_VERSION = "1.0.0";
/** versioned English ARPAbet → viseme inventory (stress digits stripped). CHJ is distinct from NARROW (lip rounding/protrusion is visible). */
export const VISEME_INVENTORY = Object.freeze({ id: "EN_ARPABET_VISEME_V1", version: "1.0.0", language: "en-US", phone_set: "ARPAbet (MFA english_us_arpa)",
  categories: Object.freeze({ REST: ["sil", "sp", "spn", ""], MBP: ["M", "B", "P"], FV: ["F", "V"], TH: ["TH", "DH"], L: ["L"], NARROW: ["S", "Z", "T", "D", "N", "K", "G", "NG", "HH", "Y", "R"], CHJ: ["CH", "JH", "SH", "ZH"],
    AA: ["AA", "AE", "AH", "AY", "AW"], EE: ["IY", "IH", "EH", "EY"], OH: ["AO", "OW", "OY"], OO: ["UW", "UH", "W", "ER"] }) });
export const VISEMES = Object.freeze(Object.keys(VISEME_INVENTORY.categories));
const PHONE_TO = new Map(Object.entries(VISEME_INVENTORY.categories).flatMap(([v, ps]) => ps.map((p) => [p, v])));
const PHONE_ALIGNERS = /^(montreal forced aligner|mfa)$/i; // phone-level forced aligners accepted as MEASURED phone proof (word-only aligners are not)
const refuse = (code, o) => err(code, { record_id: o.record ?? null, frame_range: o.frame_range ?? null, reason: o.reason, producer: `${P}#${o.fn ?? "normalizeSpeechAlignment"}`, failed_invariant: o.invariant, required_art_or_operation: o.needed ? [].concat(o.needed) : [], details: { failed_invariant: o.invariant, ...(o.details || {}) } });
export const visemeOf = (phone, aliases = {}) => { const p = String(phone ?? "").replace(/\d+$/, ""); const v = PHONE_TO.get(p) ?? (p.toLowerCase() === "sil" ? "REST" : null); return v && aliases[v] ? aliases[v] : v; };
/** normalizeSpeechAlignment(rec, {audioSha, oovMap}) → {rec, errors}. Checks provenance, ordering, word containment and phone inventory. */
export function normalizeSpeechAlignment(rec, { audioSha = null, oovMap = {}, allowDiagnostic = false } = {}) {
  const e = [], no = (code, o) => e.push(refuse(code, { record: rec?.cue_id ?? "(speech)", ...o }));
  if (!rec || rec.schema_version !== SPEECH_ALIGNMENT_VERSION) { no("MISSING_WORD_ALIGNMENT", { invariant: "SPEECH_ALIGNMENT_V1", reason: `cue needs a SPEECH_ALIGNMENT ${SPEECH_ALIGNMENT_VERSION} record (measured phones), got ${rec?.schema_version ?? "none"}`, needed: "phone-level forced alignment of the exact take" }); return { rec: null, errors: e }; }
  const diag = rec.alignment_source === "DIAGNOSTIC_FIXTURE" && rec.aligner?.tool === "DIAGNOSTIC_FIXTURE";
  if (rec.alignment_source === "DIAGNOSTIC_FIXTURE" && !allowDiagnostic) no("MISSING_WORD_ALIGNMENT", { invariant: "NO_DIAGNOSTIC_ALIGNMENT_IN_PRODUCTION", reason: "a DIAGNOSTIC_FIXTURE phone schedule is accepted only in a DIAGNOSTIC run; production needs a measured phone alignment of the real take" });
  if (!diag && rec.alignment_source !== "MEASURED" && !(rec.alignment_source === "MEASURED_MANUAL_CORRECTED" && rec.correction_review?.receipt_id)) no("MISSING_WORD_ALIGNMENT", { invariant: "ALIGNMENT_MEASURED", reason: `alignment_source ${rec.alignment_source}: only MEASURED (or a reviewed manual correction with its receipt) can drive a mouth` });
  if (!diag && !PHONE_ALIGNERS.test(rec.aligner?.tool ?? "")) no("MISSING_WORD_ALIGNMENT", { invariant: "PHONE_LEVEL_ALIGNER", reason: `aligner ${rec.aligner?.tool ?? "none"} is not a phone-level forced aligner (word-only alignment is not phoneme proof)` });
  for (const k of ["version", "acoustic_model", "dictionary"]) if (!diag && !rec.aligner?.[k]) no("MISSING_WORD_ALIGNMENT", { invariant: "ALIGNER_PROVENANCE", reason: `aligner.${k} is required` });
  if (!/^[a-f0-9]{64}$/.test(rec.audio_sha256 || "")) no("AUDIO_INPUT_MISSING", { invariant: "TAKE_SHA", reason: "audio_sha256 of the exact take is required" });
  if (audioSha && rec.audio_sha256 !== audioSha) no("AUDIO_SYNC_MISMATCH", { invariant: "ALIGNMENT_OF_THIS_TAKE", reason: `alignment is of take ${rec.audio_sha256?.slice(0, 12)} but the cue plays ${audioSha.slice(0, 12)}` });
  if (rec.sample_rate !== 48000) no("AUDIO_SYNC_MISMATCH", { invariant: "SAMPLE_RATE_48K", reason: `sample_rate ${rec.sample_rate} (the film clock is 48 kHz)` });
  const pl = rec.placement || {}; if (!Number.isInteger(pl.file_in_sample) || !Number.isInteger(pl.timeline_clip_start_sample)) no("AUDIO_SYNC_MISMATCH", { invariant: "PLACEMENT_INTEGER_SAMPLES", reason: "placement.file_in_sample and placement.timeline_clip_start_sample must be integer samples" });
  const ph = rec.phones || [], wd = rec.words || []; if (!ph.length) no("MISSING_WORD_ALIGNMENT", { invariant: "PHONES_PRESENT", reason: "no measured phones" });
  for (let i = 0; i < ph.length; i++) { const p = ph[i]; if (!Number.isInteger(p.file_start_sample) || !Number.isInteger(p.file_end_sample) || !(p.file_end_sample > p.file_start_sample)) { no("MISSING_WORD_ALIGNMENT", { invariant: "PHONE_INTERVAL", reason: `phone ${i} ${p.phone}: needs integer source samples with end > start` }); continue; }
    if (i && p.file_start_sample < ph[i - 1].file_end_sample) no("MISSING_WORD_ALIGNMENT", { invariant: "PHONES_ORDERED_DISJOINT", reason: `phone ${i} ${p.phone} overlaps the previous phone` });
    if (p.file_start_sample < pl.file_in_sample) no("AUDIO_SYNC_MISMATCH", { invariant: "PHONE_INSIDE_TRIM", reason: `phone ${p.phone} starts at source ${p.file_start_sample}, before the trim-in ${pl.file_in_sample} (would play outside the clip)` });
    const v = visemeOf(p.phone) ?? (oovMap[p.phone] ? oovMap[p.phone] : null); if (!v) no("MISSING_WORD_ALIGNMENT", { invariant: "PHONE_IN_INVENTORY", reason: `phone "${p.phone}" is not in ${VISEME_INVENTORY.id} and has no approved OOV mapping`, needed: `an approved mapping for ${p.phone} or a corrected alignment` });
    if (wd.length && visemeOf(p.phone) !== "REST" && !wd.some((w) => w.file_start_sample <= p.file_start_sample && p.file_end_sample <= w.file_end_sample)) no("MISSING_WORD_ALIGNMENT", { invariant: "PHONE_INSIDE_A_WORD", reason: `phone ${p.phone} [${p.file_start_sample},${p.file_end_sample}) belongs to no measured word` }); }
  return { rec: e.length ? null : rec, errors: e };
}
export const absSample = (rec, s) => s - rec.placement.file_in_sample + rec.placement.timeline_clip_start_sample;
/** frameVisemes(rec, {fps, frames:[a,b), aliases, oovMap}) → {perFrame: [{frame, viseme, phone, forced}], ambiguities, phones_abs, spf} */
export function frameVisemes(rec, { fps = 60, frames, aliases = {}, oovMap = {} }) {
  const spf = rec.sample_rate / fps; if (!Number.isInteger(spf)) throw refuse("AUDIO_SYNC_MISMATCH", { record: rec.cue_id, fn: "frameVisemes", invariant: "INTEGER_SAMPLES_PER_FRAME", reason: `${rec.sample_rate}/${fps} is not an integer number of samples per frame` });
  const phones = rec.phones.map((p) => ({ phone: p.phone, a: absSample(rec, p.file_start_sample), b: absSample(rec, p.file_end_sample), v: visemeOf(p.phone, aliases) ?? oovMap[p.phone], uncertainty: p.uncertainty ?? null }));
  const at = (mid) => phones.find((p) => p.a <= mid && mid < p.b) || null, perFrame = [], ambiguities = [];
  for (let f = frames[0]; f < frames[1]; f++) { const mid = f * spf + spf / 2, p = at(mid); perFrame.push({ frame: f, viseme: p ? p.v : "REST", phone: p ? p.phone : null, forced: false }); }
  const idx = (f) => f - frames[0];
  for (const p of phones) { if (p.v === "REST") continue; const first = Math.ceil((p.a - spf / 2) / spf), last = Math.floor((p.b - 1 - spf / 2) / spf), shown = last >= first && perFrame.slice(Math.max(0, idx(first)), Math.max(0, idx(last) + 1)).some((x) => x.phone === p.phone);
    if (shown) continue; const g = Math.min(frames[1] - 1, Math.max(frames[0], Math.floor((p.a + p.b) / 2 / spf)));
    if (p.v === "MBP" && !perFrame[idx(g)].forced) { ambiguities.push({ phone: p.phone, samples: [p.a, p.b], frame: g, displaced: perFrame[idx(g)].phone, kind: "CLOSURE_SHORTER_THAN_A_FRAME_FORCED_VISIBLE" }); perFrame[idx(g)] = { frame: g, viseme: "MBP", phone: p.phone, forced: true }; }
    else ambiguities.push({ phone: p.phone, samples: [p.a, p.b], frame: g, kind: p.v === "MBP" ? "CLOSURE_COLLISION_NOT_VISIBLE" : "SUBFRAME_PHONE_NOT_VISIBLE" }); }
  return { perFrame, ambiguities, phones_abs: phones, spf };
}
/** mouthTupleMap(channel) → Map("view|family|viseme" → state id) from the approved MOUTH states' face records */
export function mouthTupleMap(ch) { const m = new Map(); for (const s of ch.states || []) if (s.face?.viseme && s.face?.family) m.set(`${s.face.view_id ?? "*"}|${s.face.family}|${s.face.viseme}`, s.id); return m; }
export const tupleState = (map, view, family, viseme) => map.get(`${view}|${family}|${viseme}`) ?? map.get(`*|${family}|${viseme}`) ?? null;
/** importMfaTiming(timing, selection) → SPEECH_ALIGNMENT v1 record from the supplied MFA timing JSON + take selection (seconds → exact samples) */
export function importMfaTiming(timing, sel, { actorRigId, cueId }) {
  const sr = timing.audio.sample_rate, S = (s) => Math.round(s * sr);
  return { schema_version: SPEECH_ALIGNMENT_VERSION, cue_id: cueId ?? sel.cue_id, actor_rig_id: actorRigId, take_id: timing.take_id, audio_sha256: timing.audio.sha256, sample_rate: sr, alignment_source: "MEASURED",
    aligner: { tool: timing.aligner.tool, version: timing.aligner.version, acoustic_model: timing.aligner.acoustic_model, dictionary: timing.aligner.dictionary, frame_shift_s: timing.aligner.frame_shift_s },
    placement: { file_in_sample: sel.file_in_sample, timeline_clip_start_sample: sel.timeline_clip_start_sample, file_out_sample_exclusive: sel.file_out_sample_exclusive ?? null },
    words: timing.words.map((w) => ({ word: w.word, file_start_sample: S(w.start), file_end_sample: S(w.end) })), phones: timing.phones.map((p) => ({ phone: p.phone, file_start_sample: S(p.start), file_end_sample: S(p.end) })) };
}
