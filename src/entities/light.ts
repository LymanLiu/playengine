import { Entity, EntityOptions } from "./entity";

export enum LightType {
    DIRECTIONAL = "directional",
    POINT = "point",
    SPOT = "spot"
}

export interface LightOptions extends EntityOptions {
    type?: LightType;
}

export class Light extends Entity {
    constructor(args : LightOptions = {}) {
        super(args);
        this.entity.addComponent("light");

        if (args.type) {
            this.entity.light.type = args.type;
        }
    }
}
