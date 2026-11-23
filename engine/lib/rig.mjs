// Build-time rig constructor: an episode-specific character/object spec → nested SVG joint groups + runtime meta.
// Nothing here is a character design. Every identity supplies its own joints, proportions, drawings, states.
//
// spec = {
//   place: {x, y, scale=1, flip=false},              // container in STAGE space (the rig's parent group)
//   joints: [{name, parent, at:[x,y], lag, z}],       // parent-child anatomy; `at` = pivot in parent space;
//                                                      // the CHILD's `at` is also the bone vector used by IK
//   parts:  [{joint, z, svg} | {joint, z, surf:{id,d,base,shade,hi,k,hk,rim,inner}}
//            | {joint, z, morph:{name, id, base, targets:{t:d}, n, surf:{...fills}|fill}}],
//   limbs:  [{id, chain:[a,b,c], w:[w0,w1,w2], z, base, shade, k, ext}],   // contour regenerated from joints
//   sockets:{name:{joint, at:[x,y], r}},               // contact points for props / IK targets
//   controls:{chan:[[targetChannel, gain],...]},       // macro controls: lookX → pupils+face shift, squash → ...
//   expr:   {name:{channel:value}},                   // expression/pose presets (pose(t,"worried"))
//   idle:   [[channel, amp, freqHz, phase]],           // breathing etc. (procedural, deterministic)
//   blink:  {chans:["lid:closed"], every, dur, seed},
//   follow: [{joint, src, gain, tau, freq}],           // damped-spring secondary motion
//   swaps:  {chan:[idA,idB,...]},                      // registered alternate drawings selected by channel index
//   rest:   {channel:value}, lag:{channel:sec}
// }
import { surf } from "./style.mjs";
import { morphable, template, sameTopology } from "./geom.mjs";

const f1 = (v) => +(+v).toFixed(2);

export function defineRig(P, spec) {
  const J = {}, kids = {}, roots = [], clipK = {};
  for (const j of spec.joints) {
    if (J[j.name]) throw new Error(`rig ${P}: duplicate joint ${j.name}`);
    J[j.name] = { parent: j.parent || null, at: j.at || [0, 0], lag: j.lag || 0, z: j.z || 0 };
    if (j.clipKids) clipK[j.name] = j.clipKids; // children of this joint are clipped by one of its own parts (pupil inside eye white)
    if (j.parent) (kids[j.parent] = kids[j.parent] || []).push(j.name); else roots.push(j.name);
  }
  for (const n in J) if (J[n].parent && !J[J[n].parent]) throw new Error(`rig ${P}: joint ${n} has unknown parent ${J[n].parent}`);
  const order = [];
  const visit = (n) => { order.push(n); (kids[n] || []).forEach(visit); };
  roots.forEach(visit);

  const meta = {
    prefix: P, joints: J, order, scale: spec.place?.scale || 1, flip: !!spec.place?.flip,
    rest: spec.rest || {}, lag: spec.lag || {}, controls: spec.controls || null, expr: spec.expr || {},
    idle: spec.idle || null, blink: spec.blink || null, follow: spec.follow || null, sockets: spec.sockets || {},
    morphs: {}, surfs: [], limbs: [], swaps: spec.swaps ? Object.fromEntries(Object.entries(spec.swaps).map(([k, ids]) => [k, ids.map((i) => P + i)])) : null,
  };
  const items = {}; // joint -> [{z, svg}]
  const push = (joint, z, svg) => { if (!J[joint]) throw new Error(`rig ${P}: part on unknown joint ${joint}`); (items[joint] = items[joint] || []).push({ z: z || 0, svg }); };

  for (const p of spec.parts || []) {
    if (p.svg !== undefined) push(p.joint, p.z, p.svg);
    else if (p.surf) {
      const s = p.surf, id = P + s.id;
      push(p.joint, p.z, surf(id, s.d, s));
      if (s.lit !== false) meta.surfs.push({ id, joint: p.joint, k: s.k ?? 10, hk: s.hk || 0 });
    } else if (p.morph) {
      const m = p.morph, id = P + m.id, names = Object.keys(m.targets);
      let paths = [m.base, ...names.map((n) => m.targets[n])];
      if (!paths.every((d) => sameTopology(paths[0], d))) paths = morphable(paths, m.n || 40, m.tension ?? 1);
      const b = template(paths[0]);
      const d = {};
      names.forEach((n, i) => { const t = template(paths[i + 1]).nums; d[n] = t.map((v, k) => f1(v - b.nums[k])); });
      if (m.surf) {
        push(p.joint, p.z, surf(id, paths[0], m.surf));
        if (m.surf.lit !== false) meta.surfs.push({ id, joint: p.joint, k: m.surf.k ?? 8, hk: m.surf.hk || 0 });
        meta.morphs[m.name] = { el: id + "-d", tpl: b.tpl, base: b.nums, d };
      } else {
        push(p.joint, p.z, `<path id="${id}" d="${paths[0]}" fill="${m.fill || "#000"}" ${m.attrs || ""}/>`);
        meta.morphs[m.name] = { el: id, tpl: b.tpl, base: b.nums, d };
      }
    }
  }
  for (const lb of spec.limbs || []) {
    const par = J[lb.chain[0]].parent;
    if (!par) throw new Error(`rig ${P}: limb ${lb.id} needs a parent joint above ${lb.chain[0]}`);
    const id = P + lb.id;
    push(par, lb.z, surf(id, "M0,0 L1,0 L1,1Z", { base: lb.base, shade: lb.shade || lb.base, k: lb.k ?? 9, lit: lb.k !== 0, inner: lb.inner || "" }));
    meta.limbs.push({ geo: id + "-d", lit: id + "-L", chain: lb.chain, w: lb.w, ext: lb.ext || 0, shade: lb.k ?? 9 });
  }

  const build = (n) => {
    const own = (items[n] || []).map((it, i) => ({ z: it.z, i, svg: it.svg }));
    let ch = (kids[n] || []).map((k, i) => ({ z: J[k].z, i: 1000 + i, svg: build(k) }));
    if (clipK[n] && ch.length) ch = [{ z: Math.max(...ch.map((c) => c.z)), i: 1000, svg: `<defs><clipPath id="${P}${n}-kc"><use href="#${P}${clipK[n]}"/></clipPath></defs><g clip-path="url(#${P}${n}-kc)">${ch.sort((a, b) => a.z - b.z).map((c) => c.svg).join("")}</g>` }];
    const all = own.concat(ch).sort((a, b) => a.z - b.z || a.i - b.i).map((x) => x.svg).join("");
    const [x, y] = J[n].at;
    return `<g id="${P}${n}" data-b="${x},${y}" transform="translate(${x} ${y})">${all}</g>`;
  };
  const pl = spec.place || { x: 0, y: 0 };
  const sc = meta.scale, fl = meta.flip ? -1 : 1;
  const svg = `<g id="${P}rig" data-b="${pl.x || 0},${pl.y || 0}" transform="translate(${pl.x || 0} ${pl.y || 0})" ${spec.focal !== false ? "data-focal" : ""}><g id="${P}place" transform="scale(${sc * fl} ${sc})">${roots.map(build).join("")}</g></g>`;
  return { svg, meta };
}

/** A prop that can be attached to a rig socket: outer group (written by MN attach), inner group free for its own tracks. */
export function prop(id, x, y, inner, { focal = true } = {}) {
  return `<g id="${id}" transform="translate(${x} ${y})" ${focal ? "data-focal" : ""}><g id="${id}-in" data-b="0,0">${inner}</g></g>`;
}
