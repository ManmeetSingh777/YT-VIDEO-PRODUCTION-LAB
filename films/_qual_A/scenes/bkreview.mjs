// FIRST-PASS REVIEW of the new subject: silhouette | parent topology | full construction (+ smoker on the grip socket)
import { beekeeper } from "../subjects/beekeeper.mjs";
import { smoker } from "../subjects/smoker.mjs";
export function build(ctx) {
  const a = beekeeper({ ctx, prefix: "rv-a-", place: [300, 1020] }); a.out();
  const pv = a.K.previewSVG();
  const b = beekeeper({ ctx, prefix: "rv-b-", place: [760, 1020] }); b.out();
  const pb = b.K.previewSVG();
  const c = beekeeper({ ctx, prefix: "rv-c-", place: [1340, 1020] }); const C = c.out();
  const S = smoker({ ctx, prefix: "rv-sm-" });
  const body = `<rect width="1920" height="1080" fill="#9fc48a"/><rect y="760" width="1920" height="320" fill="#7fae6a"/>
    <g>${pv.sil}</g><g>${pb.parts}</g>${C.svg}${S.svg}${C.front}`;
  const script = `MN.setLight(S, -50);
    const bk = MN.rig(S, RIGS.bk, {}); const sm = MN.rig(S, RIGS.sm, {});
    bk.attach(${JSON.stringify(S.P + "rig")}, "grip", -1, 1e9, {});`;
  ctx.write({ bg: "#9fc48a", body, script, rigs: { bk: C.meta, sm: S.meta } });
}
