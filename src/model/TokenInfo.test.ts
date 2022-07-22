

import test from 'ava';
import { AssetInfo } from './AssetInfo';

const token = {
    // https://wispy-bird-88a7.uniswap.workers.dev/?url=http://stablecoin.cmc.eth.link
    chainId: 1,
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    symbol: "USDT",
    name: "Tether",
    decimals: 6
};


test('Converting existing uniswap tokenlist token', async t => {
    try {
        const parsed = await AssetInfo.fromTokenlistTokenInfo(token);
        t.deepEqual(token.address, parsed.address);
        t.deepEqual(token.symbol, parsed.symbol);
        t.deepEqual(token.name, parsed.name);
        t.deepEqual(token.decimals, parsed.decimals);
    } catch (err) {
        t.fail(err);
    }
});