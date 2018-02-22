import { Application } from "../application";
import { Entity } from "../entities/entity";
import GizmoTransformControls from "../scripts/gizmo/transform";
import GizmoTranslate from "./translate";
import Gizmo from "./gizmo";

interface PlanesMap {
    [name: string]: pc.Plane;
}

export interface GizmoMeshInstancesMap {
    [name: string]: pc.MeshInstance[];
}

export default class GizmoTransform extends Gizmo {
    public root: pc.Entity;
    public translate: GizmoTranslate;
    public planes: PlanesMap;
    public targets: Entity[];

    constructor(app: Application) {
        super(app);

        let controls = GizmoTransformControls(app);

        this.planes = {
            XY: new pc.Plane(new pc.Vec3(0, 0, 0), new pc.Vec3(0, 0, 1)),
            XZ: new pc.Plane(new pc.Vec3(0, 0, 0), new pc.Vec3(0, 1, 0)),
            YZ: new pc.Plane(new pc.Vec3(0, 0, 0), new pc.Vec3(1, 0, 0))
        };
        this.translate = new GizmoTranslate(app);
        this.targets = [];
        this.root = new pc.Entity();
        this.root.addComponent("script");
        this.root.script.create(controls.__name);
        this.root.addChild(this.translate.root);
        this.app.$.root.addChild(this.root);
        this.root.enabled = false;
    }

    public attach(targets: Entity | Entity[]) {
        if (Array.isArray(targets)) {
            this.targets = targets;
        } else if (targets instanceof Entity) {
            this.targets = [ targets ];
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
    }

    public updatePlanes() {
        this.planes.XY.point.copy(this.root.getPosition());
        this.planes.XZ.point.copy(this.root.getPosition());
        this.planes.YZ.point.copy(this.root.getPosition());
    }
}
