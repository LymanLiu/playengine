import { ENTITY_BASE } from "../constants";

export interface EntityOptions {
    uid?: string;
    name?: string;
    position?: number[];
    rotation?: number[];
    scale?: number[];
}

export class Entity {
    public uid: string;
    public entity: pc.Entity;
    public type: string;
    public _gizmoTransformStart: number[];

    constructor(args: EntityOptions = {}) {
        this.entity = new pc.Entity();
        this.type = ENTITY_BASE;

        if (args.uid) {
            this.uid = args.uid;
        }

        if (args.name) {
            this.entity.name = args.name;
        }

        if (args.position) {
            this.entity.setPosition(...args.position);
        }

        if (args.rotation) {
            this.entity.setEulerAngles(...args.rotation);
        }

        if (args.scale) {
            this.entity.setLocalScale(...args.scale);
        }

        this.entity.getApplication().fire("app:entity:create", this);
    }

    public destroy() {
        this.entity.getApplication().fire("app:entity:create", this.entity.getGuid());
        this.entity.destroy();
    }
}
