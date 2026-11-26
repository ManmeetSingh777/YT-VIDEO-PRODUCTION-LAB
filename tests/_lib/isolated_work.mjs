// Test isolation (P08 regression-efficiency addendum §3 / S3C-7): every MUTABLE test output goes to a directory owned by exactly one test
// process run. Nothing is shared between runs or between concurrently running test files, so stale records from an earlier run (the S3C-7
// cause) or a parallel file cannot leak into an assertion. Immutable shared fixtures are read from the repository, never written.
import fs from "node:fs"; import os from "node:os"; import path from "node:path"; import crypto from "node:crypto";
export const RUNS_ROOT = path.join(os.tmpdir(), "tbo-test-runs");
/** isolatedWork(name, {under}) → a fresh, empty directory unique to this process and call (under RUNS_ROOT, or under a given root when the
 *  consumer requires containment, e.g. host passes inside the film asset root) */
export function isolatedWork(name, { under = RUNS_ROOT } = {}) { const d = path.join(under, `${name.replace(/[^\w.-]+/g, "_")}-${process.pid}-${crypto.randomBytes(4).toString("hex")}`); fs.mkdirSync(d, { recursive: true }); return d; }
