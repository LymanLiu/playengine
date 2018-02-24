import { Application } from "../application";
import { Entity } from "../entities/entity";
import GizmoTransformControls from "../scripts/gizmo/transform";
import GizmoTranslate from "./translate";
import GizmoRotate from "./rotate";
import Gizmo from "./gizmo";

interface PlanesMap {
    [name: string]: pc.Plane;
}

export interface GizmoMeshInstancesMap {
    [name: string]: pc.MeshInstance[];
}

export default class GizmoTransform extends Gizmo {
    public root: pc.Entity;
    public targets: Entity[];
    public planes: PlanesMap;
    public translate: GizmoTranslate;
    public rotate: GizmoRotate;

    private _mode: string = "rotate";

    constructor(app: Application) {
        super(app);

        let controls = GizmoTransformControls(app);

        this.planes = {
            XY: new pc.Plane(new pc.Vec3(0, 0, 0), new pc.Vec3(0, 0, 1)),
            XZ: new pc.Plane(new pc.Vec3(0, 0, 0), new pc.Vec3(0, 1, 0)),
            YZ: new pc.Plane(new pc.Vec3(0, 0, 0), new pc.Vec3(1, 0, 0))
        };
        this.translate = new GizmoTranslate(app);
        this.rotate = new GizmoRotate(app);
        this.targets = [];
        this.root = new pc.Entity();
        this.root.enabled = false;
        this.root.addComponent("script");
        this.root.script.create(controls.__name);
        this.root.addChild(this.translate.root);
        this.root.addChild(this.rotate.root);
        this.app.$.root.addChild(this.root);

        this.mode = this._mode;
    }

    get mode() {
        return this._mode;
    }

    set mode(value: string) {
        this._mode = value;

        this.translate.root.enabled = false;
        this.rotate.root.enabled = false;

        switch (value) {
            case "translate":
                this.translate.root.enabled = true;
                break;
            case "rotate":
                this.rotate.root.enabled = true;
                break;
        }

    }

    get modeInstance() {
        switch (this._mode) {
            case "translate":
                return this.translate;
            case "rotate":
                return this.rotate;
        }
    }

    public attach(targets: Entity | Entity[]) {
        if (Array.isArray(targets)) {
            this.targets = targets;
        } else if (targets instanceof Entity) {
            this.targets = [targets];
        }

        this.root.setPosition(this.targets[0].entity.getPosition());
        this.root.enabled = true;
    }

    public detach() {
        this.targets = [];
        this.root.enabled = false;
    }

    public destroy() {
        this.app.$.root.removeChild(this.root);
        this.root.destroy();
        this.targets = [];
        this.translate = null;
    }

    public getPlaneByAxis(axis: string) {
        switch (this._mode) {
            case "translate":
                switch (axis) {
                    case "X":
                        return this.planes.XY;
                    case "Y":
                        return this.planes.XY;
                    case "Z":
                        return this.planes.XZ;
                    default:
                        return this.planes[axis];
                }
            case "rotate":
                switch (axis) {
                    case "X":
                        return this.planes.YZ;
                    case "Y":
                        return this.planes.XZ;
                    case "Z":
                        return this.planes.XY;
                }
        }

    }

    public updatePlanes() {
        this.planes.XY.point.copy(this.root.getPosition());
        this.planes.XZ.point.copy(this.root.getPosition());
        this.planes.YZ.point.copy(this.root.getPosition());
    }
}
