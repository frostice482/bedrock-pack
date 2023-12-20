#!/usr/bin/env node

import { program } from "commander";
const { version } = require('../package.json')

program
    .name('bedrock-pack')
    .description('CLI Utils for Minecraft Bedrock Pack')
    .version(version)

program.command('init')
    .aliases(['i'])
    .description('Initializes Bedrock Pack')
    .argument('[path]', 'Specify path where the pack will be initialized')
    .action(async (path) => {
        const { default: { default: f } } = await import('./cli/init.js')
        f(path)
    })

program.command('pack')
    .aliases(['p'])
    .description('Archives Bedrock Packs')
    .argument('<output>', 'Specify path where the output file will be generated')
    .option('-p, --path', 'Specify path where pack(s) will be archived')
    .option('-!lF, --no-log-file', 'Disable file logging')
    .action(async (out, opts) => {
        const { default: { default: f } } = await import('./cli/pack.js')
        f(out, opts)
    })

program.parse()