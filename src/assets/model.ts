import { Application } from "../application";
import { AssetManager, AssetData } from "./asset";
import { MaterialData } from "./material";
import { TextureData } from "./texture";
import { AnimationData } from "./animation";

interface ModelMapping {
    material: number;
}

interface ModelLoadOptions {
    onProgress?: (asset: pc.Asset, loadedCounts: number, totalCounts: number) => void;
    loadAnimations?: boolean;
}

export interface ModelData extends AssetData {
    url: string;
    mapping: string[];
    materials?: MaterialData[];
    textures?: TextureData[];
    animations?: AnimationData[];
}

export interface ModelDataOptions {
    area: number;
    mapping: ModelMapping[];
    assets: number[];
    [key: string]: any;
}

export interface ModelAssetsMap {
    [identity: string]: number;
}

export default class ModelManager extends AssetManager {
    constructor(app: Application) {
        super(app);
    }

    add(data: ModelData) {
        if (this._assets[data.uid]) {
            return this._assets[data.uid];
        }

        let assets: number[] = [];
        let texturesMap: ModelAssetsMap = {};
        let materialsMap: ModelAssetsMap = {};
        let modelDataOptions: ModelDataOptions = {
            area: 0,
            mapping: [],
            assets: [],
            animations: []
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

        if (data.animations && data.animations.length > 0) {
            data.animations.forEach(animationData => {
                let animationAsset = this.app.animations.add(animationData);
                modelDataOptions.animations.push(animationAsset.id);
            });
        }

        let modelAsset = new pc.Asset(
            data.name,
            pc.ASSET_MODEL,
            { url: data.url },
            modelDataOptions
        );

        this._assets[data.uid] = modelAsset;
        this.app.$.assets.add(modelAsset);

        return modelAsset;
    }

    load(identity: string, options: ModelLoadOptions = {}): Promise<pc.Asset> {
        return new Promise((resolve, reject) => {
            let modelAsset = this._assets[identity];
            let loadedCounts = 0;
            let totalCounts = 1 + modelAsset.data.assets.length;
            let modelAssets = modelAsset.data.assets;

            if (options.loadAnimations) {
                totalCounts += modelAsset.data.animations.length;
                modelAssets = modelAssets.concat(modelAsset.data.animations);
            }

            let onLoaded = (asset: pc.Asset) => {
                loadedCounts++;
                if (options.onProgress) {
                    options.onProgress(asset, loadedCounts, totalCounts);
                }

                if (loadedCounts === totalCounts) {
                    resolve(modelAsset);
                }
            };

            modelAssets.forEach((assetId: number) => {
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
