// Executable construction rules that repair lessons can activate BEFORE a subject's geometry is authored.
// A lesson in REPAIR_MEMORY.json names `rule`; construct.author().learn() runs RULES[rule].apply(A, lesson)
// only when the lesson's applies_when matches the subject context. Each rule transforms DESIGN DECISIONS
// (which the geometry functions then consume), and returns the list of decisions it changed (receipt evidence).
import { contrast, mix } from "./construct.mjs";

export const RULES = {
  /** Q01 (foundation test): on a dark support, garment limb materials are raised above the support value;
      near limb to the full threshold, far limb to ~0.78× of it; the environment keeps the darkest role.
      Decision convention: palette.support (hex), palette.garment.<name> (hex), palette.garment.<name>.far (bool, optional). */
  garment_support_separation: {
    apply(A, lesson) {
      const support = A.decisions["palette.support"]?.value; if (!support) return [];
      const min = (lesson.params && lesson.params["style.limbSupportContrast"]) || 1.9;
      const toward = A.decisions["palette.garmentLift"]?.value || "#ffffff";
      const changed = [];
      for (const [k, d] of Object.entries(A.decisions)) {
        if (!/^palette\.garment\.[^.]+$/.test(k)) continue;
        const far = A.decisions[k + ".far"]?.value === true, target = far ? 1 + (min - 1) * 0.78 : min;
        let c = d.value, t = 0;
        while (contrast(c, support) < target && t < 0.9) { t += 0.02; c = mix(d.value, toward, t); }
        if (c !== d.value) { changed.push({ decision: k, from: d.value, to: c, contrast_before: +contrast(d.value, support).toFixed(2), contrast_after: +contrast(c, support).toFixed(2) }); d.value = c; d.by = [...new Set([...d.by, "F61", "F03"])]; d.why += ` | raised by lesson ${lesson.rule_id}`; }
      }
      return changed;
    },
  },
  /** Q04 (qual_A engineer): facial hair over an ACTING face's mouth region must separate by VALUE from the face plane,
      and the subject must place the mouth below it. Decision convention: palette.facialHair (hex), palette.skin (hex).
      Effect: rewrites palette.facialHair via separateFrom and sets face.mouthPlacement before geometry. */
  facial_hair_value_separation: {
    apply(A, lesson) {
      const fh = A.decisions["palette.facialHair"], sk = A.decisions["palette.skin"];
      if (!fh || !sk) return [];
      const min = (lesson.params && lesson.params["face.facialHairContrast"]) || 2.2, from = fh.value;
      const to = A.separateFrom("palette.facialHair", sk.value, min, (lesson.params && lesson.params.toward) || "#3e3a4c", { by: ["F03", "F61", "F65"], from: "palette.skin" });
      if (!A.decisions["face.mouthPlacement"]) A.decide("face.mouthPlacement", `separate dark mouth below the facial hair with a skin gap (lesson ${lesson.rule_id})`, { by: ["F65", "F05"] });
      return from !== to ? [{ decision: "palette.facialHair", from, to, contrast_after: +contrast(to, sk.value).toFixed(2) }] : [];
    },
  },
};
