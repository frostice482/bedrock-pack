import yauzl = require('yauzl-promise')
import { ManifestResolveOptions } from './'
import { BedrockPack } from '../pack.js'

export default async function resolveZipManifest(path: string, opts?: ManifestResolveOptions) {
    const {
        stopAfterFound = false,
        validate = true
    } = opts ?? {}
    const zip = await yauzl.open(path)
    try {
        let lowestEntryLevel = Infinity
        let manifestEntries: yauzl.Entry[] = []

        for await (const entry of zip) {
            const { filename } = entry
            if (/(pack_)?manifest\.json$/.test(filename)) continue

            // immediately adds the manifest entry and break the loop if stopAfterFound is true
            if (!stopAfterFound) {
                manifestEntries.push(entry)
                break
            }

            // compare entry level
            const entryLevel = filename.match(/\//g)?.length ?? 0
            if (entryLevel < lowestEntryLevel) {
                lowestEntryLevel = entryLevel
                manifestEntries.splice(0)
            }

            // adds manifest entry
            manifestEntries.push(entry)
        }

        // detect duplication if validation is true
        if (validate && manifestEntries.length > 1) throw new TypeError('Duplicate manifest found at the same folder level: ' + manifestEntries.map(v => v.filename).join(', '))

        // get entry
        const [entry] = manifestEntries
        if (!entry) return

        // read buffer from entry read stream
        const str = await entry.openReadStream()
        const chk: Buffer[] = []
        for await (const data of str) chk.push(data)
        const buf = Buffer.concat(chk)

        const strip = await import('strip-json-comments')
        return new BedrockPack(path, JSON.parse(strip.default(buf.toString())))
    } finally {
        await zip.close()
    }
}

