import { Application } from "../application";

export interface AssetData {
    uid?: string;
    name?: string;
}

export abstract class AssetManager {
    protected app: Application;
    protected _assets: any;

    constructor(app: Application) {
        this.app = app;
        this._assets = {};
    }

    public abstract add(data: any): pc.Asset;

    public get(identity: string | number): pc.Asset {
        return this._assets[identity] || null;
    }

    public load(identity: number | string): Promise<pc.Asset> {
        return new Promise((resolve, reject) => {
            let asset = this._assets[identity];

            if (asset.loaded) {
                return resolve(asset);
            }

            asset.on("load", resolve);
            asset.on("error", reject);
            this.app.$.assets.load(asset);
        });
    }
}
