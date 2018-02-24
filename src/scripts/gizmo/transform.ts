import { createScript, ScriptType } from "../script";
import { Entity } from "../../entities/entity";
import GizmoTransform from "../../gizmos/transform";

export class GizmoTransformControls extends ScriptType {
    public static readonly __name = "gizmoTransformControls";

    private transform: GizmoTransform;
    private hoverAxis: string = null;
    private hoverPoint = new pc.Vec3();
    private startPoint = new pc.Vec3();
    private hitPoint = new pc.Vec3();
    private position = new pc.Vec3();
    private offset = new pc.Vec3();
    private vecA = new pc.Vec3();
    private vecB = new pc.Vec3();
    private vecC = new pc.Vec3();
    private vecD = new pc.Vec3();
    private matA = new pc.Mat4();
    private quatA = new pc.Quat();
    private quatB = new pc.Quat();
    private isDragging = false;

    public initialize() {
        this.transform = this.App.gizmos.transform;

        this.on("enable", this.onEnable);
        this.on("disable", this.onDisable);

        this.onEnable();
    }

    public update() {
        let handlerGizmos = this.transform.modeInstance.handlerGizmos;
        for (let name in handlerGizmos) {
            handlerGizmos[name].forEach((mi: pc.MeshInstance) => {
                let material = mi.material as pc.BasicMaterial;
                let color = this.hoverAxis === name ? [1, 1, 1, 1] : material._color;
                material.color.set(color[0], color[1], color[2], color[3]);
                material.update();
            });
        }
    }

    private onEnable() {
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this, 9);
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this, 9);
        this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this, 9);
    }

    private onDisable() {
        this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        this.app.mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this);
    }

    private onMouseDown(event: pc.MouseEvent) {
        if (!this.hoverAxis) return;

        event.stopPropagation();

        this.startPoint.copy(this.hoverPoint);
        this.position.copy(this.transform.root.getPosition());
        this.transform.targets.forEach((target: Entity) => {
            target._gizmoTransformStart = Array.from(target.entity.getWorldTransform().data) as [
                number, number, number, number,
                number, number, number, number,
                number, number, number, number,
                number, number, number, number
            ];
        });
        this.isDragging = true;
    }

    private onMouseUp(event: pc.MouseEvent) {
        if (!this.isDragging) return;

        event.stopPropagation();

        this.transform.updatePlanes();
        this.transform.targets.forEach((target: Entity) => {
            delete target._gizmoTransformStart;
        });
        this.isDragging = false;
    }

    private onMouseMove(event: pc.MouseEvent) {
        let ray = this.App.selection.prepareRay(event.x, event.y);
        let intersects = ray.intersectsMeshInstances(this.transform.modeInstance.pickerMeshInstances);

        if (this.isDragging) {
            this.transform
                .getPlaneByAxis(this.hoverAxis)
                .intersectsRay(ray, this.hitPoint);

            if (this.transform.mode === "translate") {
                this.offset.sub2(this.hitPoint, this.startPoint);

                if (this.hoverAxis.search("X") === -1) this.offset.x = 0;
                if (this.hoverAxis.search("Y") === -1) this.offset.y = 0;
                if (this.hoverAxis.search("Z") === -1) this.offset.z = 0;

                this.vecA.add2(this.position, this.offset);
                this.transform.root.setPosition(this.vecA);
                this.transform.targets.forEach((target: Entity) => {
                    this.matA.set(target._gizmoTransformStart);
                    this.matA.getTranslation(this.vecB);
                    target.entity.setPosition(
                        this.vecB.x + this.offset.x,
                        this.vecB.y + this.offset.y,
                        this.vecB.z + this.offset.z
                    );
                });
            } else if (this.transform.mode === "scale") {
                this.offset.sub2(this.hitPoint, this.startPoint);

                if (this.hoverAxis.search("X") === -1) this.offset.x = 0;
                if (this.hoverAxis.search("Y") === -1) this.offset.y = 0;
                if (this.hoverAxis.search("Z") === -1) this.offset.z = 0;

                this.transform.targets.forEach((target: Entity) => {
                    this.matA.set(target._gizmoTransformStart);
                    this.matA.getScale(this.vecA);
                    this.matA.invert().getScale(this.vecB);
                    target.entity.setLocalScale(
                        this.vecA.x * (1 + this.offset.x / this.vecB.x),
                        this.vecA.y * (1 + this.offset.y / this.vecB.y),
                        this.vecA.z * (1 + this.offset.z / this.vecB.z)
                    );
                });
            } else if (this.transform.mode === "rotate") {
                this.transform.targets.forEach((target: Entity) => {
                    let worldPosition = target.entity.getPosition();
                    this.matA.set(target._gizmoTransformStart);
                    this.quatA.setFromMat4(this.matA);
                    this.vecA.copy(this.startPoint).sub(worldPosition).normalize();
                    this.vecB.copy(this.hitPoint).sub(worldPosition).normalize();
                    // start
                    this.vecC.set(
                        Math.atan2(this.vecA.z, this.vecA.y) * pc.math.RAD_TO_DEG,
                        Math.atan2(this.vecA.x, this.vecA.z) * pc.math.RAD_TO_DEG,
                        Math.atan2(this.vecA.y, this.vecA.x) * pc.math.RAD_TO_DEG
                    );
                    // offset
                    this.vecD.set(
                        Math.atan2(this.vecB.z, this.vecB.y) * pc.math.RAD_TO_DEG,
                        Math.atan2(this.vecB.x, this.vecB.z) * pc.math.RAD_TO_DEG,
                        Math.atan2(this.vecB.y, this.vecB.x) * pc.math.RAD_TO_DEG
                    );

                    switch (this.hoverAxis) {
                        case "X":
                            this.quatB.setFromAxisAngle(pc.Vec3.RIGHT, this.vecD.x - this.vecC.x);
                            break;
                        case "Y":
                            this.quatB.setFromAxisAngle(pc.Vec3.UP, this.vecD.y - this.vecC.y);
                            break;
                        case "Z":
                            this.quatB.setFromAxisAngle(pc.Vec3.BACK, this.vecD.z - this.vecC.z);
                            break;
                    }

                    this.quatB.mul(this.quatA);
                    target.entity.setRotation(this.quatB);
                });
            }

            return;
        } else if (!intersects) {
            this.hoverAxis = null;
            return;
        }

        let result = intersects[0];

        this.hoverAxis = result.meshInstance.node.name;
        this.transform.getPlaneByAxis(this.hoverAxis).intersectsRay(ray, this.hoverPoint);
    }
}

export default createScript(GizmoTransformControls);
