export {}

// fixes invalid types for yauzl-promise
declare module 'yauzl-promise' {
    interface ZipFile {
        [Symbol.asyncIterator](): AsyncIterator<Entry>
    }
    interface Entry {
        filename: string
        /** @deprecated */
        fileName
    }
}
