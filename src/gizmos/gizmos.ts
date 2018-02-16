import { Application } from "../application";
import { GIZMO_AABB, GIZMO_GRID } from "../constants";
import GizmoGrid from "./grid";
import GizmoAabb from "./aabb";

export default class GizmoManager {
    public app: Application;
    public grid: GizmoGrid;
    public aabb: GizmoAabb;

    constructor(app: Application) {
        this.app = app;
    }

    public create(type: string) {
        switch (type) {
            case GIZMO_GRID:
                this.grid = new GizmoGrid(this.app);
                break;
            case GIZMO_AABB:
                this.aabb = new GizmoAabb(this.app);
                break;
        }

        return this;
    }

    public remove(type: string) {
        switch (type) {
            case GIZMO_GRID:
                this.grid.destroy();
                this.grid = null;
                break;
            case GIZMO_AABB:
                this.aabb.destroy();
                this.aabb = null;
                break;
        }

        return this;
    }
}
