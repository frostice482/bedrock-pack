import fsp = require('fs/promises')
import { ManifestResolveOptions } from './'
import { BedrockPack } from '../pack.js'

const manifestFiles = [
    'manifest.json',
    'pack_manifest.json',
]

export default async function resolveDirManifest(path: string, opts?: ManifestResolveOptions) {
    const {
        stopAfterFound = false,
        validate = true
    } = opts ?? {}

    let localDirs = ['.']
    let manifestEntries: string[] = []

    searchloop:
    while (localDirs.length !== 0 && manifestEntries.length === 0) {
        const nextDirs: string[] = []

        dirloop:
        for (const localDir of localDirs) {
            const dirResolve = path + '/' + localDir

            for (const manifestName of manifestFiles) {
                const manifestDirResolve = dirResolve + '/' + manifestName

                // has manifest
                const hasManifest = await fsp.stat(manifestDirResolve).then(stat => stat.isFile(), () => false)
                if (!hasManifest) continue

                manifestEntries.push(manifestDirResolve)
                if (stopAfterFound) break searchloop
            }

            // no manifest
            const isDir = await fsp.stat(dirResolve).then(stat => stat.isDirectory(), () => false)
            if (isDir) {
                const newDirs = await fsp.readdir(dirResolve).then(newDirs => newDirs.map(newDir => localDir + '/' + newDir))
                nextDirs.push(...newDirs)
            }
        }

        localDirs = nextDirs
    }

    // detect duplication if validation is true
    if (validate && manifestEntries.length > 1) throw new TypeError('Duplicate manifest found at the same folder level: ' + manifestEntries.join(', '))

    // get entry
    const [entry] = manifestEntries
    if (!entry) return
    
    const manifestPath = entry
    return BedrockPack.fromFile(manifestPath)
}
