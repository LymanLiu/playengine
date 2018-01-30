import { createScript, ScriptType } from "./script";
import { OrbitCamera } from "./orbitCamera";

class OrbitCameraMouseInput extends ScriptType {
    static __name = "orbitCameraMouseInput";

    static __attributes = {
        orbitSensitivity: { type: "number", default: 0.3, title: "Orbit Sensitivity", description: "How fast the camera moves around the orbit. Higher is faster" },
        distanceSensitivity: { type: "number", default: 0.15, title: "Distance Sensitivity", description: "How fast the camera moves in and out. Higher is faster" }
    };

    static fromWorldPoint = new pc.Vec3();
    static toWorldPoint = new pc.Vec3();
    static worldDiff = new pc.Vec3();

    private orbitCamera: OrbitCamera;
    private onMouseOut: () => void;

    initialize() {
        this.orbitCamera = this.entity.script.orbitCamera;

        if (this.orbitCamera) {
            this.on("enable", this.onEnable);
            this.on("disable", this.onDisable);
            this.onEnable();
        }

        // Disabling the context menu stops the browser displaying a menu when
        // you right-click the page
        this.app.mouse.disableContextMenu();

        this.lookButtonDown = false;
        this.panButtonDown = false;
        this.lastPoint = new pc.Vec2();
        this.onMouseOut = this._onMouseOut.bind(this);
    }

    onEnable() {
        this.lookButtonDown = false;
        this.panButtonDown = false;

        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);

        window.addEventListener("mouseout", this.onMouseOut, false);
    };

    onDisable() {
        this.lookButtonDown = false;
        this.panButtonDown = false;

        this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        this.app.mouse.off(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);

        window.removeEventListener("mouseout", this.onMouseOut, false);
    };

    private pan(screenPoint: pc.MouseEvent) {
        var fromWorldPoint = OrbitCameraMouseInput.fromWorldPoint;
        var toWorldPoint = OrbitCameraMouseInput.toWorldPoint;
        var worldDiff = OrbitCameraMouseInput.worldDiff;

        // For panning to work at any zoom level, we use screen point to world projection
        // to work out how far we need to pan the pivotEntity in world space
        var camera = this.entity.camera;
        var distance = this.orbitCamera.distance;

        camera.screenToWorld(screenPoint.x, screenPoint.y, distance, fromWorldPoint);
        camera.screenToWorld(this.lastPoint.x, this.lastPoint.y, distance, toWorldPoint);

        worldDiff.sub2(toWorldPoint, fromWorldPoint);

        this.orbitCamera.pivotPoint.add(worldDiff);
    }

    private onMouseDown(event: pc.MouseEvent) {
        event.event.preventDefault();
        event.event.stopPropagation();
        switch (event.button) {
            case pc.MOUSEBUTTON_LEFT: {
                this.lookButtonDown = true;
            } break;

            case pc.MOUSEBUTTON_MIDDLE:
            case pc.MOUSEBUTTON_RIGHT: {
                this.panButtonDown = true;
            } break;
        }
    }

    private onMouseUp(event: pc.MouseEvent) {
        event.event.preventDefault();
        event.event.stopPropagation();
        var self = this;
        switch (event.button) {
            case pc.MOUSEBUTTON_LEFT: {
                this.lookButtonDown = false;
            } break;

            case pc.MOUSEBUTTON_MIDDLE:
            case pc.MOUSEBUTTON_RIGHT: {
                this.panButtonDown = false;
            } break;
        }

        setTimeout(function() {
            self.app.fire("app:camera:moveend");
        }, 250);
    }

    private onMouseMove(event: pc.MouseEvent) {
        if (this.lookButtonDown) {
            this.orbitCamera.pitch -= event.dy * this.orbitSensitivity;
            this.orbitCamera.yaw -= event.dx * this.orbitSensitivity;

            this.app.fire("app:camera:movestart");
        } else if (this.panButtonDown) {
            this.pan(event);

            this.app.fire("app:camera:movestart");
        }

        this.lastPoint.set(event.x, event.y);
    }

    private onMouseWheel(event: pc.MouseEvent) {
        this.orbitCamera.distance -= event.wheel * this.distanceSensitivity * (this.orbitCamera.distance * 0.1);
        event.event.preventDefault();
    }

    private _onMouseOut() {
        this.lookButtonDown = false;
        this.panButtonDown = false;
    }
}

export default createScript(OrbitCameraMouseInput);
