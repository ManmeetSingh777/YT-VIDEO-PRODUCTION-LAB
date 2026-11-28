#!/usr/bin/env node
// Re-run the rig fit on an existing approved master registration (no pixels, landmarks or approvals change): engine art_intake.refitMaster.
//   node tools/tbo/e01_refit_master.mjs --film films/e01 --asset ART_P03.MASTER
import path from "node:path"; import url from "node:url";
const REPO = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), "..", ".."), arg = (k) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : null; };
const I = await import(url.pathToFileURL(path.join(REPO, "engine/art_bridge/art_intake.mjs"))); console.log(JSON.stringify(I.refitMaster({ film: path.resolve(REPO, arg("film")), asset: arg("asset") }), null, 1));
