import { Application } from "../application";

export default abstract class Gizmo {
    protected app: Application;

    public abstract attach(): void;
    public abstract detach(): void;
    public abstract create(): void;
    public abstract destroy(): void;

    constructor(app: Application) {
        this.app = app;
    }
}
