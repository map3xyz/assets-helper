import { RepoFileGenerator } from './tsv/RepoFileGenerator';
import { DEFAULT_TEMP_DIR } from './utils/constants';
import { validate } from './validate';

export * from './model';
export * from './networks';
export * from './repo';
export * from './tokenlist';
export * from './trustwallet';
export * from './utils';
export * from './validate';
export * from './db';
export * from './tsv';

// const base = '/Users/ap/ama_dev/map3/indexer/tmp';
// ingestTokenList(`${base}/kq.tokenlist.json`, `${base}/map3xyz-assets/networks/polygon/assets/polygon-tokenlist`, 'foo', 'polygon-manual-list' )
// .then(res => {
//     console.log(JSON.stringify(res));
// }).catch(err => {
//     console.error(err);
// })

// getChainIdForNetwork('polygon')
// .then(console.log)
// .catch(console.error);

// validate('all', '/Users/ap/ama_dev/map3/indexer/tmp/map3xyz-assets/')
// .then(console.log)
// .catch(console.error);


// RepoFileGenerator.generate()
// .then(csv => csv.deserialise(DEFAULT_TEMP_DIR))
// .catch(console.error);
