import { Application } from "../application";
import { Model } from "../entities/Model";
import Gizmo from "./gizmo";

export default class GizmoAabb extends Gizmo {
    private _color = new pc.Color(1, 1, 1, 1);
    private _target: Model | Model[] = null;
    private _vecA = new pc.Vec3();
    private _vecB = new pc.Vec3();

    constructor(app: Application) {
        super(app);
    }

    get color() {
        return this._color;
    }

    set color(color: pc.Color) {
        this._color = color;
    }

    get target() {
        return this._target;
    }

    public attach(target: Model | Model[]) {
        if (!target) {
            throw Error("GizmoAabb should attach with Model or Model[]");
        }

        let onUpdate = Array.isArray(target) ? this.onUpdate2 : this.onUpdate;

        this.detach();
        this._target = target;
        this.app.$.on("update", onUpdate, this);
    }

    public detach() {
        this._target = null;
        this.app.$.off("update", this.onUpdate, this);
        this.app.$.off("update", this.onUpdate2, this);
    }

    public destroy() {
        this.detach();
    }

    private onUpdate() {
        this.render((this._target as Model).aabb);
    }

    private onUpdate2() {
        (this._target as Model[]).forEach((target: Model) => this.render(target.aabb));
    }

    private render(aabb: pc.BoundingBox) {
        /*

          5____4
        1/___0/|
        | 6__|_7
        2/___3/

        */

        // 0 - 1
        this._vecA.set(
            aabb.center.x + aabb.halfExtents.x,
            aabb.center.y + aabb.halfExtents.y,
            aabb.center.z + aabb.halfExtents.z
        );
        this._vecB.set(
            aabb.center.x - aabb.halfExtents.x,
            aabb.center.y + aabb.halfExtents.y,
            aabb.center.z + aabb.halfExtents.z
        );
        this.app.$.renderLine(this._vecA, this._vecB, this._color);

        // 0 - 3
        this._vecA.set(
            aabb.center.x + aabb.halfExtents.x,
            aabb.center.y + aabb.halfExtents.y,
            aabb.center.z + aabb.halfExtents.z
        );
        this._vecB.set(
            aabb.center.x + aabb.halfExtents.x,
            aabb.center.y - aabb.halfExtents.y,
            aabb.center.z + aabb.halfExtents.z
        );
        this.app.$.renderLine(this._vecA, this._vecB, this._color);

        // 0 - 4
        this._vecA.set(
            aabb.center.x + aabb.halfExtents.x,
            aabb.center.y + aabb.halfExtents.y,
            aabb.center.z + aabb.halfExtents.z
        );
        this._vecB.set(
            aabb.center.x + aabb.halfExtents.x,
            aabb.center.y + aabb.halfExtents.y,
            aabb.center.z - aabb.halfExtents.z
        );
        this.app.$.renderLine(this._vecA, this._vecB, this._color);

        // 1 - 2
        this._vecA.set(
            aabb.center.x - aabb.halfExtents.x,
            aabb.center.y + aabb.halfExtents.y,
            aabb.center.z + aabb.halfExtents.z
        );
        this._vecB.set(
            aabb.center.x - aabb.halfExtents.x,
            aabb.center.y - aabb.halfExtents.y,
            aabb.center.z + aabb.halfExtents.z
        );
        this.app.$.renderLine(this._vecA, this._vecB, this._color);

        // 1 - 5
        this._vecA.set(
            aabb.center.x - aabb.halfExtents.x,
            aabb.center.y + aabb.halfExtents.y,
            aabb.center.z + aabb.halfExtents.z
        );
        this._vecB.set(
            aabb.center.x - aabb.halfExtents.x,
            aabb.center.y + aabb.halfExtents.y,
            aabb.center.z - aabb.halfExtents.z
        );
        this.app.$.renderLine(this._vecA, this._vecB, this._color);

        // 2 - 3
        this._vecA.set(
            aabb.center.x - aabb.halfExtents.x,
            aabb.center.y - aabb.halfExtents.y,
            aabb.center.z + aabb.halfExtents.z
        );
        this._vecB.set(
            aabb.center.x + aabb.halfExtents.x,
            aabb.center.y - aabb.halfExtents.y,
            aabb.center.z + aabb.halfExtents.z
        );
        this.app.$.renderLine(this._vecA, this._vecB, this._color);

        // 2 - 6
        this._vecA.set(
            aabb.center.x - aabb.halfExtents.x,
            aabb.center.y - aabb.halfExtents.y,
            aabb.center.z + aabb.halfExtents.z
        );
        this._vecB.set(
            aabb.center.x - aabb.halfExtents.x,
            aabb.center.y - aabb.halfExtents.y,
            aabb.center.z - aabb.halfExtents.z
        );
        this.app.$.renderLine(this._vecA, this._vecB, this._color);

        // 3 - 7
        this._vecA.set(
            aabb.center.x + aabb.halfExtents.x,
            aabb.center.y - aabb.halfExtents.y,
            aabb.center.z + aabb.halfExtents.z
        );
        this._vecB.set(
            aabb.center.x + aabb.halfExtents.x,
            aabb.center.y - aabb.halfExtents.y,
            aabb.center.z - aabb.halfExtents.z
        );
        this.app.$.renderLine(this._vecA, this._vecB, this._color);

        // 4 - 5
        this._vecA.set(
            aabb.center.x + aabb.halfExtents.x,
            aabb.center.y + aabb.halfExtents.y,
            aabb.center.z - aabb.halfExtents.z
        );
        this._vecB.set(
            aabb.center.x - aabb.halfExtents.x,
            aabb.center.y + aabb.halfExtents.y,
            aabb.center.z - aabb.halfExtents.z
        );
        this.app.$.renderLine(this._vecA, this._vecB, this._color);

        // 4 - 7
        this._vecA.set(
            aabb.center.x + aabb.halfExtents.x,
            aabb.center.y + aabb.halfExtents.y,
            aabb.center.z - aabb.halfExtents.z
        );
        this._vecB.set(
            aabb.center.x + aabb.halfExtents.x,
            aabb.center.y - aabb.halfExtents.y,
            aabb.center.z - aabb.halfExtents.z
        );
        this.app.$.renderLine(this._vecA, this._vecB, this._color);

        // 5 - 6
        this._vecA.set(
            aabb.center.x - aabb.halfExtents.x,
            aabb.center.y + aabb.halfExtents.y,
            aabb.center.z - aabb.halfExtents.z
        );
        this._vecB.set(
            aabb.center.x - aabb.halfExtents.x,
            aabb.center.y - aabb.halfExtents.y,
            aabb.center.z - aabb.halfExtents.z
        );
        this.app.$.renderLine(this._vecA, this._vecB, this._color);

        // 6 - 7
        this._vecA.set(
            aabb.center.x - aabb.halfExtents.x,
            aabb.center.y - aabb.halfExtents.y,
            aabb.center.z - aabb.halfExtents.z
        );
        this._vecB.set(
            aabb.center.x + aabb.halfExtents.x,
            aabb.center.y - aabb.halfExtents.y,
            aabb.center.z - aabb.halfExtents.z
        );
        this.app.$.renderLine(this._vecA, this._vecB, this._color);
    }
}
