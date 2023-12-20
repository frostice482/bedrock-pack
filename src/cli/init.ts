import crypto = require("crypto")
import fsp = require("fs/promises")
import path = require("path")
import prompts = require("prompts");
import semver = require("semver")
import BedrockManifest from "../lib/manifest.js";

export default async function cliInit(cwd?: string) {
    if (cwd) process.chdir(cwd)

    const manifest = new BedrockManifest()

    // pack info
    const { pack_name, pack_desc, pack_ver, pack_minver, pack_type } = await prompts([
        {
            type: 'text',
            name: 'pack_name',
            message: 'Pack name',
            initial: 'My Pack',
        }, {
            type: 'text',
            name: 'pack_desc',
            message: 'Pack description',
        }, {
            type: 'text',
            name: 'pack_ver',
            message: 'Pack version',
            initial: '1.0.0',
            validate: value => semver.valid(value) ? true : 'Bad version format',
            format: value => semver.valid(value)
        }, {
            type: 'text',
            name: 'pack_minver',
            message: 'Minimum engine version',
            initial: '1.20.0',
            validate: value => semverSimple.test(value) ? true : 'Bad version format',
            format: value => value.split('.').map(Number)
        }, {
            type: 'select',
            name: 'pack_type',
            message: 'Pack type',
            choices: [
                {
                    title: 'Behavior pack',
                    description: 'entities, items, blocks, functions, etc.',
                    value: 'data'
                }, {
                    title: 'Resource pack',
                    description: 'textures, sounds, animations, etc.',
                    value: 'resources'
                }, {
                    title: 'Skin pack',
                    description: 'create skins collection',
                    value: 'skin_pack'
                }, {
                    title: 'Scripts',
                    description: 'world manipulation with javascript',
                    value: 'script'
                }
            ]
        }
    ])

    // assign to manifest
    manifest.name = pack_name
    manifest.description = pack_desc
    manifest.version = pack_ver
    manifest.minEngineVersion = pack_minver

    // module
    switch (pack_type) {
        // script type requires additional entry info
        case 'script': {
            console.log("[i] It is recommended to use 'bedrock-scripting' to initialize / update script packs.")

            const { scriptEntry } = await prompts({
                type: 'text',
                name: 'scriptEntry',
                message: 'Script entry file',
                initial: 'scripts/index.js',
                validate: value => {
                    value = path.posix.normalize(value).trim()
                    return !value.startsWith('scripts/') ? 'Script files must be in scripts/ folder'
                        : !value.endsWith('.js') ? 'Script files extension must be .js'
                        : true
                },
                format: value => path.posix.normalize(value).trim()
            })
            
            manifest.modules.add({
                type: 'script',
                entry: scriptEntry,
                uuid: crypto.randomUUID(),
                version: pack_ver
            })
        } break

        default: {
            manifest.modules.add({
                type: pack_type,
                uuid: crypto.randomUUID(),
                version: pack_ver
            })
        }
    }

    // create manifest
    console.log('Creating manifest.json')
    await fsp.writeFile('manifest.json', JSON.stringify(manifest, null, 4))
    console.log('manifest.json created')
    
    // post
    console.log("You can set the pack icon by adding 'pack_icon.png' file here.")
}

const semverSimple = /^\d+\.\d+\.\d+$/
