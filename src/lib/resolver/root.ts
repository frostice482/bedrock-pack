import fsp = require('fs/promises')
import { ManifestResolveOptions } from "./";
import resolveZipManifest from './zip.js';
import resolveDirManifest from './dir.js';
import { BedrockPack } from '../pack.js'

export default async function resolveRootManifests(path: string, opts?: RootManifestResolveOptions) {
    const manifestList = new Set<BedrockPack>()

    const { zip: zipOpts = {}, dir: dirOpts = {} } = opts ?? {}

    for (const dir of await fsp.readdir(path)) {
        try {
            const dirResolve = path + '/' + dir
            const isDir = await fsp.stat(dirResolve).then(v => v.isDirectory())

            const res = isDir
                ? !dirOpts.ignore && resolveDirManifest(dirResolve, dirOpts)
                : !zipOpts.ignore && resolveZipManifest(dirResolve, zipOpts)
            
            const data = await res
            if (data) manifestList.add(data)
        } catch(e) {}
    }

    return manifestList
}

export interface RootSectionManifestResolveOptions extends ManifestResolveOptions {
    /**
     * Ignores manifest being resolved
     */
    ignore?: boolean
}

export interface RootManifestResolveOptions {
    zip?: RootSectionManifestResolveOptions
    dir?: RootSectionManifestResolveOptions
}
