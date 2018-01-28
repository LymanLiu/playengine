import { Application } from "../application";
import { AssetManager, AssetData } from "./asset";
import { MaterialData } from "./material";
import { TextureData } from "./texture";

interface ModelMapping {
    material: number
}

interface ModelLoadOptions {
    onProgress?: (asset: pc.Asset, loadedCounts: number, totalCounts: number) => void;
}

export interface ModelData extends AssetData {
    url: string;
    mapping: string[];
    materials?: MaterialData[];
    textures?: TextureData[];
}

export interface ModelDataOptions {
    area: number;
    mapping: ModelMapping[];
    assets: number[];
    [key: string]: any;
}

export interface ModelAssetsMap {
    [identity: string]: number
}

export default class ModelManager extends AssetManager {
    constructor(app: Application) {
        super(app);
    }

    add(data: ModelData) {
        if (this._assets[data.uid]) return this;

        let assets: number[] = [];
        let texturesMap: ModelAssetsMap = {};
        let materialsMap: ModelAssetsMap = {};
        let modelDataOptions: ModelDataOptions = {
            area: 0,
            mapping: [],
            assets: []
        };

        if (data.textures && data.textures.length > 0) {
            data.textures.forEach(textureData => {
                let textureAsset = this.app.textures.add(textureData);
                texturesMap[textureData.name] = textureAsset.id;
                modelDataOptions.assets.push(textureAsset.id);
                assets.push(textureAsset.id);
            });
        }

        if (data.materials && data.materials.length > 0) {
            data.materials.forEach(materialData => {
                if (materialsMap[materialData.name]) return;

                this.app.materials.link(materialData, texturesMap);

                let materialAsset = this.app.materials.add(materialData);
                materialsMap[materialData.name] = materialAsset.id;
                modelDataOptions.assets.push(materialAsset.id);
                assets.push(materialAsset.id);
            });

            modelDataOptions.mapping = data.mapping.map(name => ({ material: materialsMap[name] }));
        }

        let modelAsset = new pc.Asset(
            data.name,
            pc.ASSET_MODEL,
            { url: data.url },
            modelDataOptions
        );

        this._assets[data.uid] = modelAsset;
        this.app.$.assets.add(modelAsset);

        return this;
    }

    load(identity: string, options: ModelLoadOptions = {}): Promise<pc.Asset> {
        return new Promise((resolve, reject) => {
            let modelAsset = this._assets[identity];
            let loadedCounts = 0;
            let totalCounts = 1 + modelAsset.data.assets.length;

            let onLoaded = (asset: pc.Asset) => {
                loadedCounts++;
                if (options.onProgress) {
                    options.onProgress(asset, loadedCounts, totalCounts);
                }

                if (loadedCounts === totalCounts) {
                    resolve(modelAsset);
                }
            }

            modelAsset.data.assets.forEach((assetId: number) => {
                let asset = this.app.$.assets.get(assetId);
                asset.ready(onLoaded);
                asset.on("error", reject);
                this.app.$.assets.load(asset);
            });

            modelAsset.ready(onLoaded);
            modelAsset.on("error", reject);
            this.app.$.assets.load(modelAsset);
        });
    }
}
