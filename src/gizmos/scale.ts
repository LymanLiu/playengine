import { Application } from "../application";
import GizmoTransformInstance from "./transformInstance";

export default class GizmoScale extends GizmoTransformInstance {

    constructor(app: Application) {
        super(app);

        this.handlerGizmos = {
            X: [
                this.createLine([0, 0, 0, 1, 0, 0], [1, 0, 0, 1]),
                this.createBox([0.95, 0, 0], [0.1, 0.1, 0.1], [1, 0, 0, 1])
            ],
            Y: [
                this.createLine([0, 0, 0, 0, 1, 0], [0, 1, 0, 1]),
                this.createBox([0, 0.95, 0], [0.1, 0.1, 0.1], [0, 1, 0, 1])
            ],
            Z: [
                this.createLine([0, 0, 0, 0, 0, 1], [0, 0, 1, 1]),
                this.createBox([0, 0, 0.95], [0.1, 0.1, 0.1], [0, 0, 1, 1])
            ]
        };
        this.pickerGizmos = {
            X: [
                this.createCylinder([0.65, 0, 0], [0, 0, -90], [0.2, 0.7, 0.2], [1, 0, 0, 0])
            ],
            Y: [
                this.createCylinder([0, 0.65, 0], [0, 0, 0], [0.2, 0.7, 0.2], [0, 1, 0, 0])
            ],
            Z: [
                this.createCylinder([0, 0, 0.65], [90, 0, 0], [0.2, 0.7, 0.2], [0, 0, 1, 0])
            ]
        };

        this.setupMeshInstances("handler", this.handlerGizmos);
        this.setupMeshInstances("picker", this.pickerGizmos);

        this.root.model.model = this.model;
    }

    private createLine(positions: number[], color: number[]) {
        let node = new pc.GraphNode();
        let mesh = pc.createLines(this.app.$.graphicsDevice, positions);
        let material = new pc.BasicMaterial();
        material._color = color;
        material.depthTest = false;
        material.depthWrite = false;
        material.color = new pc.Color(color);
        material.update();

        let meshInstance = new pc.MeshInstance(node, mesh, material);
        meshInstance.layer = pc.LAYER_GIZMO;

        return meshInstance;
    }

    private createBox(position: number[], scale: number[], color: number[]) {
        let node = new pc.GraphNode();
        let mesh = pc.createBox(this.app.$.graphicsDevice);
        let material = new pc.BasicMaterial();
        node.setLocalPosition(...position);
        node.setLocalScale(...scale);
        material._color = color;
        material.depthTest = false;
        material.depthWrite = false;
        material.color = new pc.Color(color);
        material.update();

        let meshInstance = new pc.MeshInstance(node, mesh, material);
        meshInstance.layer = pc.LAYER_GIZMO;

        return meshInstance;
    }

    private createCylinder(position: number[], rotation: number[], scale: number[], color: number[]) {
        let node = new pc.GraphNode();
        let mesh = pc.createCylinder(this.app.$.graphicsDevice);
        let material = new pc.BasicMaterial();
        node.setLocalPosition(...position);
        node.setLocalEulerAngles(...rotation);
        node.setLocalScale(...scale);
        material.color = new pc.Color(color);
        material.blend = true;
        material.blendSrc = pc.BLENDMODE_SRC_ALPHA;
        material.blendDst = pc.BLENDMODE_ONE_MINUS_SRC_ALPHA;
        material.update();

        return new pc.MeshInstance(node, mesh, material);
    }
}
