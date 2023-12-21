export namespace BedrockManifestResolver {
    export const dir: typeof import('./dir.js').default = (...args) => { return require('./dir.js').default.apply(undefined, args) }
    export const root: typeof import('./root.js').default = (...args) => { return require('./root.js').default.apply(undefined, args) }
    export const zip: typeof import('./zip.js').default = (...args) => { return require('./zip.js').default.apply(undefined, args) }
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
