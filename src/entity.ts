export interface EntityOptions {
    name?: string,
    position?: number[],
    rotation?: number[],
    scale?: number[]
}

export class Entity {
    entity : any;

    constructor(args : EntityOptions) {
        this.entity = new pc.Entity();

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
