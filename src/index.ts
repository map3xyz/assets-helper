import { RepoFileGenerator } from './csv/RepoFileGenerator';
import { DEFAULT_TEMP_DIR } from './utils/config';

export * from './model';
export * from './networks';
export * from './repo';
export * from './tokenlist';
export * from './utils';
export * from './validate';
export * from './db';
export * from './csv';


// temp async IIFE
(async () => {
    try {
        const csv = await RepoFileGenerator.generate();

        csv.deserialise(DEFAULT_TEMP_DIR);
        console.log('success')
    } catch (err) {
         console.error(err);
    }
  })();

  
