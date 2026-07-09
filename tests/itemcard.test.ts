import test from "node:test";
import assert from "node:assert/strict";
import { formatItemCard, getItemCardData, ItemCardData } from "../src/services/itemcard";

const rareRing: ItemCardData = {
    frameType: 2,
    rarity: "rare",
    typeLine: "Phoenix Grasp Prismatic Ring",
    ilvl: 81,
    w: 1,
    h: 1,
    properties: [{ name: "Ring", values: [] }],
    requirements: [{ name: "Level", values: [["54", 0]] }],
    implicitMods: ["+10% to all Elemental [Resistances|Resistances]"],
    explicitMods: [
        "+70 to maximum Life",
        "+11% to all Elemental [Resistances|Resistances]",
        "+28% to Fire Resistance",
        "+20% to Chaos Resistance",
    ],
};

test("parses stored item json for item cards", () => {
    assert.deepEqual(getItemCardData({ item_json: JSON.stringify(rareRing) }), rareRing);
    assert.equal(getItemCardData({ item_json: "{not-json" }), null);
    assert.equal(getItemCardData({ item_json: null }), null);
});

test("formats item card detail, requirements, and cleaned mods", () => {
    const card = formatItemCard(rareRing);

    assert.ok(card);
    assert.match(card, /Rare \| ilvl 81 \| 1x1 \| Ring/);
    assert.match(card, /Req: Level 54/);
    assert.match(card, /\*\*Mods\*\*/);
    assert.match(card, /Implicit: \+10% to all Elemental Resistances/);
});

test("limits visible mods and reports hidden mod count", () => {
    const itemWithManyMods: ItemCardData = {
        ...rareRing,
        explicitMods: [
            "mod one",
            "mod two",
            "mod three",
            "mod four",
            "mod five",
            "mod six",
            "mod seven",
        ],
    };

    const card = formatItemCard(itemWithManyMods);

    assert.ok(card);
    assert.match(card, /\+2 more mod\(s\)/);
});
