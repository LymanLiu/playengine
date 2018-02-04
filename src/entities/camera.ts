import { Entity, EntityOptions } from "./entity";
import { ENTITY_CAMERA } from "../constants";

export interface CameraOptions extends EntityOptions {
    pitch?: number;
    yaw?: number;
    roll?: number;
}

export class Camera extends Entity {
    constructor(args: CameraOptions = {}) {
        super(args);
        this.type = ENTITY_CAMERA;
        this.entity.addComponent("camera");
    }
}
