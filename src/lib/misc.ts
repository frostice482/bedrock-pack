import BedrockManifestJson from "./manifest_json.js";

export function versionStr(ver: BedrockManifestJson.VersionStringOrArray) {
    return typeof ver === 'string' ? ver : ver.join('.')
}
