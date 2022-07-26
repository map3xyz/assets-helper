import test from 'ava';
import { ASSETS_CSV_TMP_FILE } from '../utils/config';
import { RepoFileGenerator } from './RepoFileGenerator';

test('Generating and saving csv to tmp folder works ', async t => {
    try {
        const csv = await RepoFileGenerator.generate();
        csv.deserialise(ASSETS_CSV_TMP_FILE);
        t.pass();
    } catch (err) {
        t.fail(err.message);
    }
});