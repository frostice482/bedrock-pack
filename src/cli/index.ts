export namespace BedrockPackCLI {
    export const init: typeof import('./init.js').default = (...args) => { return require('./init.js').default.apply(undefined, args) }
    export const pack: typeof import('./pack.js').default = (...args) => { return require('./pack.js').default.apply(undefined, args) }
}

export default BedrockPackCLI
