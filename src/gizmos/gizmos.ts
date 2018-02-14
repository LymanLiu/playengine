import { Application } from "../application";
import { GIZMO_GRID } from "../constants";
import GizmoGrid from "./grid";

export default class GizmoManager {
    public app: Application;
    public grid: GizmoGrid;

    constructor(app: Application) {
        this.app = app;
    }

    public create(type: string) {
        switch (type) {
            case GIZMO_GRID:
                this.grid = new GizmoGrid(this.app);
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
        }

        return this;
    }
}
