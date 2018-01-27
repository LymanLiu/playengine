import { Application } from "../application";
import { AssetManager, AssetData } from "./asset";

export interface TextureData {
    addressu?: string;
    addressv?: string;
    anisotropy?: number;
    magfilter?: string | number;
    minfilter?: string | number;
    rgbm?: boolean;
}

export interface TextureOptions extends AssetData, TextureData {
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

    add(options: TextureOptions) {
        let textureAsset = new pc.Asset(
            options.name,
            pc.ASSET_TEXTURE,
            { url: options.url },
            {
                addressu: options.addressu || "repeat",
                addressv: options.addressv || "repeat",
                anisotropy: options.anisotropy || 1,
                magfilter: options.magfilter || "linear",
                minfilter: options.minfilter || "linear_mip_linear",
                rgbm: typeof options.rgbm === "undefined" ? false : options.rgbm
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
