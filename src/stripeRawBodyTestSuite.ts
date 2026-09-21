import crypto from "crypto";
import assert from "node:assert/strict";
import { verifyStripeSignature } from "./stripe-webhook-verification";

function sign(secret: string, raw: string, timestamp = Math.floor(Date.now() / 1000)): string {
  const hmac = crypto.createHmac("sha256", secret).update(`${timestamp}.${raw}`, "utf8").digest("hex");
  return `t=${timestamp},v1=${hmac}`;
}

const secret = "whsec_gridiron_test";
const raw = '{"id": "evt_1", "type": "transfer.created"}';
const header = sign(secret, raw);

assert.equal(verifyStripeSignature(Buffer.from(raw), header, secret), true, "raw buffer signature verifies");

const reparsed = JSON.stringify(JSON.parse(raw));
assert.notEqual(reparsed, raw);
const forged = sign(secret, reparsed);
assert.equal(
  verifyStripeSignature(Buffer.from(raw), forged, secret),
  false,
  "HMAC of JSON.stringify(parsed body) must not verify against the raw bytes",
);

const stale = Math.floor(Date.now() / 1000) - 301;
assert.equal(
  verifyStripeSignature(Buffer.from(raw), sign(secret, raw, stale), secret),
  false,
  "signatures older than five minutes are rejected",
);

console.log("stripe raw-body signature suite passed");
