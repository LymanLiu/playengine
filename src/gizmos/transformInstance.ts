import { Application } from "../application";
import { GizmoMeshInstancesMap } from "./transform";

export default abstract class GizmoTransformInstance {
    public root: pc.Entity;
    public handlerGizmos: GizmoMeshInstancesMap;
    public handlerMeshInstances: pc.MeshInstance[];
    public pickerGizmos: GizmoMeshInstancesMap;
    public pickerMeshInstances: pc.MeshInstance[];

    protected app: Application;
    protected node: pc.GraphNode;
    protected model: pc.Model;

    constructor(app: Application) {
        this.app = app;
        this.root = new pc.Entity();
        this.root.addComponent("model");
        this.node = new pc.GraphNode();
        this.model = new pc.Model();
        this.model.graph = this.node;
        this.handlerMeshInstances = [];
        this.pickerMeshInstances = [];

    }

    protected setupMeshInstances(type: string, gizmos: GizmoMeshInstancesMap) {
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
}
