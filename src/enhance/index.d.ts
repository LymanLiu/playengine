declare namespace pc {
    interface ToJSONOptions {
        diff?: boolean
    }

    interface EnhanceAsset {
        toJSON(options?: ToJSONOptions): object;
    }

    interface StandardMaterial extends EnhanceAsset {
        [prop: string]: any;
    }

    interface Texture extends EnhanceAsset { }
    interface BoundingBox extends EnhanceAsset { }
}
