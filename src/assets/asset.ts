import { Application } from "../application";

export interface AssetData {
    uid?: string;
    name?: string;
}

export abstract class AssetManager {
    protected app: Application;
    protected _assets: any;

    abstract add(data: any): pc.Asset;

    constructor(app: Application) {
        this.app = app;
        this._assets = {};
    }

    get(identity: string | number): pc.Asset {
        return this._assets[identity] || null;
    }

    load(identity: number | string): Promise<pc.Asset> {
        return new Promise((resolve, reject) => {
            let asset = this._assets[identity];
            asset.on("load", resolve);
            asset.on("error", reject);
            this.app.$.assets.load(asset);
        });
    }
}
