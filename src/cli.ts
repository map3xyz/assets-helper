#!/usr/bin/env node

import { Command } from 'commander'
import { validate } from './validate'

const program = new Command();

program
  .option('-v, --validate', 'Validate Repository')
  .parse(process.argv)

program.parse(process.argv);
const options = program.opts();


if (options.validate) {
  validate()
    .then(result => {
      if (result.valid) {
        console.log('Repository is valid');
      } else {
        console.log(`Repository is invalid. Errors:\n ${result.errors.join('\n')}`);
      }

    }).catch(err => { 
        console.error("Error running validate", err)
    });
}