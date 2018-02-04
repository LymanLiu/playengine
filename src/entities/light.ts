import { Entity, EntityOptions } from "./entity";
import { ENTITY_LIGHT } from "../constants";

export enum LightType {
    DIRECTIONAL = "directional",
    POINT = "point",
    SPOT = "spot"
}

export interface LightOptions extends EntityOptions {
    type?: LightType;
}

export class Light extends Entity {
    constructor(args: LightOptions = {}) {
        super(args);
        this.type = ENTITY_LIGHT;
        this.entity.addComponent("light");

        if (args.type) {
            this.entity.light.type = args.type;
        }
    }
}
