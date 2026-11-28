// SG-1: the storage guard reports real free space and refuses a write that would not fit with its margin.
import test from "node:test"; import assert from "node:assert/strict"; import os from "node:os"; import { freeBytes, requireFree, GB } from "../../engine/production/storage_guard.mjs";
test("SG-1 storage guard", () => { const f = freeBytes(os.tmpdir()); assert.ok(f > 0); assert.doesNotThrow(() => requireFree(os.tmpdir(), 1, { margin: 0 })); assert.throws(() => requireFree(os.tmpdir(), f + 10 * GB), /STORAGE_INSUFFICIENT|needs/); });
