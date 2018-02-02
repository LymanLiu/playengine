import { Application } from "../application";
import { AssetManager, AssetData } from "./asset";

export interface AnimationData extends AssetData {
    url: string;
}

export default class AnimationManager extends AssetManager {
    constructor(app: Application) {
        super(app);
    }

    add(data: AnimationData) {
        let animationAsset = new pc.Asset(data.name, pc.ASSET_ANIMATION, { url: data.url });
        this._assets[animationAsset.id] = animationAsset;
        this.app.$.assets.add(animationAsset);
        return animationAsset;
    }
}
