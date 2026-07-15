import test from "node:test";
import assert from "node:assert/strict";
import { parseRetryAfterSeconds, RateLimitError } from "../src/services/httpErrors";

test("parses retry-after seconds", () => {
    assert.equal(parseRetryAfterSeconds("300", 1800), 300);
});

test("rounds retry-after seconds up", () => {
    assert.equal(parseRetryAfterSeconds("4.2", 1800), 5);
});

test("uses fallback when retry-after is missing or invalid", () => {
    assert.equal(parseRetryAfterSeconds(null, 1800), 1800);
    assert.equal(parseRetryAfterSeconds("not-a-date", 1800), 1800);
});

test("parses retry-after HTTP dates", () => {
    const future = new Date(Date.now() + 90_000).toUTCString();
    const parsed = parseRetryAfterSeconds(future, 1800);

    assert.ok(parsed >= 85);
    assert.ok(parsed <= 95);
});

test("rate limit error carries retry-after seconds", () => {
    const error = new RateLimitError(123);

    assert.equal(error.retryAfterSeconds, 123);
    assert.equal(error.name, "RateLimitError");
});
