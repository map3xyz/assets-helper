import test from "ava";
import { toHyphenCase } from ".";

test("hyphencasing a string without spaces", t => {
    const name = 'optimism';
    const result = toHyphenCase(name);
    t.deepEqual(result, name);
});


test("hyphencasing a string with spaces", t => {
    const name = 'Optimism Network';
    const result = toHyphenCase(name);
    t.deepEqual(result, 'optimism-network');
});