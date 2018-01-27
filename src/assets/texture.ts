import { Application } from "../application";
import { AssetManager, AssetData } from "./asset";

export interface TextureOptions {
    addressu?: string;
    addressv?: string;
    anisotropy?: number;
    magfilter?: string | number;
    minfilter?: string | number;
    rgbm?: boolean;
}

export interface TextureData extends AssetData, TextureOptions {
    url: string;
    width?: number;
    height?: number;
}

export default class TextureManager extends AssetManager {

    constructor(app: Application) {
        super(app);
    }

    get(identity: number) {
        return this._assets[identity];
    }

    add(data: TextureData) {
        let textureAsset = new pc.Asset(
            data.name,
            pc.ASSET_TEXTURE,
            { url: data.url },
            {
                addressu: data.addressu || "repeat",
                addressv: data.addressv || "repeat",
                anisotropy: data.anisotropy || 1,
                magfilter: data.magfilter || "linear",
                minfilter: data.minfilter || "linear_mip_linear",
                rgbm: typeof data.rgbm === "undefined" ? false : data.rgbm
            }
        );

        this._assets[textureAsset.id] = textureAsset;
        this.app.$.assets.add(textureAsset);

        return textureAsset;
    }

    remove(identity: number) {
        this.app.$.assets.remove(this._assets[identity]);
        delete this._assets[identity];
        return this;
    }
}
