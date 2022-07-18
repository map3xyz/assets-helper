import test from 'ava';
import { getNetworks } from '.';

test('networks includes ethereum', async t => {
    const networks = await getNetworks();
    t.truthy(networks.find(n => n.name === 'ethereum'));
});