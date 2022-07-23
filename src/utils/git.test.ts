import test from 'ava';
import { cloneOrPullRepoAndUpdateSubmodules } from './git';
import fs from 'fs';

test('cloning assets repo clones and pulls submodules', async t => {
    const REPO_CLONE_URL = 'git@github.com:map3xyz/assets.git';
    const DEFAULT_REPO_DISK_LOCATION = './tmp/map3xyz-assets';
    try {
        await cloneOrPullRepoAndUpdateSubmodules(REPO_CLONE_URL, DEFAULT_REPO_DISK_LOCATION, true, 'master');
        const ethereumTokenlistclonedReadme = fs.existsSync(`${DEFAULT_REPO_DISK_LOCATION}/networks/ethereum/assets/ethereum-tokenlist/README.md`);
        t.true(ethereumTokenlistclonedReadme);
    } catch (err) {
        t.fail(err.message);
    }
});