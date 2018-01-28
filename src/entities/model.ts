import { Entity, EntityOptions } from "./entity";
import { MATERIAL_TEXTURE_FIELDS } from "../constants";

export interface ModelOptions extends EntityOptions {
    uid?: string;
    type?: string;
    asset?: number | pc.Asset
}

export class Model extends Entity {
    uid : string;
    aabb : any;

    constructor(args : ModelOptions = {}) {
        super(args);
        this.entity.addComponent("model");

        if (args.uid) {
            this.uid = args.uid;
        }

        if (args.type) {
            this.entity.model.type = args.type;
        }

        if (args.asset) {
            this.entity.model.asset = args.asset;
        }
    }

    get model() {
        return this.entity.model.model;
    }

    get mapping() {
        return this.model.meshInstances.map((mi: pc.MeshInstance) => mi.material.name);
    }

    get materials() {
        return this.model.getMaterials();
    }

    get textures() {
        let results: Array<pc.Texture> = [];
        this.materials.map((material: pc.StandardMaterial) => {
            MATERIAL_TEXTURE_FIELDS.forEach((field: string) => {
                let texture = material[field];
                if (texture && !~results.indexOf(texture)) {
                    results.push(texture);
                }
            });
        })

        return results;
    }
}
