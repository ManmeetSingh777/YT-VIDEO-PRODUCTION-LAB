// Word-cue timing (spec §5.7, §7.5 "Break a word cue → MISSING_WORD_ALIGNMENT"). A critical event bound to narration resolves to an exact
// 60-fps frame ONLY from measured word timing (forced alignment / measured). Estimated or sentence-average timing cannot certify it.
// Cue syntax (as in films/*/direction EPISODE files): 's1:"word"' | 's1:"word"+0.3' | 's1:"word"-0.7' | 's1:"word"#2' (2nd occurrence) | '12.5' (absolute s).
import { err } from "./errors.mjs";

const MEASURED = new Set(["forced_alignment", "measured", "aligned"]);
const norm = (w) => w.toLowerCase().replace(/[^a-z0-9']/g, "");
export function resolveCue(cue, words, { fps = 60, critical = true, record_id = null } = {}) {
  if (/^-?\d+(\.\d+)?$/.test(String(cue).trim())) return { frame: Math.round(+cue * fps), seconds: +cue, method: "absolute" };
  const m = /^(\w+):"([^"]+)"(?:#(\d+))?\s*([+-]\s*\d+(?:\.\d+)?)?$/.exec(String(cue).trim());
  if (!m) throw err("MISSING_WORD_ALIGNMENT", { record_id, reason: `cue ${cue} is not a valid word cue` });
  const [, sid, word, nth, off] = m, list = words?.[sid];
  if (!list) throw err("MISSING_WORD_ALIGNMENT", { record_id, dependency: sid, reason: `no word timing for sentence ${sid}` });
  const hits = list.filter((w) => norm(w.w) === norm(word)), hit = hits[(+nth || 1) - 1];
  if (!hit) throw err("MISSING_WORD_ALIGNMENT", { record_id, dependency: `${sid}:${word}`, reason: `word "${word}" not found in ${sid} (occurrence ${nth || 1})` });
  if (critical && !MEASURED.has(hit.method)) throw err("MISSING_WORD_ALIGNMENT", { record_id, dependency: `${sid}:${word}`, reason: `word timing method is "${hit.method}"; a critical event needs measured/forced-aligned timing, not an estimate`, details: { start: hit.start, method: hit.method } });
  const t = hit.start + (off ? parseFloat(off.replace(/\s/g, "")) : 0);
  return { frame: Math.round(t * fps), seconds: t, method: hit.method, word: hit.w };
}
/** resolveEventCues(events, words) → {resolved, errors}: every critical event cue checked; nothing is guessed */
export function resolveEventCues(events, words, opts = {}) {
  const resolved = [], errors = [];
  for (const e of events) { try { resolved.push({ id: e.id, cue: e.at, ...resolveCue(e.at, words, { ...opts, critical: e.critical !== false, record_id: e.id }) }); } catch (x) { if (!x.code) throw x; errors.push(x.toJSON()); } }
  return { resolved, errors };
}
