import { createScript, ScriptType } from "./script";

export class OrbitCamera extends ScriptType {
    static __name = "orbitCamera";

    static __attributes = {
        distanceMax: { type: "number", default: 0, title: "Distance Max", description: "Setting this at 0 will give an infinite distance limit" },
        distanceMin: { type: "number", default: 0, title: "Distance Min" },
        pitchAngleMax: { type: "number", default: 90, title: "Pitch Angle Max (degrees)" },
        pitchAngleMin: { type: "number", default: -90, title: "Pitch Angle Min (degrees)" },
        inertiaFactor: { type: "number", default: 0, title: "Inertia Factor", description: "Higher value means that the camera will continue moving after the user has stopped dragging. 0 is fully responsive." },
        focusEntity: { type: "entity", title: "Focus Entity", description: "Entity for the camera to focus on. If blank, then the camera will use the whole scene" },
        frameOnStart: { type: "boolean", default: true, title: "Frame on Start", description: "Frames the entity or scene at the start of the application." },
    };

    distanceMax: number;
    distanceMin: number;
    pitchAngleMax: number;
    pitchAngleMin: number;
    inertiaFactor: number;
    focusEntity: pc.Entity;
    frameOnStart: boolean;

    _targetDistance = 0;
    _targetPitch = 0;
    _targetYaw = 0;
    _distance = 0;
    _pitch = 0;
    _yaw = 0;
    _pivotPoint = new pc.Vec3;
    _modelsAabb = new pc.BoundingBox;;
    lastPoint = new pc.Vec2();

    static distanceBetween = new pc.Vec3();
    static fromWorldPoint = new pc.Vec3();
    static toWorldPoint = new pc.Vec3();
    static worldDiff = new pc.Vec3();
    static quatWithoutYaw = new pc.Quat();
    static yawOffset = new pc.Quat();

    get distance() {
        return this._targetDistance;
    }

    set distance(value) {
        this._targetDistance = this._clampDistance(value);
    }

    get pitch() {
        return this._targetPitch;
    }

    set pitch(value) {
        this._targetPitch = this._clampPitchAngle(value);
    }

    get yaw() {
        return this._targetYaw;
    }

    set yaw(value) {
        this._targetYaw = value;

        // Ensure that the yaw takes the shortest route by making sure that
        // the difference between the targetYaw and the actual is 180 degrees
        // in either direction
        var diff = this._targetYaw - this._yaw;
        var reminder = diff % 360;
        if (reminder > 180) {
            this._targetYaw = this._yaw - (360 - reminder);
        } else if (reminder < -180) {
            this._targetYaw = this._yaw + (360 + reminder);
        } else {
            this._targetYaw = this._yaw + reminder;
        }
    }

    get pivotPoint() {
        return this._pivotPoint;
    }

    set pivotPoint(value) {
        this._pivotPoint.copy(value);
    }

    initialize() {
        let cameraQuat = this.entity.getRotation();

        this._checkAspectRatio();
        this._buildAabb(this.focusEntity || this.app.root, 0);
        this.entity.lookAt(this._modelsAabb.center);
        this._pivotPoint.copy(this._modelsAabb.center);
        this._yaw = this._calcYaw(cameraQuat);
        this._pitch = this._clampPitchAngle(this._calcPitch(cameraQuat, this._yaw));
        this.entity.setLocalEulerAngles(this._pitch, this._yaw, 0);

        this._targetYaw = this._yaw;
        this._targetPitch = this._pitch;
    }

    update(dt: number) {
        var t = this.inertiaFactor === 0 ? 1 : Math.min(dt / this.inertiaFactor, 1);
        this._distance = pc.math.lerp(this._distance, this._targetDistance, t);
        this._yaw = pc.math.lerp(this._yaw, this._targetYaw, t);
        this._pitch = pc.math.lerp(this._pitch, this._targetPitch, t);

        this._updatePosition();
    }

    focus(focusEntity: pc.Entity) {
        this._buildAabb(focusEntity, 0);

        var halfExtents = this._modelsAabb.halfExtents;

        var distance = Math.max(halfExtents.x, Math.max(halfExtents.y, halfExtents.z));
        distance = (distance / Math.tan(0.5 * this.entity.camera.fov * pc.math.DEG_TO_RAD));
        distance = (distance * 2);

        this.distance = distance;

        this._removeInertia();

        this._pivotPoint.copy(this._modelsAabb.center);
    }

    resetAndLookAt(resetPoint: pc.Vec3, lookAtPoint: pc.Vec3) {
        this.pivotPoint.copy(lookAtPoint);
        this.entity.setPosition(resetPoint);

        this.entity.lookAt(lookAtPoint);

        var distance = OrbitCamera.distanceBetween;
        distance.sub2(lookAtPoint, resetPoint);
        this.distance = distance.length();

        this.pivotPoint.copy(lookAtPoint);

        var cameraQuat = this.entity.getRotation();
        this.yaw = this._calcYaw(cameraQuat);
        this.pitch = this._calcPitch(cameraQuat, this.yaw);

        // this._removeInertia();
        this._updatePosition();
    }

    reset(pitch: number, yaw: number, distance: number) {
        this.pitch = pitch;
        this.yaw = yaw;
        this.distance = distance;

        this._removeInertia();
    }

    private _updatePosition() {
        this.entity.setLocalPosition(0, 0, 0);
        this.entity.setLocalEulerAngles(this._pitch, this._yaw, 0);

        var position = this.entity.getPosition();
        position.copy(this.entity.forward);
        position.scale(-this._distance);
        position.add(this.pivotPoint);
        this.entity.setPosition(position);
    }

    private _removeInertia() {
        this._yaw = this._targetYaw;
        this._pitch = this._targetPitch;
        this._distance = this._targetDistance;
    }

    private _checkAspectRatio() {
        let height = this.app.graphicsDevice.height;
        let width = this.app.graphicsDevice.width;

        // Match the axis of FOV to match the aspect ratio of the canvas so
        // the focused entities is always in frame
        this.entity.camera.horizontalFov = height > width;
    }

    private _buildAabb(entity: pc.Entity, modelsAdded: number) {
        let i = 0;

        if (entity.model) {
            let mi = entity.model.meshInstances;
            for (i = 0; i < mi.length; i++) {
                if (modelsAdded === 0) {
                    this._modelsAabb.copy(mi[i].aabb);
                } else {
                    this._modelsAabb.add(mi[i].aabb);
                }

                modelsAdded += 1;
            }
        }

        for (i = 0; i < entity.children.length; ++i) {
            modelsAdded += this._buildAabb(<pc.Entity>entity.children[i], modelsAdded);
        }

        return modelsAdded;
    }

    private _clampDistance(distance: number) {
        if (this.distanceMax > 0) {
            return pc.math.clamp(distance, this.distanceMin, this.distanceMax);
        } else {
            return Math.max(distance, this.distanceMin);
        }
    }

    private _clampPitchAngle(pitch: number) {
        return pc.math.clamp(pitch, -this.pitchAngleMax, -this.pitchAngleMin);
    }

    private _calcPitch(quat: pc.Quat, yaw: number) {
        let quatWithoutYaw = OrbitCamera.quatWithoutYaw;
        let yawOffset = OrbitCamera.yawOffset;

        yawOffset.setFromEulerAngles(0, -yaw, 0);
        quatWithoutYaw.mul2(yawOffset, quat);

        let transformedForward = new pc.Vec3();

        quatWithoutYaw.transformVector(pc.Vec3.FORWARD, transformedForward);

        return Math.atan2(transformedForward.y, -transformedForward.z) * pc.math.RAD_TO_DEG;
    }

    private _calcYaw(quat: pc.Quat) {
        let transformedForward = new pc.Vec3();
        quat.transformVector(pc.Vec3.FORWARD, transformedForward);

        return Math.atan2(-transformedForward.x, -transformedForward.z) * pc.math.RAD_TO_DEG;
    }
}

export default createScript(OrbitCamera);
