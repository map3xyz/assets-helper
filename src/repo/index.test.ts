import test from "ava";
import { getDirPathForTokenlist } from ".";

test("getDirPathForTokenlist calculates the correct directory", async (t) => {
    const network = 'ethereum';
    const address = '0x';

    t.deepEqual(getDirPathForTokenlist(network, address), `/networks/ethereum/assets/${network}-tokenlist/${address}`);
});