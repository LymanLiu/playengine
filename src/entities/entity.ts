export interface EntityOptions {
    uid?: string;
    name?: string;
    position?: number[];
    rotation?: number[];
    scale?: number[];
}

export class Entity {
    uid: string;
    entity: pc.Entity;

    constructor(args: EntityOptions = {}) {
        this.entity = new pc.Entity();

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
    }
}
