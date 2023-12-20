import fsp = require('fs/promises')
import BedrockManifest from "./manifest.js"
import BedrockManifestJson from "./manifest_json.js"

export class BedrockPack {
    static async fromFile(path: string) {
        const manifest = await BedrockManifest.fromFile(path)
        return new this(path, manifest)
    }

    constructor(path: string, manifest: BedrockManifest | string | BedrockManifestJson.T | BedrockManifestJson.Header) {
        this.path = path
        this.manifest = manifest instanceof BedrockManifest ? manifest : new BedrockManifest(manifest)
    }

    path: string
    manifest: BedrockManifest

    get name() { return this.manifest.name }
    get uuid() { return this.manifest.uuid }
    get version() { return this.manifest.version }

    async copyTo(path: string, copyType: CopyType = 'copy') {
        switch (copyType) {
            case 'copy': 
                await fsp.cp(this.path, path, { recursive: true })
                break

            case 'link': 
                await fsp.link(this.path, path)
                break
        }

        return new BedrockPack(path, this.manifest)
    }
}

export default BedrockPack

type CopyType = 'copy' | 'link' | 'none'
