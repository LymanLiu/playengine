import { Entity, EntityOptions } from "./entity";
import { MATERIAL_TEXTURE_FIELDS } from "../constants";

export interface ModelOptions extends EntityOptions {
    uid?: string;
    type?: string;
    asset?: number | pc.Asset;
    animations?: number[] | boolean;
}

interface ModelAnimation {
    name: string;
    asset: number;
    animation: pc.Animation;
}

export class Model extends Entity {
    uid: string;
    aabb: any;

    constructor(args: ModelOptions = {}) {
        super(args);
        this.entity.addComponent("model", { type: "asset" });

        if (args.uid) {
            this.uid = args.uid;
        }

        if (args.type) {
            this.entity.model.type = args.type;
        }

        if (args.asset) {
            this.entity.model.asset = args.asset;
        }

        if (args.animations) {
            this.entity.addComponent("animation");

            if (Array.isArray(args.animations)) {
                this.entity.animation.assets = args.animations;
            }
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
        let results: pc.Texture[] = [];
        this.materials.map((material: pc.StandardMaterial) => {
            MATERIAL_TEXTURE_FIELDS.forEach((field: string) => {
                let texture = material[field];
                if (texture && !~results.indexOf(texture)) {
                    results.push(texture);
                }
            });
        });

        return results;
    }

    get animations() {

        if (!this.entity.animation) {
            return null;
        }

        let results: ModelAnimation[] = [];
        let assets = this.entity.animation.assets;
        let animations = this.entity.animation.animations;
        let animationsIndex = this.entity.animation.animationsIndex;

        assets.forEach((assetId: number) => {
            let name = animationsIndex[assetId];
            let animation = animations[name];
            results.push({
                name: name,
                asset: assetId,
                animation: animation
            });
        });

        return results;
    }
}
