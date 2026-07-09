import test from "node:test";
import assert from "node:assert/strict";
import {
    formatAmount,
    formatCurrencyName,
    formatEstimateAmount,
    formatPrice,
    normalizeCurrency,
} from "../src/services/valueformatter";

test("normalizes common currency names", () => {
    assert.equal(normalizeCurrency("Divine Orb"), "divine");
    assert.equal(normalizeCurrency("divines"), "divine");
    assert.equal(normalizeCurrency("Exalts"), "exalted");
    assert.equal(normalizeCurrency("Chaos Orbs"), "chaos");
});

test("formats amounts without noisy trailing zeroes", () => {
    assert.equal(formatAmount(5), "5");
    assert.equal(formatAmount(5.5), "5.5");
    assert.equal(formatAmount(5.25), "5.25");
    assert.equal(formatAmount(5.2), "5.2");
});

test("formats estimate amounts with compact large values", () => {
    assert.equal(formatEstimateAmount(9.75), "9.75");
    assert.equal(formatEstimateAmount(10), "10");
    assert.equal(formatEstimateAmount(626.12), "626.1");
});

test("formats display currency labels and prices", () => {
    assert.equal(formatCurrencyName("divine orb"), "Divine");
    assert.equal(formatCurrencyName("vaal-orb"), "Vaal Orb");
    assert.equal(formatPrice(2.5, "exalts"), "2.5 Exalted");
});
