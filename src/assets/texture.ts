import { Application } from "../application";
import { AssetManager } from "./asset";

export interface TextureData {
    addressu?: string;
    addressv?: string;
    anisotropy?: number;
    magfilter?: string | number;
    minfilter?: string | number;
    rgbm?: boolean;
}

export interface TextureOptions extends TextureData {
    url: string;
    name?: string;
    width?: number;
    height?: number;
}

export default class TextureManager extends AssetManager {

    constructor(app: Application) {
        super(app);
    }

    get(id: number) {
        return this._assets[id];
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

    remove(id: number) {
        this.app.$.assets.remove(this._assets[id]);
        delete this._assets[id];
        return this;
    }

    load(id: number): Promise<pc.Asset> {
        return new Promise((resolve, reject) => {
            let textureAsset = this._assets[id];
            textureAsset.on("load", (asset: any) => resolve(asset));
            textureAsset.on("error", (err: any) => reject(err));
            this.app.$.assets.load(textureAsset);
        })
    }
}
