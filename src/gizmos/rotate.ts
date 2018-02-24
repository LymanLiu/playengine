import { Application } from "../application";
import { GizmoMeshInstancesMap } from "./transform";

export default class GizmoRotate {
    public root: pc.Entity;

    private app: Application;
    private node: pc.GraphNode;
    private model: pc.Model;
    private handlerGizmos: GizmoMeshInstancesMap;
    private handlerMeshInstances: pc.MeshInstance[];
    private pickerGizmos: GizmoMeshInstancesMap;
    private pickerMeshInstances: pc.MeshInstance[];

    constructor(app: Application) {
        this.app = app;

        this.root = new pc.Entity();
        this.root.addComponent("model");
        this.node = new pc.GraphNode();
        this.model = new pc.Model();
        this.model.graph = this.node;
        this.handlerMeshInstances = [];
        this.pickerMeshInstances = [];

        this.handlerGizmos = {
            X: [
                this.createCircle([0, 0, 90], [1, 0, 0, 1])
            ],
            Y: [
                this.createCircle([0, 0, 0], [0, 1, 0, 1])
            ],
            Z: [
                this.createCircle([90, 0, 0], [0, 0, 1, 1])
            ]
        };
        this.pickerGizmos = {
            X: [
                this.createTorus([0, 0, 90], [1, 0, 0, 0])
            ],
            Y: [
                this.createTorus([0, 0, 0], [0, 1, 0, 0])
            ],
            Z: [
                this.createTorus([90, 0, 0], [0, 0, 1, 0])
            ]
        };

        this.setup("handler", this.handlerGizmos);
        this.setup("picker", this.pickerGizmos);

        this.root.model.model = this.model;
    }

    private setup(type: string, gizmos: GizmoMeshInstancesMap) {
        for (let name in gizmos) {
            gizmos[name].forEach((mi: pc.MeshInstance) => {
                mi.node.name = name;
                this.node.addChild(mi.node);
                this.model.meshInstances.push(mi);

                switch (type) {
                    case "handler":
                        this.handlerMeshInstances.push(mi);
                        break;
                    case "picker":
                        this.pickerMeshInstances.push(mi);
                        break;
                }
            });
        }

    }

    private createCircle(rotation: number[], color: number[]) {
        let node = new pc.GraphNode();
        let mesh = pc.createCircle(this.app.$.graphicsDevice);
        let material = new pc.BasicMaterial();
        node.setEulerAngles(...rotation);
        material._color = color;
        material.depthTest = false;
        material.depthWrite = false;
        material.color = new pc.Color(color);
        material.update();

        let meshInstance = new pc.MeshInstance(node, mesh, material);
        meshInstance.layer = pc.LAYER_GIZMO;

        return meshInstance;
    }

    private createTorus(rotation: number[], color: number[]) {
        let node = new pc.GraphNode();
        let mesh = pc.createTorus(this.app.$.graphicsDevice, {
            tubeRadius: 0.12,
            ringRadius: 1,
            segments: 30,
            sides: 20
        });
        let material = new pc.BasicMaterial();
        node.setEulerAngles(...rotation);
        material.color = new pc.Color(color);
        material.blend = true;
        material.blendSrc = pc.BLENDMODE_SRC_ALPHA;
        material.blendDst = pc.BLENDMODE_ONE_MINUS_SRC_ALPHA;
        material.update();

        return new pc.MeshInstance(node, mesh, material);
    }
}
