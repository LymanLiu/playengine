import { createScript, ScriptType } from "./script";
import { OrbitCamera } from "./orbitCamera";

class OrbitCameraTouchInput extends ScriptType {
    static __name = "orbitCameraTouchInput";

    static __attributes = {
        orbitSensitivity: {
            type: "number",
            default: 0.4,
            title: "Orbit Sensitivity",
            description: "How fast the camera moves around the orbit. Higher is faster"
        },
        distanceSensitivity: {
            type: "number",
            default: 0.2,
            title: "Distance Sensitivity",
            description: "How fast the camera moves in and out. Higher is faster"
        },
        pinchSensitivity: {
            type: "number",
            default: 1,
            title: "Pinch Sensitivity"
        }
    };

    static fromWorldPoint = new pc.Vec3();
    static toWorldPoint = new pc.Vec3();
    static worldDiff = new pc.Vec3();
    static pinchMidPoint = new pc.Vec2();

    orbitCamera: OrbitCamera;

    initialize() {
        this.orbitCamera = this.entity.script.orbitCamera;

        // Store the position of the touch so we can calculate the distance moved
        this.lastTouchPoint = new pc.Vec2();
        this.lastPinchMidPoint = new pc.Vec2();
        this.lastPinchDistance = 0;

        if (this.orbitCamera && this.app.touch) {
            // Use the same callback for the touchStart, touchEnd and touchCancel events as they
            // all do the same thing which is to deal the possible multiple touches to the screen

            this.on("enable", this.onEnable);
            this.on("disable", this.onDisable);

            this.onEnable();
        }
    }

    onEnable() {
        this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStartEndCancel, this);
        this.app.touch.on(pc.EVENT_TOUCHEND, this.onTouchStartEndCancel, this);
        this.app.touch.on(pc.EVENT_TOUCHCANCEL, this.onTouchStartEndCancel, this);

        this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
    }

    onDisable() {
        this.app.touch.off(pc.EVENT_TOUCHSTART, this.onTouchStartEndCancel, this);
        this.app.touch.off(pc.EVENT_TOUCHEND, this.onTouchStartEndCancel, this);
        this.app.touch.off(pc.EVENT_TOUCHCANCEL, this.onTouchStartEndCancel, this);

        this.app.touch.off(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
    }

    getPinchDistance(pointA: pc.Touch, pointB: pc.Touch): number {
        // Return the distance between the two points
        var dx = pointA.x - pointB.x;
        var dy = pointA.y - pointB.y;

        return Math.sqrt((dx * dx) + (dy * dy));
    }


    calcMidPoint(pointA: pc.Touch, pointB: pc.Touch, result: pc.Vec2) {
        result.set(pointB.x - pointA.x, pointB.y - pointA.y);
        result.scale(0.5);
        result.x += pointA.x;
        result.y += pointA.y;
    }

    private onTouchStartEndCancel(event: pc.TouchEvent) {
        event.event.preventDefault();
        // We only care about the first touch for camera rotation. As the user touches the screen,
        // we stored the current touch position
        var touches = event.touches;
        if (touches.length == 1) {
            this.lastTouchPoint.set(touches[0].x, touches[0].y);
        } else if (touches.length == 2) {
            // If there are 2 touches on the screen, then set the pinch distance
            this.lastPinchDistance = this.getPinchDistance(touches[0], touches[1]);
            this.calcMidPoint(touches[0], touches[1], this.lastPinchMidPoint);
        }

        setTimeout(() => {
            this.app.fire("app:camera.moveend");
        }, 250);
    }

    private pan(midPoint: pc.Vec2) {
        var fromWorldPoint = OrbitCameraTouchInput.fromWorldPoint;
        var toWorldPoint = OrbitCameraTouchInput.toWorldPoint;
        var worldDiff = OrbitCameraTouchInput.worldDiff;

        // For panning to work at any zoom level, we use screen point to world projection
        // to work out how far we need to pan the pivotEntity in world space
        var camera = this.entity.camera;
        var distance = this.orbitCamera.distance;

        camera.screenToWorld(midPoint.x, midPoint.y, distance, fromWorldPoint);
        camera.screenToWorld(this.lastPinchMidPoint.x, this.lastPinchMidPoint.y, distance, toWorldPoint);

        worldDiff.sub2(toWorldPoint, fromWorldPoint);

        this.orbitCamera.pivotPoint.add(worldDiff);
    }

    private onTouchMove(event: pc.TouchEvent) {
        var pinchMidPoint = OrbitCameraTouchInput.pinchMidPoint;

        // We only care about the first touch for camera rotation. Work out the difference moved since the last event
        // and use that to update the camera target position
        var touches = event.touches;
        if (touches.length == 1) {
            var touch = touches[0];

            this.orbitCamera.pitch -= (touch.y - this.lastTouchPoint.y) * this.orbitSensitivity;
            this.orbitCamera.yaw -= (touch.x - this.lastTouchPoint.x) * this.orbitSensitivity;
            this.lastTouchPoint.set(touch.x, touch.y);

            this.app.fire("app:camera:movestart");

        } else if (touches.length == 2) {
            // Calculate the difference in pinch distance since the last event
            var currentPinchDistance = this.getPinchDistance(touches[0], touches[1]);
            var diffInPinchDistance = currentPinchDistance - this.lastPinchDistance;
            this.lastPinchDistance = currentPinchDistance;

            this.orbitCamera.distance -= (diffInPinchDistance * this.distanceSensitivity * 0.1) * (this.orbitCamera.distance * 0.1);

            // Calculate pan difference
            this.calcMidPoint(touches[0], touches[1], pinchMidPoint);

            if (Math.abs(diffInPinchDistance) <= this.pinchSensitivity) {
                this.pan(pinchMidPoint);

                this.app.fire("app:camera:movestart");
            }

            this.lastPinchMidPoint.copy(pinchMidPoint);
        }
    }
}

export default createScript(OrbitCameraTouchInput);