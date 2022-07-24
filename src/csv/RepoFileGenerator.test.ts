import test from 'ava';
import { DEFAULT_TEMP_DIR } from '../utils/config';
import { RepoFileGenerator } from './RepoFileGenerator';

test('Generating and saving csv to tmp folder works ', async t => {
    try {
        const csv = await RepoFileGenerator.generate();
        csv.deserialise(DEFAULT_TEMP_DIR);
        t.pass();
    } catch (err) {
        t.fail(err.message);
    }
});