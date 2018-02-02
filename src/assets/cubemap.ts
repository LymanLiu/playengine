import { Application } from "../application";
import { AssetManager, AssetData } from "./asset";
import { TextureOptions, TextureData } from "./texture";

interface CubemapData extends AssetData {
    cubemap: string;
    textures: TextureData[];
}

interface CubemapOptions extends TextureOptions {
    textures: number[];
}

interface CubemapLoadOptions {
    loadFaces?: boolean;
}

export default class CubemapManager extends AssetManager {
    private static readonly DEFAULT_CUBEMAP_OPTIONS: CubemapOptions = {
        anisotropy: 1,
        magfilter: 1,
        minfilter: 5,
        rgbm: true,
        textures: []
    };

    constructor(app: Application) {
        super(app);
    }

    add(data: CubemapData) {
        let textureAssetIds: number[] = [];
        data.textures.forEach(textureData => {
            let textureAsset = this.app.textures.add(textureData);
            textureAssetIds.push(textureAsset.id);
        });

        let cubemapAsset = new pc.Asset(
            data.name,
            pc.ASSET_CUBEMAP,
            data.cubemap ? { url: data.cubemap } : null,
            {
                anisotropy: CubemapManager.DEFAULT_CUBEMAP_OPTIONS.anisotropy,
                magFilter: CubemapManager.DEFAULT_CUBEMAP_OPTIONS.magfilter,
                minFilter: CubemapManager.DEFAULT_CUBEMAP_OPTIONS.minfilter,
                rgbm: CubemapManager.DEFAULT_CUBEMAP_OPTIONS.rgbm,
                textures: textureAssetIds
            }
        );
        this.app.$.assets.add(cubemapAsset);
        this._assets[data.name] = cubemapAsset;

        return cubemapAsset;
    }

    load(name: string, options: CubemapLoadOptions = {}): Promise<pc.Asset> {
        return new Promise((resolve, reject) => {
            let loadFaces = typeof options.loadFaces === "boolean" ? options.loadFaces : false;
            let loadedCounts = 0;
            let totalCounts = loadFaces ? 7 : 1;
            let cubemapAsset = this._assets[name];

            if (cubemapAsset.loaded) {
                return resolve(cubemapAsset);
            }

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
