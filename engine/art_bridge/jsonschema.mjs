// Strict JSON Schema (Draft 2020-12) validator for the keywords used by schemas/motion_art_manifest_v2.schema.json. An unsupported keyword
// throws (never silently ignored), so the schema cannot claim a constraint this validator does not enforce.
const SUPPORTED = new Set(["$schema", "$id", "$defs", "$ref", "$comment", "title", "description", "type", "enum", "const", "required", "properties", "additionalProperties", "items", "prefixItems", "minItems", "maxItems", "minimum", "maximum", "exclusiveMinimum", "pattern", "minLength", "oneOf", "anyOf", "allOf", "if", "then", "else", "uniqueItems"]);
const typeOf = (v) => (v === null ? "null" : Array.isArray(v) ? "array" : Number.isInteger(v) ? "integer" : typeof v);
export function validate(schema, value, root = schema, path = "$", out = []) {
  if (schema === true) return out; if (schema === false) { out.push({ path, msg: "no value is allowed here (schema false)" }); return out; } // Draft 2020-12 boolean schemas
  for (const k of Object.keys(schema)) if (!SUPPORTED.has(k)) throw new Error(`jsonschema: unsupported keyword "${k}" at schema for ${path}`);
  if (schema.$ref) { const m = schema.$ref.match(/^#\/\$defs\/(.+)$/); if (!m || !root.$defs?.[m[1]]) throw new Error(`jsonschema: unresolved $ref ${schema.$ref}`); return validate(root.$defs[m[1]], value, root, path, out); }
  const t = typeOf(value), fail = (msg) => out.push({ path, msg });
  if (schema.type) { const ts = [].concat(schema.type); if (!ts.some((x) => x === t || (x === "number" && (t === "integer" || t === "number")))) { fail(`type ${t} is not ${ts.join("|")}`); return out; } }
  if (schema.const !== undefined && JSON.stringify(value) !== JSON.stringify(schema.const)) fail(`must equal ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.some((e) => JSON.stringify(e) === JSON.stringify(value))) fail(`must be one of ${schema.enum.join("|")}`);
  if ((t === "number" || t === "integer")) { if (!Number.isFinite(value)) fail("must be finite"); if (schema.minimum !== undefined && value < schema.minimum) fail(`< minimum ${schema.minimum}`); if (schema.maximum !== undefined && value > schema.maximum) fail(`> maximum ${schema.maximum}`); if (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum) fail(`<= exclusiveMinimum ${schema.exclusiveMinimum}`); }
  if (t === "string") { if (schema.minLength !== undefined && value.length < schema.minLength) fail(`shorter than ${schema.minLength}`); if (schema.pattern && !new RegExp(schema.pattern).test(value)) fail(`does not match ${schema.pattern}`); }
  if (t === "array") {
    if (schema.minItems !== undefined && value.length < schema.minItems) fail(`fewer than ${schema.minItems} items`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) fail(`more than ${schema.maxItems} items`);
    if (schema.uniqueItems && new Set(value.map((v) => JSON.stringify(v))).size !== value.length) fail("items not unique");
    (schema.prefixItems || []).forEach((s, i) => i < value.length && validate(s, value[i], root, `${path}[${i}]`, out));
    if (schema.items === false && value.length > (schema.prefixItems?.length || 0)) fail(`more than ${schema.prefixItems?.length || 0} items (items: false)`);
    else if (schema.items) value.forEach((v, i) => i >= (schema.prefixItems?.length || 0) && validate(schema.items, v, root, `${path}[${i}]`, out));
  }
  if (t === "object") {
    for (const r of schema.required || []) if (!(r in value)) fail(`missing required "${r}"`);
    for (const [k, v] of Object.entries(value)) {
      if (schema.properties?.[k]) validate(schema.properties[k], v, root, `${path}.${k}`, out);
      else if (schema.additionalProperties === false) fail(`unexpected property "${k}"`);
      else if (typeof schema.additionalProperties === "object") validate(schema.additionalProperties, v, root, `${path}.${k}`, out);
    }
  }
  if (schema.oneOf) { const ok = schema.oneOf.filter((s) => validate(s, value, root, path, []).length === 0).length; if (ok !== 1) fail(`must match exactly one alternative (matched ${ok})`); }
  if (schema.anyOf && !schema.anyOf.some((s) => validate(s, value, root, path, []).length === 0)) fail("must match at least one alternative");
  for (const s of schema.allOf || []) validate(s, value, root, path, out);
  if (schema.if !== undefined) { const holds = validate(schema.if, value, root, path, []).length === 0; if (holds && schema.then !== undefined) validate(schema.then, value, root, path, out); if (!holds && schema.else !== undefined) validate(schema.else, value, root, path, out); }
  return out;
}
