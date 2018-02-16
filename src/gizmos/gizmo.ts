import { Application } from "../application";
import { Entity } from "../entities/entity";

export default abstract class Gizmo {
    protected app: Application;

    public abstract attach(target?: Entity | Entity[]): void;
    public abstract detach(): void;
    public abstract destroy(): void;

    constructor(app: Application) {
        this.app = app;
    }
}
