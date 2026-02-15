import test from "node:test";
import assert from "node:assert/strict";

function extractDeviceRequestIds(text) {
  const s = String(text || "");
  const out = new Set();

  // Common patterns: requestId=XYZ, requestId: XYZ, "requestId":"XYZ".
  for (const m of s.matchAll(/requestId\s*(?:=|:)\s*([A-Za-z0-9_-]{6,})/g)) out.add(m[1]);
  for (const m of s.matchAll(/"requestId"\s*:\s*"([A-Za-z0-9_-]{6,})"/g)) out.add(m[1]);
  // Table output from `openclaw devices list` (pending requests show UUIDs).
  for (const m of s.matchAll(/\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/g)) {
    out.add(m[0]);
  }

  return Array.from(out);
}

test("extractDeviceRequestIds: finds requestId formats", () => {
  const sample = `pending:\n- requestId=abc123_DEF\n{"requestId":"REQ_456-xy"}\nrequestId: ZZZ999\n\nPending (1)\n│ 893bff23-37ef-4317-b741-501490d7d419 │ some-device │ operator │ 1.2.3.4 │ 2m ago │ │`;
  assert.deepEqual(
    extractDeviceRequestIds(sample).sort(),
    ["REQ_456-xy", "ZZZ999", "abc123_DEF", "893bff23-37ef-4317-b741-501490d7d419"].sort(),
  );
});
