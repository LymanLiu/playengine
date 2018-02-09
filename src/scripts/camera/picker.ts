import { createScript, ScriptType } from "../script";
import { MeshInstanceIntersection } from "../../enhance/mesh";

class Picker extends ScriptType {
    public static readonly __name = "picker";
    private static readonly color = new pc.Color(1, 0, 0, 1);

    public initialize() {
        this.on("enable", this.onEnable, this);
        this.on("disable", this.onDisable, this);

        this.onEnable();
    }

    protected onEnable() {
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
    }

    protected onDisable() {
        this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
    }

    private onMouseMove(e: pc.MouseEvent) {
        this.select(e.x, e.y);
    }

    private select(x: number, y: number) {
        const target = this.App.selection.select(x, y);

        if (target) {
            const intersects = this.App.selection
                .prepareRay(x, y)
                .intersectMeshInstances(target.model.meshInstances);

            if (intersects) {
                intersects.forEach((intersect: MeshInstanceIntersection) => {
                    this.app.renderLine(intersect.vertices[0], intersect.vertices[1], Picker.color, 1);
                    this.app.renderLine(intersect.vertices[1], intersect.vertices[2], Picker.color, 1);
                    this.app.renderLine(intersect.vertices[2], intersect.vertices[0], Picker.color, 1);
                });
            }
        }
    }
}

export default createScript(Picker);
