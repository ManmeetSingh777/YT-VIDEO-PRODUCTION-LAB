// Real provider adapter + provider-access boundary (spec §11.5). Configuration-agnostic: the adapter only uses a provider the OPERATOR
// configured explicitly. It never hardcodes a model name, never fabricates credentials, never captures a browser login and never silently
// falls back to another image service. Capabilities come from (a) a live check that the configured model exists at the configured endpoint
// and (b) the operator's declared capability set for that model; nothing is inferred from a product name. With no configuration the
// NullProvider reports every capability false + the exact blocker, and the pipeline exports the WAITING_FOR_GPT_ART outbox instead.
//
// Configuration (environment):
//   IMAGE_PROVIDER=openai-images     IMAGE_PROVIDER_MODEL=<model id>     OPENAI_API_KEY=<key>     [OPENAI_BASE_URL=https://api.openai.com/v1]
//   IMAGE_PROVIDER_CAPS='{"generate":true,"edit":true,"transparentRaster":true,"svgGeneration":false,"multipleReferences":true,"maxOutputSize":[1536,1024]}'
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";

const sha = (b) => crypto.createHash("sha256").update(b).digest("hex");
const NONE = { generate: false, edit: false, transparentRaster: false, svgGeneration: false, multipleReferences: false };

export function discoverProvider(env = process.env) {
  const kind = env.IMAGE_PROVIDER || null, model = env.IMAGE_PROVIDER_MODEL || null;
  const report = { provider: kind, model, credentials_present: { OPENAI_API_KEY: !!env.OPENAI_API_KEY, AZURE_OPENAI_API_KEY: !!env.AZURE_OPENAI_API_KEY }, checked_at: new Date().toISOString() };
  if (!kind) return new NullProvider({ ...report, blocker: "IMAGE_PROVIDER is not configured in this environment; no authorized image-generation/edit provider is available to Claude Code" });
  if (kind !== "openai-images") return new NullProvider({ ...report, blocker: `IMAGE_PROVIDER=${kind} has no tested adapter; refusing to call an untested service` });
  if (!env.OPENAI_API_KEY) return new NullProvider({ ...report, blocker: "IMAGE_PROVIDER=openai-images but OPENAI_API_KEY is absent; credentials are never fabricated" });
  if (!model) return new NullProvider({ ...report, blocker: "IMAGE_PROVIDER_MODEL is not set; the adapter does not hardcode a model name" });
  let caps; try { caps = JSON.parse(env.IMAGE_PROVIDER_CAPS || "null"); } catch { caps = null; }
  if (!caps) return new NullProvider({ ...report, blocker: "IMAGE_PROVIDER_CAPS is not declared for the configured model; capabilities are not inferred from a name" });
  return new OpenAIImagesProvider({ ...report, base: (env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, ""), key: env.OPENAI_API_KEY, declared: caps });
}

export class NullProvider {
  constructor(report) { this.report = { ...report, live: false }; }
  async capabilities() { return { ...NONE, available: false, blocker: this.report.blocker }; }
  async generate(job) { throw Object.assign(new Error(`WAITING_FOR_GPT_ART: ${this.report.blocker}`), { code: "WAITING_FOR_GPT_ART", job: job?.artjob_id }); }
  async edit(job) { return this.generate(job); }
}

export class OpenAIImagesProvider {
  constructor(cfg) { this.cfg = cfg; this.report = { provider: cfg.provider, model: cfg.model, base: cfg.base, declared_capabilities: cfg.declared, live: null }; }
  async capabilities() {
    // live check: the configured model must exist for these credentials; declared caps are then used verbatim (one tested path per capability)
    const r = await fetch(`${this.cfg.base}/models/${encodeURIComponent(this.cfg.model)}`, { headers: { authorization: `Bearer ${this.cfg.key}` } });
    this.report.live = r.ok; this.report.model_check_status = r.status;
    if (!r.ok) return { ...NONE, available: false, blocker: `configured model ${this.cfg.model} not available (HTTP ${r.status})` };
    return { ...NONE, ...this.cfg.declared, available: true };
  }
  /** pre-request receipt (spec §11.5): written BEFORE the call */
  receipt(job, mode, attachments, reference, body) {
    return { artjob_id: job.artjob_id, provider: this.cfg.provider, model: this.cfg.model, mode, requested: { size: body.size, quality: body.quality ?? null, background: body.background ?? null, output_format: body.output_format ?? null },
      reference_hashes: reference ? [reference.sha256] : [], style_witness_hashes: attachments.map((a) => a.sha256), payload_sha256: sha(Buffer.from(JSON.stringify({ prompt: body.prompt, size: body.size, background: body.background }))), date: new Date().toISOString(), expected_output_type: body.output_format === "svg" ? "image/svg+xml" : "image/png" };
  }
  async #call(job, mode, prompt, attachments, reference, opts) {
    const caps = await this.capabilities();
    if (!caps.available || !caps[mode === "edit" ? "edit" : "generate"]) throw Object.assign(new Error(`provider cannot ${mode}: ${caps.blocker || "capability not declared"}`), { code: "WAITING_FOR_GPT_ART" });
    if (opts.transparent && !caps.transparentRaster) throw Object.assign(new Error("transparent raster requested but not supported by the configured model"), { code: "WAITING_FOR_GPT_ART" });
    const imgs = [...(reference ? [reference] : []), ...attachments];
    if (imgs.length > 1 && !caps.multipleReferences) throw Object.assign(new Error("multiple reference images not supported; refusing to drop style witnesses silently"), { code: "WAITING_FOR_GPT_ART" });
    for (const a of imgs) if (sha(fs.readFileSync(a.path)) !== a.sha256) throw Object.assign(new Error(`attachment hash mismatch ${a.path}`), { code: "UNQUALIFIED_STYLE_ASSET" });
    const body = { model: this.cfg.model, prompt, size: opts.size || (() => { throw new Error("image request without a size: the job resolution contract must supply it (no default)"); })(), ...(opts.transparent ? { background: "transparent", output_format: "png" } : { output_format: "png" }) };
    const receipt = this.receipt(job, mode, attachments, reference, body); fs.mkdirSync(opts.outDir, { recursive: true }); fs.writeFileSync(path.join(opts.outDir, "PROVIDER_REQUEST_RECEIPT.json"), JSON.stringify(receipt, null, 1));
    let res;
    if (imgs.length) { const fd = new FormData(); for (const [k, v] of Object.entries(body)) fd.append(k, String(v)); for (const a of imgs) fd.append("image[]", new Blob([fs.readFileSync(a.path)]), path.basename(a.path)); res = await fetch(`${this.cfg.base}/images/edits`, { method: "POST", headers: { authorization: `Bearer ${this.cfg.key}` }, body: fd, signal: AbortSignal.timeout(opts.timeoutMs || 300000) }); }
    else res = await fetch(`${this.cfg.base}/images/generations`, { method: "POST", headers: { authorization: `Bearer ${this.cfg.key}`, "content-type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(opts.timeoutMs || 300000) });
    let json; try { json = await res.json(); } catch { json = {}; }
    if (!res.ok) throw Object.assign(new Error(`provider HTTP ${res.status}: ${JSON.stringify(json).slice(0, 300)}`), { code: "PROVIDER_EXECUTION_ERROR", retryable: res.status >= 500 || res.status === 429 });
    const outputs = (json.data || []).map((d, i) => { const buf = Buffer.from(d.b64_json, "base64"), f = path.join(opts.outDir, `${job.artjob_id}__out${i}.png`); fs.writeFileSync(f, buf); return { file: f, sha256: sha(buf), bytes: buf.length }; });
    const result = { ...receipt, outputs, attachments_sent: imgs.length, response_meta: { created: json.created ?? null, acknowledged_input_images: json.usage?.input_images ?? null }, status: outputs.length ? "PIXELS_RECEIVED_PENDING_REGISTRATION_AND_REVIEW" : "NO_OUTPUT" };
    fs.writeFileSync(path.join(opts.outDir, "PROVIDER_RESULT.json"), JSON.stringify(result, null, 1));
    return result;
  }
  generate(job, attachments, opts) { return this.#call(job, "generate", opts.prompt, attachments, null, opts); }
  edit(job, reference, attachments, opts) { return this.#call(job, "edit", opts.prompt, attachments, reference, opts); }
}
