import { Entity, EntityOptions } from "./entity";

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
        this.aabb = new pc.BoundingBox();

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
}
