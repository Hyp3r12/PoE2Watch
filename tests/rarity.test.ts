import test from "node:test";
import assert from "node:assert/strict";
import {
    formatAnsiRarityText,
    getFrameTypeFromRarity,
    getRarityBadge,
    getRarityFromFrameType,
    getRarityLabel,
    getSaleRarity,
    normalizeRarity,
} from "../src/services/rarity";

test("maps Path of Exile frame types to rarity names", () => {
    assert.equal(getRarityFromFrameType(0), "normal");
    assert.equal(getRarityFromFrameType(1), "magic");
    assert.equal(getRarityFromFrameType(2), "rare");
    assert.equal(getRarityFromFrameType(3), "unique");
    assert.equal(getRarityFromFrameType(99), "unknown");
});

test("normalizes rarity text and prefers frame type when present", () => {
    assert.equal(normalizeRarity("Rare"), "rare");
    assert.equal(normalizeRarity("something else"), "unknown");
    assert.equal(getSaleRarity({ item_frame_type: 3, item_rarity: "rare" }), "unique");
    assert.equal(getSaleRarity({ item_frame_type: null, item_rarity: "magic" }), "magic");
});

test("formats rarity labels, badges, and ansi text", () => {
    assert.equal(getRarityLabel("unique"), "Unique");
    assert.equal(getRarityBadge({ item_frame_type: 2 }), "[RARE]");
    assert.equal(getFrameTypeFromRarity("quest"), 7);
    assert.equal(formatAnsiRarityText({ item_frame_type: 1 }, "Blue Item"), "\u001b[1;34mBlue Item\u001b[0m");
});
