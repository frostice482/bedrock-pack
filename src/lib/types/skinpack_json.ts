export declare namespace SkinPackJson {
    interface Skin {
        localization_name: string
        geometry: string
        texture: string
        type: string
    }

    interface T {
        geometry: string
        serialize_name: string
        localization_name: string
        skins: Skin[]
    }
}

export type SkinPackJson = SkinPackJson.T

export default SkinPackJson
