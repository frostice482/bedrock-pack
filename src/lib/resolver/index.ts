import _dir from './dir.js'
import _root from './root.js'
import _zip from './zip.js'

export namespace BedrockManifestResolver {
    export const dir = _dir
    export const root = _root
    export const zip = _zip
}

export default BedrockManifestResolver

export interface ManifestResolveOptions {
    /**
     * Returns the first manifest found, ignoring validation and other manifest that may exist
     */
    stopAfterFound?: boolean

    /**
     * Validates multiple `manifest.json` exists in the same folder level
     * Ignored if `stopAfterFound` is `true`
     */
    validate?: boolean
}
