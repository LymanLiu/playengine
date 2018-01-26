import { Application } from "../application";

export abstract class AssetManager {
    protected app: Application;
    protected _assets: any;

    constructor(app: Application) {
        this.app = app;
        this._assets = {};
    }

    abstract get(identity: string | number): pc.Asset;
    abstract add(data: any): any;
    abstract load(identity: string | number, options: any): Promise<pc.Asset>;
}
