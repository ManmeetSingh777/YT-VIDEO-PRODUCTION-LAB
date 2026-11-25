// Decoder QA (TBO-G15): judges RENDERED PIXELS against the model, never the plan against itself. For every sampled frame, the bar the
// model demands (height |value|·px_per_unit, up for positive, down for negative, from the baseline) must be what the frame actually
// shows. A renderer that ignores a changed input ("graph frozen while the food cost changed"), reverses a sign, or shows a stale frame
// fails here with DECODER_INERT_OR_MISLEADING, naming the action, frame, expected and measured extents.
import { err } from "../art_bridge/errors.mjs";

const PR = "engine/decoder/decoder_qa.mjs";

/** measureBar(png, {x, baseline_y, colour, tol, halfWidth}) → {up_px, down_px}: contiguous run of the symbol colour above/below the baseline */
export function measureBar(png, { x, baseline_y, colour, tol = 40, halfWidth = 2 }) {
  const { width: W, height: H, rgba } = png, hit = (xx, yy) => { if (xx < 0 || yy < 0 || xx >= W || yy >= H) return false; const i = (yy * W + xx) * 4; return rgba[i + 3] > 200 && Math.abs(rgba[i] - colour[0]) <= tol && Math.abs(rgba[i + 1] - colour[1]) <= tol && Math.abs(rgba[i + 2] - colour[2]) <= tol; };
  const row = (yy) => { let n = 0; for (let dx = -halfWidth; dx <= halfWidth; dx++) if (hit(Math.round(x) + dx, yy)) n++; return n > halfWidth; };
  const b = Math.round(baseline_y); let up = 0, down = 0;
  for (let y = b - 1; y >= 0 && row(y); y--) up++;
  for (let y = b; y < H && row(y); y++) down++;
  return { up_px: up, down_px: down };
}

/**
 * verifyModelBarFrames({frames:[{frame, png}], placements:(frame)→placement from compiled.proceduralAt, bar:{action, baseline_xy, colour}, tolerance_px})
 * → {ok, rows, failures:[BridgeError]}. Expected extents come from the model through the compiled placement, measured extents from the pixels.
 */
export function verifyModelBarFrames({ frames, placementAt, bar, tolerance_px = 3 }) {
  const rows = [], failures = [];
  for (const { frame, png } of frames) {
    const pl = placementAt(frame);
    if (!pl) { failures.push(err("DECODER_INERT_OR_MISLEADING", { record_id: bar.action, frame_range: [frame, frame + 1], reason: `no model placement for ${bar.action} at frame ${frame}`, producer: `${PR}#verifyModelBarFrames`, details: { failed_invariant: "MODEL_BAR_EVALUATED" } })); continue; }
    const m = measureBar(png, { x: bar.baseline_xy[0], baseline_y: bar.baseline_xy[1], colour: bar.colour }), exp = pl.model.height_px;
    const expUp = pl.model.sign > 0 ? exp : 0, expDown = pl.model.sign < 0 ? exp : 0;
    const ok = Math.abs(m.up_px - expUp) <= tolerance_px && Math.abs(m.down_px - expDown) <= tolerance_px;
    rows.push({ frame, scenario: pl.model.scenario, value: pl.model.value, unit: pl.model.unit, expected_up_px: +expUp.toFixed(2), expected_down_px: +expDown.toFixed(2), measured_up_px: m.up_px, measured_down_px: m.down_px, ok });
    if (!ok) failures.push(err("DECODER_INERT_OR_MISLEADING", { record_id: bar.action, frame_range: [frame, frame + 1], reason: `frame ${frame} shows a bar of +${m.up_px}/-${m.down_px} px but model ${pl.model.model} (${pl.model.output} = ${+pl.model.value.toFixed(4)} ${pl.model.unit}, scenario ${pl.model.scenario}) demands +${expUp.toFixed(1)}/-${expDown.toFixed(1)} px`, producer: `${PR}#verifyModelBarFrames`, details: { failed_invariant: "RENDERED_BAR_MATCHES_MODEL", model_digest: pl.model.model_digest } }));
  }
  return { ok: !failures.length && rows.length > 0, rows, failures, checked_frames: rows.length };
}
