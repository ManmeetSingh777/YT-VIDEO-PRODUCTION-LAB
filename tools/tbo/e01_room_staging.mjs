#!/usr/bin/env node
// E01: coherent room-space staging of the background actors (directive item 3) with engine/art_bridge/room_projection.mjs.
//  - horizon: vanishing point of the window wall's top and bottom edges (level lines receding from the back corner; the authorized construction);
//  - reference adult: Mia (directed SH01 head 174 px): registered cranium_top → measured sole on the approved master, under her staging;
//  - each background figure: measured on its registered art (head top, floor contact, knees, seat) → projected stature at scale 1;
//    seated figures use the standard seated ratio (head-to-floor = 0.78 of standing stature);
//  - decisions (film data, director-authorized 2026-11-28): indoor seated figures sit on ONE seating floor row (the occupancy group's measured
//    floor line) at their directed screen x, uniformly scaled by the projection; the queue stands outside behind the glass, where scale 1 is
//    correct at a deeper floor line that is still inside the window opening.
// Writes films/e01/environment/STAGING.json (read by env01_spec.mjs and by the packet amendment).   node tools/tbo/e01_room_staging.mjs --film films/e01
import fs from "node:fs"; import path from "node:path"; import url from "node:url";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), J = (f) => JSON.parse(fs.readFileSync(f, "utf8")), arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const FILM = path.resolve(REPO, arg("film")), doc = J(path.join(FILM, "handoff", "ART_AND_MOTION_MANIFEST_V2.json")), imp = (r) => import(url.pathToFileURL(path.join(REPO, r)));
const { horizonFromLines, roomProjection } = await imp("engine/art_bridge/room_projection.mjs"), { readPNG } = await imp("engine/art_bridge/png.mjs");
// ---- camera: window wall edges of the authorized construction (env01_spec.mjs WT0→WT1, WB0→WB1) ----
const WT = [[1186, 175], [1920, 40]], WB = [[1186, 440], [1920, 700]], H = horizonFromLines(WT, WB);
const staged = {}; for (const a of doc.actions) for (const x of a.actors || []) if (!staged[x.rig_id]) staged[x.rig_id] = { ...x, action: a.id };
const measure = (rigId) => { const r = doc.rigs.find((x) => x.id === rigId), I = doc.identities.find((i) => i.id === r.identity_id), a = doc.assets.find((x) => x.id === I.canonical_asset_id), p = readPNG(path.join(FILM, a.file)), m = a.crop_to_canonical_matrix, s = m[0], rest = r.joints.find((j) => !j.parent_id).rest_xy;
  let y0 = Infinity, y1 = -Infinity, x0 = Infinity, x1 = -Infinity; for (let y = 0; y < p.height; y++) for (let x = 0; x < p.width; x++) if (p.rgba[(y * p.width + x) * 4 + 3] > 128) { if (y < y0) y0 = y; if (y > y1) y1 = y; if (x < x0) x0 = x; if (x > x1) x1 = x; }
  const C = (x, y) => [x * s + m[4] - rest[0], y * s + m[5] - rest[1]]; // offset from the rig root at scale 1 (canonical px)
  return { rigId, top: C(0, y0)[1], floor: C(0, y1)[1], left: C(x0, 0)[0], right: C(x1, 0)[0], support: I.landmarks.support_point ? [I.landmarks.support_point[0] - rest[0], I.landmarks.support_point[1] - rest[1]] : null, staging: staged[rigId] }; };
// ---- reference adult: Mia ----
const mia = doc.rigs.find((r) => r.id === "CHAR_MIA"), miaI = doc.identities.find((i) => i.id === "CHAR_MIA"), miaRest = mia.joints.find((j) => !j.parent_id).rest_xy, miaSt = staged.CHAR_MIA, mm = measure("CHAR_MIA");
const crown = miaSt.root_world_xy[1] + (miaI.landmarks.cranium_top[1] - miaRest[1]), sole = miaSt.root_world_xy[1] + mm.floor, P = roomProjection({ horizon: H.horizon, reference: { stature_px: sole - crown, floor_y: sole } });
// ---- background figures ----
const SEATED = { BG_DINER_A: true, BG_DINER_B: true, BG_OCCUPANCY: true, BG_QUEUE: false }, SEATED_RATIO = 0.78;
const fig = Object.fromEntries(Object.keys(SEATED).map((id) => { const m = measure(id), h = m.floor - m.top; return [id, { ...m, head_to_floor: h, P0: SEATED[id] ? h / SEATED_RATIO : h }]; }));
const seatingRow = fig.BG_OCCUPANCY.staging.root_world_xy[1] + fig.BG_OCCUPANCY.floor; // the occupancy group's measured floor line
const out = { generated_by: "tools/tbo/e01_room_staging.mjs", camera: { horizon_y: +H.horizon.toFixed(2), vanishing_point: H.vanishing_point.map((v) => +v.toFixed(2)), from: "window wall top/bottom edges of the authorized construction" },
  reference: { actor: "CHAR_MIA", crown_y: +crown.toFixed(2), sole_y: +sole.toFixed(2), stature_px: +(sole - crown).toFixed(2), k: +P.k.toFixed(5) }, seating_row_floor_y: +seatingRow.toFixed(2), actors: {} };
for (const [id, f] of Object.entries(fig)) { const before = f.staging.root_world_xy, curFloor = before[1] + f.floor;
  let floor_y, why; if (SEATED[id]) { floor_y = seatingRow; why = id === "BG_OCCUPANCY" ? "keeps its directed floor line (defines the seating row)" : "moved onto the seating row at its directed screen x"; }
  else { const deep = P.floorForStature(f.P0, [H.horizon + 1, curFloor]), x = before[0], sill = WB[0][1] + ((x - WB[0][0]) * (WB[1][1] - WB[0][1])) / (WB[1][0] - WB[0][0]), lintel = WT[0][1] + ((x - WT[0][0]) * (WT[1][1] - WT[0][1])) / (WT[1][0] - WT[0][0]);
    if (deep && deep <= sill && deep - f.P0 >= lintel) { floor_y = deep; why = `outside behind the glass: scale 1 is correct at this deeper floor line (window opening at x ${x}: ${lintel.toFixed(0)}–${sill.toFixed(0)})`; } else { floor_y = curFloor; why = "kept; scaled by the projection"; } }
  const st = P.stage({ P0: f.P0, rel: { floor: [0, f.floor] }, floor_y, root_x: before[0] });
  out.actors[id] = { before: { root_world_xy: before, scale: f.staging.root_scale ?? 1, floor_y: +curFloor.toFixed(2), projected_stature: +f.P0.toFixed(2), required_scale_there: +(P.statureAt(curFloor) / f.P0).toFixed(3) },
    after: { root_world_xy: st.root_world_xy.map((v) => +v.toFixed(2)), scale: +st.scale.toFixed(4), floor_y: +floor_y.toFixed(2), projected_stature: +st.stature_px.toFixed(2) }, why, seated: SEATED[id],
    measured_rel_scale1: { top: +f.top.toFixed(2), floor: +f.floor.toFixed(2), left: +f.left.toFixed(2), right: +f.right.toFixed(2), support: f.support } }; }
// furniture inputs for each seated diner (world, after staging): seat contact, knee front, floor, stature
for (const id of ["BG_DINER_A", "BG_DINER_B"]) { const a = out.actors[id], s = a.after.scale, r = a.after.root_world_xy, m = a.measured_rel_scale1;
  a.furniture = { seat: [+(r[0] + m.support[0] * s).toFixed(2), +(r[1] + m.support[1] * s).toFixed(2)], knee_x: +(r[0] + m.right * s).toFixed(2), floor_y: a.after.floor_y, stature: a.after.projected_stature, faces: 1 }; }
out.wall = { floor_y: 470, stature_at_wall: +P.statureAt(470).toFixed(2) };
fs.writeFileSync(path.join(FILM, "environment", "STAGING.json"), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out, null, 1));
