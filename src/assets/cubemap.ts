import { Application } from "../application";
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

export default class CubemapManager {
    private app : Application;
    private _assets : any;
    private static readonly DEFAULT_CUBEMAP_DATA : CubemapData = {
        anisotropy: 1,
        magfilter: 1,
        minfilter: 5,
        rgbm: true,
        textures: []
    };

    constructor(app : Application) {
        this.app = app;
        this._assets = {};
    }

    get(name : string) {
        return this._assets[name];
    }

    add(options : CubemapOptions) {
        let textureAssetIds : number[] = [];
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
        this._assets[options.name] = {
            cubemapAsset: cubemapAsset,
            textureAssetIds: textureAssetIds
        };

        return cubemapAsset;
    }

    load(name : string, options : CubemapLoadOptions = {}) {
        return new Promise((resolve, reject) => {
            let loadFaces = typeof options.loadFaces === 'boolean' ? options.loadFaces : false;
            let loadedCounts = 0;
            let totalCounts = loadFaces ? 7 : 1;
            let cubemap = this._assets[name];
            let cubemapAsset = cubemap.cubemapAsset;

            let onLoaded = () => {
                loadedCounts++;
                if (loadedCounts === totalCounts) {
                    resolve(cubemap.cubemapAsset);
                }
            }

            if (loadFaces) {
                cubemap.textures.forEach((textureAssetId : number) => {
                    let textureAsset = this.app.textures.get(textureAssetId);
                    textureAsset.ready(onLoaded);
                    this.app.$.assets.load(textureAsset);
                });
            }

            cubemapAsset.ready(onLoaded);
            this.app.$.assets.load(cubemapAsset);
        });
    }
}
