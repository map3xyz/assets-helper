#!/usr/bin/env node

import { Command } from 'commander'
import { validate } from './validate'

const program = new Command();

program
  .name('assets-helper')
  .description('CLI to automate the workflows on the map3.xyz assets repo')

program.command('validate')
  .description('Validate that the assets repository is in a valid state')
  .option('-n --network <string>', 'specific network to validate')
  .option('-r, --repo <repo>', 'The repo to validate')
  .action((options) => {
    validate(options.network, options.repo)
    .then(result => {
      if (result.valid) {
        console.log('Repository is valid');
        process.exit(0);
      } else {
        console.log(`Repository is invalid. Errors:\n ${result.errors.join('\n')}`);
        process.exit(1);
      }
    }).catch(err => { 
        console.error("Error running validate\n", err);
        process.exit(1);
    });
});

program.parse(process.argv);
