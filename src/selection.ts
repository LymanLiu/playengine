import { Application } from "./application";
import { Camera } from "./entities/camera";
import { Model } from "./entities/model";
import { Entity } from "./entities/entity";

export default class Selection {
    private app: Application;
    private camera: Camera;
    private fromPoint: pc.Vec3;
    private toPoint: pc.Vec3;
    private worldRay: pc.Ray;
    private _items: any;

    constructor(app: Application) {
        this.app = app;
        this.camera = null;
        this.fromPoint = new pc.Vec3();
        this.toPoint = new pc.Vec3();
        this.worldRay = new pc.Ray();
        this._items = {};
    }

    public get(uid: string) {
        return this._items[uid];
    }

    public add(item: any) {
        let uid = item.entity.getGuid();
        if (!this.get(uid)) {
            this._items[uid] = item;
            this.app.$.fire("app:selection:add", uid);
            this.app.$.fire(`app:selection:add:${uid}`, item);
        }
    }

    public remove(uid: string) {
        if (!this.get(uid)) {
            return;
        }

        delete this._items[uid];
        this.app.$.fire("app:selection:remove", uid);
        this.app.$.fire(`app:selection:remove:${uid}`, this.get(uid));
    }

    public clear() {
        for (let uid in this._items) {
            if (this._items.hasOwnProperty(uid)) {
                this.remove(uid);
            }
        }

        this.app.$.fire("app:selection:clear");
    }

    public attach(camera: Camera) {
        this.camera = camera;
        return this;
    }

    public detach() {
        this.camera = null;
        return this;
    }

    public prepareRay(x: number, y: number) {
        let camera = this.camera.entity.camera;
        let fromPoint = this.fromPoint;
        let toPoint = this.toPoint;
        let ray = this.worldRay;
        camera.screenToWorld(x, y, camera.nearClip, fromPoint);
        camera.screenToWorld(x, y, camera.farClip, toPoint);
        ray.origin.copy(fromPoint);
        ray.direction.copy(toPoint).sub(ray.origin).normalize();

        return ray;
    }

    public select(x: number, y: number) {
        this.checkCamera();
        this.prepareRay(x, y);

        let result = null;
        let ray = this.worldRay;
        let entities = this.app.entities.list();

        for (let entity of entities) {
            if (entity instanceof Model && entity.aabb.intersectsRay(ray)) {
                result = entity;
                break;
            }
        }

        return result;
    }

    public select2(x: number, y: number) {
        this.checkCamera();
        this.prepareRay(x, y);

        let result = null;
        let distance = Infinity;
        let intersection = null;
        let ray = this.worldRay;
        let entities = this.app.entities.list((entity: Entity) => entity instanceof Model) as Model[];

        for (let entity of entities) {
            intersection = ray.intersectsMeshInstances(entity.model.meshInstances);
            if (intersection && intersection[0].distance < distance) {
                result = entity;
                distance = intersection[0].distance;
            }
        }

        return result;
    }

    private checkCamera() {
        if (!this.camera) {
            throw Error("No camera found, please use selection.attach first.");
        }

        if (!this.camera.entity.enabled) {
            throw Error("The attached camera is not enabled now, please enable it first.");
        }
    }
}
