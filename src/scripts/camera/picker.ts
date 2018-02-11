import { createScript, ScriptType } from "../script";
import { MeshInstanceIntersection } from "../../enhance/mesh";

interface PickerBehavior {
    onSelect(result: MeshInstanceIntersection[]): void;
}

class Picker extends ScriptType implements PickerBehavior {
    public static readonly __name = "picker";

    public initialize() {
        this.on("enable", this.onEnable, this);
        this.on("disable", this.onDisable, this);

        this.onEnable();
    }

    /* tslint:disable-next-line  */
    public onSelect(_result: MeshInstanceIntersection[]) {

    }

    protected onEnable() {
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
    }

    protected onDisable() {
        this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
    }

    private onMouseMove(e: pc.MouseEvent) {
        const result = this.select(e.x, e.y);
        this.onSelect(result);
    }

    private select(x: number, y: number): MeshInstanceIntersection[] {
        const target = this.App.selection.select(x, y);

        if (!target || !target.model || !target.model.meshInstances) {
            return null;
        }

        return this.App.selection
            .prepareRay(x, y)
            .intersectMeshInstances(target.model.meshInstances);
    }
}

export default createScript(Picker);
