import chalk = require('chalk')
import events = require('events')
import fs = require('fs')
import fsp = require('fs/promises')
import path = require('path')
import * as tse from 'ts-essentials'
import { ZipFile } from 'yazl'
import { Glob } from "glob";
import BedrockManifestJson from "../lib/manifest_json.js";
import BedrockPack from '../lib/pack.js';
import BedrockManifestResolver from '../lib/resolver/index.js';

const includes: Record<BedrockManifestJson.ModuleTypes, string[]> = {
    data: [
        "animations/**/*.json",
        "animation_controllers/**/*.json",
        "blocks/**/*.json",
        "entities/**/*.json",
        "features/**/*.json",
        "feature_rules/**/*.json",
        "functions/**/*.mcfunction",
        "items/**/*.json",
        "loot_tables/**/*.json",
        "recipes/**/*.json",
        "spawn_rules/**/*.json",
        "structures/**/*.mcstructure",
        "trading/**/*.json"
    ],
    resources: [
        "blocks.json",
        "sounds.json",

        "animations/**/*.json",
        "attachables/**/*.json",
        "blocks/**/*.json",
        "entity/**/*.json",
        "font/**/*.lang",
        "models/**/*.json",
        "particles/**/*.json",
        "render_controllers/**/*.json",
        "sounds/**/*",
        "textures/**/*",
        "ui/**/*.json"
    ],
    script: [
        "scripts/**/*.js"
    ],
    skin_pack: [
        "skins.json",
        "*.png"
    ]
}

const commonIncludes = [
    "manifest.json",
    "pack_icon.png",
    "texts/**/*.lang",

    'README*',
    'LICENSE*',
    '*.md',
    '*.txt',
]

export default async function cliPack(out: string, opts: tse.DeepReadonly<CLIPackOptions> = {}) {
    let packs: Set<BedrockPack>

    // manifest resolving
    const hasManifest = await fsp.stat('manifest.json').then(stat => stat.isFile(), () => false)
    if (hasManifest) {
        const pack = await BedrockPack.fromFile('manifest.json')
        packs = new Set([pack])
    } else {
        packs = await BedrockManifestResolver.root(opts.path ?? '.', { zip: { ignore: true } })
    }

    // detect if pack count = 0
    if (packs.size === 0) throw new Error('nothing to pack')

    // detect if pack count > 1
    const asMcAddon = packs.size !== 1
    if (asMcAddon) console.log('Multiple packs detected, archiving as .mcaddon instead')

    // output file
    const outdata = path.parse(out)
    outdata.dir ||= '.'
    const outname = outdata.dir + '/' + outdata.name + ( outdata.ext === '.mcpack' && asMcAddon ? '.mcaddon' : outdata.ext || ( asMcAddon ? '.mcaddon' : '.mcpack' ) )
    const outtmp = outdata.dir + '/' + Date.now().toString(36) + '.tmp'

    // temp stream & zip
    const tmpstr = fs.createWriteStream(outtmp)
    const zip = new ZipFile()
    zip.outputStream.pipe(tmpstr)

    for (const pack of packs) {
        const rel = asMcAddon ? pack.uuid.slice(0, 8) + '/' : ''
        console.log(
            pack.name.replace(/\xa7./g, ''),
            chalk.gray(pack.uuid),
            chalk.green(typeof pack.version === 'string' ? pack.version : pack.version.join('.')),
            rel ? chalk.blue(rel) : '',
        )

        // include
        const incl = commonIncludes.slice()
        for (const mod of pack.manifest.modules.keys()) incl.push.apply(incl, includes[mod])

        // glob
        const dir = path.parse(pack.path).dir || '.'
        const glob = new Glob(incl, {
            cwd: dir,
            nodir: true
        })

        for await (const entry of glob) {
            if (opts.logFile !== false) console.log('  - ' + entry)
            zip.addFile(dir + '/' + entry, rel + entry)
        }
    }

    // zip end & await temp stream close
    zip.end()
    await events.once(tmpstr, 'close')

    // rename
    await fsp.rename(outtmp, outname)

    console.log('Finished')
}

export interface CLIPackOptions {
    path?: string
    logFile?: boolean
}
