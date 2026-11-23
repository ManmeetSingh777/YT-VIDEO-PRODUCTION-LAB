/* Art-bridge browser runtime. Binds a baked, frame-indexed table to the PRESERVED nu.js scene through S.at — nu.js is not modified.
   Every runtime-owned element is written on every frame (transform via "a:transform", visibility via "vis", opacity via "o"), so a seek to
   any frame produces the same DOM regardless of the previous frame. No per-frame IO, generation or cumulative state. */
(function () {
  var bound = null, override = null, overrideTag = null, lastT = 0;
  function bind(S, baked) {
    bound = S;
    var ids = baked.ids, frames = baked.frames, fps = baked.fps, first = baked.first_frame;
    S.at(function (t) {
      lastT = t;
      if (override) { for (var j = 0; j < override.length; j++) { var o = override[j]; S.set(o[0], "a:transform", o[1]); S.set(o[0], "vis", o[2] === 1); S.set(o[0], "o", o[3]); } window.__artbFrame = overrideTag; return; }
      var f = Math.round(t * fps) - first; if (f < 0) f = 0; if (f >= frames.length) f = frames.length - 1;
      var row = frames[f];
      for (var i = 0; i < ids.length; i++) { var r = row[i]; S.set(ids[i], "a:transform", r[0]); S.set(ids[i], "vis", r[1] === 1); S.set(ids[i], "o", r[2]); }
      window.__artbFrame = f + first;
    });
  }
  function preload(urls) {
    return Promise.all(urls.map(function (u) { var im = new Image(); im.src = u; return im.decode().then(function () { return { u: u, ok: true, w: im.naturalWidth, h: im.naturalHeight }; }, function (e) { return { u: u, ok: false, e: String(e) }; }); }));
  }
  /* sub-frame compositing (shutter samples): apply one row set computed by the same scene for a fractional time; the next seek restores
     the integer frame, so no state accumulates */
  /* P02 repair: nu.js S.set only STAGES values; S.render(t) clears staged state and re-runs the S.at hooks, which re-apply the baked frame. A
     sub-frame row set must therefore be applied as a one-shot OVERRIDE consumed by the bound S.at hook inside a real S.render pass (the previous
     version staged values that were never written, so shutter samples never reached the DOM). */
  function applyRows(rows, tag) { override = rows; overrideTag = tag; try { bound.render(lastT); } finally { override = null; overrideTag = null; } window.__artbFrame = tag; }
  window.ARTB = { bind: bind, preload: preload, applyRows: applyRows };
})();
