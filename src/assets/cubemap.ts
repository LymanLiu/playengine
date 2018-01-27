import { Application } from "../application";
import { AssetManager } from "./asset";
import { TextureOptions, TextureData } from "./texture";

interface CubemapOptions {
    name: string;
    cubemap: string;
    textures: TextureOptions[];
}

interface CubemapData extends TextureData {
    textures: number[];
}

interface CubemapLoadOptions {
    loadFaces?: boolean;
}

export default class CubemapManager extends AssetManager {
    private static readonly DEFAULT_CUBEMAP_DATA: CubemapData = {
        anisotropy: 1,
        magfilter: 1,
        minfilter: 5,
        rgbm: true,
        textures: []
    };

    constructor(app: Application) {
        super(app);
    }

    get(name: string) {
        return this._assets[name];
    }

    add(options: CubemapOptions) {
        let textureAssetIds: number[] = [];
        options.textures.forEach(textureOptions => {
            let textureAsset = this.app.textures.add(textureOptions);
            textureAssetIds.push(textureAsset.id);
        });

        let cubemapAsset = new pc.Asset(
            options.name,
            pc.ASSET_CUBEMAP,
            options.cubemap ? { url: options.cubemap } : null,
            {
                anisotropy: CubemapManager.DEFAULT_CUBEMAP_DATA.anisotropy,
                magFilter: CubemapManager.DEFAULT_CUBEMAP_DATA.magfilter,
                minFilter: CubemapManager.DEFAULT_CUBEMAP_DATA.minfilter,
                rgbm: CubemapManager.DEFAULT_CUBEMAP_DATA.rgbm,
                textures: textureAssetIds
            }
        );
        this.app.$.assets.add(cubemapAsset);
        this._assets[options.name] = cubemapAsset;

        return cubemapAsset;
    }

    load(name: string, options: CubemapLoadOptions = {}): Promise<pc.Asset> {
        return new Promise((resolve, reject) => {
            let loadFaces = typeof options.loadFaces === "boolean" ? options.loadFaces : false;
            let loadedCounts = 0;
            let totalCounts = loadFaces ? 7 : 1;
            let cubemapAsset = this._assets[name];

            let onLoaded = () => {
                loadedCounts++;
                if (loadedCounts === totalCounts) {
                    resolve(cubemapAsset);
                }
            }

            if (loadFaces) {
                cubemapAsset.data.textures.forEach((textureAssetId: number) => {
                    let textureAsset = this.app.textures.get(textureAssetId);
                    textureAsset.ready(onLoaded);
                    textureAsset.once("error", reject);
                    this.app.$.assets.load(textureAsset);
                });
            }

            cubemapAsset.ready(onLoaded);
            cubemapAsset.once("error", reject);
            this.app.$.assets.load(cubemapAsset);
        });
    }
}
