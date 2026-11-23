// Stage review: silhouette | parent masses | (later stages) — rendered from the SAME authored construction.
import { beekeeper } from "../subjects/beekeeper.mjs";
export function build(ctx) {
  process.env.MN_STAGE_PREVIEW = "1";
  const r = beekeeper({ ctx, place: [0, 0] });
  const pv = r.K.previewSVG();
  const fails = r.K.log.filter((l) => !l.pass).map((l) => `${l.method}: ${l.test} = ${l.value}`);
  const body = `<rect width="1920" height="1080" fill="#f4f1ea"/>
    <g transform="translate(330 1000)">${pv.sil}</g>
    <g transform="translate(960 1000)">${pv.sil.replace(/#111/, "#ddd")}${pv.parts}</g>
    ${fails.map((f, i) => `<text x="1300" y="${60 + i * 30}" font-size="20" fill="#b00">${f.replace(/</g, "&lt;")}</text>`).join("")}`;
  ctx.write({ bg: "#f4f1ea", body, script: "" });
}
