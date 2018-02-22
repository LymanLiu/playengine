import { createScript, ScriptType } from "../script";
import { Entity } from "../../entities/entity";

export class GizmoTransformControls extends ScriptType {
    public static readonly __name = "gizmoTransformControls";

    private hoverAxis: string = null;
    private hoverPoint = new pc.Vec3();
    private startPoint = new pc.Vec3();
    private hitPoint = new pc.Vec3();
    private position = new pc.Vec3();
    private offset = new pc.Vec3();
    private tempPosition = new pc.Vec3();
    private isDragging = false;

    public initialize() {
        this.on("enable", this.onEnable);
        this.on("disable", this.onDisable);

        this.onEnable();
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

    private onMouseDown() {
        if (!this.hoverAxis) return;

        this.startPoint.copy(this.hoverPoint);
        this.position.copy(this.App.gizmos.transform.root.getPosition());
        this.App.selection.camera.entity.script.enabled = false;
        this.App.gizmos.transform.targets.forEach((target: Entity) => {
            target._gizmoTransformStart = Array.from(target.entity.getPosition().data);
        });
        this.isDragging = true;
    }

    private onMouseUp() {
        this.App.selection.camera.entity.script.enabled = true;
        this.App.gizmos.transform.updatePlanes();
        this.isDragging = false;
    }

    private onMouseMove(event: pc.MouseEvent) {
        let ray = this.App.selection.prepareRay(event.x, event.y);
        let intersects = ray.intersectMeshInstances(this.App.gizmos.transform.translate.pickerMeshInstances);

        if (this.isDragging) {
            this.App.gizmos.transform
                .getPlaneByAxis(this.hoverAxis)
                .intersectsRay(ray, this.hitPoint);

            this.offset.sub2(this.hitPoint, this.startPoint);

            if (this.hoverAxis.search("X") === -1) this.offset.x = 0;
            if (this.hoverAxis.search("Y") === -1) this.offset.y = 0;
            if (this.hoverAxis.search("Z") === -1) this.offset.z = 0;

            this.tempPosition.add2(this.position, this.offset);
            this.App.gizmos.transform.root.setPosition(this.tempPosition);
            this.App.gizmos.transform.targets.forEach((target: Entity) => {
                target.entity.setPosition(
                    target._gizmoTransformStart[0] + this.offset.x,
                    target._gizmoTransformStart[1] + this.offset.y,
                    target._gizmoTransformStart[2] + this.offset.z
                );
            });
            return;
        } else if (!intersects) {
            this.hoverAxis = null;
            return;
        }

        let result = intersects[0];

        this.hoverAxis = result.meshInstance.node.name;
        this.hoverPoint.copy(result.point);
    }
}

export default createScript(GizmoTransformControls);
