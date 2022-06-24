#!/usr/bin/env node

import { Command } from 'commander'
import { validate } from './validate'
import { getDirectories } from './validate/rules';

const program = new Command();

program
  .name('assets-helper')
  .description('CLI to automate the workflows on the map3.xyz assets repo')

program.command('validate')
  .description('Validate that the assets repository is in a valid state')
  .option('-n --network <string>', 'specific network to validate')
  .option('-r, --repo <repo>', 'The repo to validate')
  .action((options) => {
    // default
    if(options.repo === '.') {
      options.repo = process.cwd();
    }

    validate(options.network, options.repo)
      .then(result => {
        if (result.valid) {
          console.log('Repository is valid');
          process.exit(0);
        } else {
          console.log(`Repository is invalid. Errors:\n 
            ${result.errors.map(e => e.source + ': ' + e.message).join('\n')}`);
          process.exit(1);
        }
      }).catch(err => { 
          console.error("Error running validate\n", err);
          process.exit(1);
      });
});

program.command('readDirs')
  .option('-r, --repo <repo>', 'The repo to read')
  .action((options) => {
     // default
     if(options.repo === '.') {
      options.repo = process.cwd();
    }
    getDirectories(options.repo)
    .then(console.log)
  });


program.parse(process.argv);
