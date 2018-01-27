import { Application } from "../application";
import { AssetManager, AssetData } from "./asset";
import { ModelAssetsMap } from "./model";
import { MATERIAL_TEXTURE_FIELDS } from "../constants";

export default class MaterialManager extends AssetManager {

    constructor(app: Application) {
        super(app);
    }

    add(data: MaterialData) {
        if (!data.shader) {
            data.shader = "blinn";
        }

        let materialAsset = new pc.Asset(data.name, pc.ASSET_MATERIAL, null, data);

        this._assets[materialAsset.id] = materialAsset;
        this.app.$.assets.add(materialAsset);

        return materialAsset;
    }

    link(materialData: MaterialData, texturesMap: ModelAssetsMap) {
        MATERIAL_TEXTURE_FIELDS.forEach((field: string) => {
            if (typeof materialData[field] === "string") {
                materialData[field] = texturesMap[materialData[field]];
            }
        });
    }
}

export interface MaterialData extends AssetData {
    aoMap?: string;
    diffuseMap?: string;
    glossMap?: string;
    metalnessMap?: string;
    specularMap?: string;
    emissiveMap?: string;
    opacityMap?: string;
    lightMap?: string;
    normalMap?: string;
    heightMap?: string;
    sphereMap?: string;
    cubeMap?: string;

    [prop: string]: any;
};

