import { Application } from "../application";
import Gizmo from "./gizmo";

export default class GizmoGrid extends Gizmo {
    private _size = 10;
    private _divisions = 10;
    private _gridColor = new pc.Color(1, 1, 1, 1);
    private _axisColor = new pc.Color(0, 0, 0, 1);
    private entity = new pc.Entity();

    constructor(app: Application) {
        super(app);

        this.entity.enabled = false;
        this.entity.addComponent("model");
        this.create();
        this.app.$.root.addChild(this.entity);
    }

    get size() {
        return this._size;
    }

    set size(value: number) {
        this._size = value;
        this.create();
    }

    get divisions() {
        return this._divisions;
    }

    set divisions(value: number) {
        this._divisions = value;
        this.create();
    }

    get gridColor() {
        return this._gridColor;
    }

    set gridColor(value: pc.Color) {
        this._gridColor = value;
        this.create();
    }

    get axisColor() {
        return this._axisColor;
    }

    set axisColor(value: pc.Color) {
        this._axisColor = value;
        this.create();
    }

    public attach() {
        this.entity.enabled = true;
    }

    public detach() {
        this.entity.enabled = false;
    }

    public create() {
        const size = this.size;
        const divisions = this.divisions;
        const halfSize = size / 2;
        const center = divisions / 2;
        const step = size / divisions;
        const numVerts = (divisions + 1) * 4;
        const graphicsDevice = this.app.$.graphicsDevice;
        const vertexFormat = new pc.VertexFormat(graphicsDevice, [
            { semantic: pc.SEMANTIC_POSITION, components: 3, type: pc.TYPE_FLOAT32 },
            { semantic: pc.SEMANTIC_COLOR, components: 4, type: pc.TYPE_FLOAT32 }
        ]);
        const vertexBuffer = new pc.VertexBuffer(graphicsDevice, vertexFormat, numVerts);
        const vertexIterator = new pc.VertexIterator(vertexBuffer);

        for (let i = 0, j = -halfSize; i <= divisions; i++ , j += step) {
            let color = i === center ? this._axisColor : this._gridColor;
            vertexIterator.element[pc.SEMANTIC_POSITION].set(-halfSize, 0, j);
            vertexIterator.element[pc.SEMANTIC_COLOR].set(color.r, color.g, color.b, color.a);
            vertexIterator.next();
            vertexIterator.element[pc.SEMANTIC_POSITION].set(halfSize, 0, j);
            vertexIterator.element[pc.SEMANTIC_COLOR].set(color.r, color.g, color.b, color.a);
            vertexIterator.next();
            vertexIterator.element[pc.SEMANTIC_POSITION].set(j, 0, -halfSize);
            vertexIterator.element[pc.SEMANTIC_COLOR].set(color.r, color.g, color.b, color.a);
            vertexIterator.next();
            vertexIterator.element[pc.SEMANTIC_POSITION].set(j, 0, halfSize);
            vertexIterator.element[pc.SEMANTIC_COLOR].set(color.r, color.g, color.b, color.a);
            vertexIterator.next();
        }
        vertexIterator.end();

        const mesh = new pc.Mesh();
        mesh.vertexBuffer = vertexBuffer;
        mesh.primitive[0].type = pc.PRIMITIVE_LINES;
        mesh.primitive[0].base = 0;
        mesh.primitive[0].count = numVerts;
        mesh.primitive[0].indexed = false;

        const node = new pc.GraphNode();

        const library = this.app.$.graphicsDevice.getProgramLibrary();
        const shader = library.getProgram("basic", { vertexColors: true, diffuseMapping: false });
        const material = new pc.Material();
        material.shader = shader;

        const meshInstance = new pc.MeshInstance(node, mesh, material);
        const model = new pc.Model();
        model.graph = node;
        model.meshInstances = [meshInstance];

        this.entity.model.model = model;
    }

    public destroy() {
        this.entity.model.model.destroy();
    }
}
