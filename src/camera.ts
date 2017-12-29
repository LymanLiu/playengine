import { Entity, EntityOptions } from './entity';

export interface CameraOptions extends EntityOptions {
    pitch?: number;
    yaw?: number;
    roll?: number;
}

export class Camera extends Entity {
    constructor(args : CameraOptions = {}) {
        super(args);
        this.entity.addComponent('camera');
    }
}
