import { Application } from "../application";
import { AssetManager, AssetData } from "./asset";

export interface MaterialData extends AssetData {

};

export default class MaterialManager extends AssetManager {

    constructor(app: Application) {
        super(app);
    }

    get(identity: number) {
        return this._assets[identity];
    }

    add(data: MaterialData) {
        let materialAsset = new pc.Asset(data.name, pc.ASSET_MATERIAL, null, data);

        this._assets[materialAsset.id] = materialAsset;
        this.app.$.assets.add(materialAsset);

        return materialAsset;
    }

    load(identity: number): Promise<pc.Asset> {
        return new Promise((resolve, reject) => {
            let materialAsset = this._assets[identity];
            materialAsset.on("load", resolve);
            materialAsset.on("error", reject);
            this.app.$.assets.load(materialAsset);
        });
    }
}
