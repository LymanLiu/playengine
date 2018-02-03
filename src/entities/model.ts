import { Entity, EntityOptions } from "./entity";
import { MATERIAL_TEXTURE_FIELDS } from "../constants";

export interface ModelOptions extends EntityOptions {
    uid?: string;
    type?: string;
    asset?: number | pc.Asset;
    animations?: ModelAnimationOptions;
}

enum AnimationCycleMode {
    NONE = "none",
    ONE = "one",
    ALL = "all"
}

interface ModelAnimationOptions {
    assets?: number[];
    activate?: boolean;
    cycleMode?: AnimationCycleMode;
    speed: number;
}

interface ModelAnimation {
    name: string;
    asset: number;
    animation: pc.Animation;
}

export class Model extends Entity {

    private _cycleMode: AnimationCycleMode;

    constructor(args: ModelOptions = {}) {
        super(args);
        this.entity.addComponent("model", { type: "asset" });

        if (args.type) {
            this.entity.model.type = args.type;
        }

        if (args.asset) {
            this.entity.model.asset = args.asset;
        }

        if (args.animations) {

            if (!this.entity.script) {
                this.entity.addComponent("script");
            }

            this.entity.script.create("animationController");

            this.entity.addComponent("animation", {
                activate: args.animations.activate || false,
                assets: Array.isArray(args.animations.assets) ? args.animations.assets : [],
                loop: false,
                speed: args.animations.speed || 1
            });

            this.cycleMode = args.animations.cycleMode || AnimationCycleMode.NONE;
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
                animation,
                asset: assetId,
                name,
            });
        });

        return results;
    }

    get cycleMode() {
        return this._cycleMode;
    }

    set cycleMode(value: AnimationCycleMode) {
        switch (this.cycleMode) {
            case AnimationCycleMode.NONE:
                this.entity.animation.play(this.entity.animation.currAnim);
                break;
            case AnimationCycleMode.ONE:
                this.entity.animation.off("end", this.onCycleOne);
                break;
            case AnimationCycleMode.ALL:
                this.entity.animation.off("end", this.onCycleAll);
                break;
        }

        switch (value) {
            case AnimationCycleMode.ONE:
                this.entity.animation.on("end", this.onCycleOne, this);
                break;
            case AnimationCycleMode.ALL:
                this.entity.animation.on("end", this.onCycleAll, this);
                break;
        }

        this._cycleMode = value;
    }

    private onCycleOne(currAnim: string) {
        this.entity.animation.play(currAnim);
    }

    private onCycleAll(currAnim: string) {
        let nextAnim = null;
        const animations = this.animations;

        if (animations.length === 1) {
            nextAnim = currAnim;
        } else {
            for (let i = 0; i < animations.length; i++) {
                let animation = animations[i];
                if (animation.name === currAnim) {
                    if (i === animations.length - 1) {
                        nextAnim = animations[0].name;
                    } else {
                        nextAnim = animations[i + 1].name;
                    }
                }
            }
        }

        this.entity.animation.play(nextAnim);
    }
}
