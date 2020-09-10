#!/usr/bin/env node

import yargs from 'yargs'
import { readCommandHandler, writeCommandHandler, createCommandHandler } from './handlers'

// smartweave read [--input.function="hello"]   -- contractId
// smartweave write --input.function --dry-run  -- contractId
// smartweave create <sourceTx | sourceFile> <initStateFile>
// smartweave info -- contractId

const readCommand: yargs.CommandModule = {
  command: 'read <contractId>',
  describe: 'Read a contracts state or executes a read interaction.',
  builder: yargs =>
    yargs
      .options('input', {
        describe: 'Optional input to the contract, if not provided, contracts full state will be read'
      })
      .positional('contractId', { describe: 'The Contract ID' }),
  handler: readCommandHandler
}

const writeCommand: yargs.CommandModule = {
  command: 'write <contractId>',
  describe: 'Writes an interaction with contract, or simulates a write interaction.',
  builder: yargs =>
    yargs
      .options({
        'key-file': {
          describe: 'Your key file',
          demandOption: true
        },
        input: {
          describe: 'Input to the contract',
          demandOption: true
        },
        'dry-run': {
          describe: 'Simulate interaction and output contract state',
          boolean: true
        }
      })
      .positional('contractId', { describe: 'The Contract ID' }),
  handler: writeCommandHandler
}

const createCommand: yargs.CommandModule = {
  command: 'create <contractSource> <initStateFile>',
  describe: 'Creates a new contract from a source file or existing contract source already on-chain.',
  builder: yargs =>
    yargs
      .options({
        'key-file': {
          describe: 'Your key file',
          demandOption: true
        }
      })
      .positional('contractSource', { describe: 'The contract source. A path to a .js file, or transaction id' })
      .positional('initStateFile', { describe: 'The initial state of the contract. Path to a .json file' }),
  handler: createCommandHandler
}

yargs // eslint-disable-line
  .command(readCommand)
  .command(writeCommand)
  .command(createCommand)
  .demandCommand()
  .help()
  .argv
