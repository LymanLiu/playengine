import { ScriptType } from "./script";

export default class ScriptAttributes {
    private scriptType: typeof ScriptType;

    public  index: any;

    public static rawToBoolean(value: any) {
        return !!value;
    }

    public static rawToNumber(value: any) {
        if (typeof (value) === "number") {
            return value;
        } else if (typeof (value) === "string") {
            let v = parseInt(value, 10);
            if (isNaN(v)) {
                return null;
            }
            return v;
        } else if (typeof (value) === "boolean") {
            return !!value;
        } else {
            return null;
        }
    }

    public static rawToJSON(value: any) {
        if (typeof (value) === "object") {
            return value;
        } else {
            try {
                return JSON.parse(value);
            } catch (ex) {
                return null;
            }
        }
    }

    public static rawToAsset(app: pc.Application, args: any, value: any) {
        if (args.array) {
            let result = [];
            if (value instanceof Array) {

                for (let i = 0; i < value.length; i++) {
                    if (value[i] instanceof pc.Asset) {
                        result.push(value[i]);
                    } else if (typeof (value[i]) === "number") {
                        result.push(app.assets.get(value[i]) || null);
                    } else if (typeof (value[i]) === "string") {
                        result.push(app.assets.get(parseInt(value[i], 10)) || null);
                    } else {
                        result.push(null);
                    }
                }
            }
            return result;
        } else {
            if (value instanceof pc.Asset) {
                return value;
            } else if (typeof (value) === "number") {
                return app.assets.get(value) || null;
            } else if (typeof (value) === "string") {
                return app.assets.get(parseInt(value, 10)) || null;
            } else {
                return null;
            }
        }
    }

    public static rawToEntity(app: pc.Application, value: any) {
        if (value instanceof pc.GraphNode) {
            return value;
        } else if (typeof (value) === "string") {
            return app.root.findByGuid(value);
        } else {
            return null;
        }
    }

    public static rawToColor(value: any, old: any) {
        if (value instanceof pc.Color) {
            if (old instanceof pc.Color) {
                old.copy(value);
                return old;
            } else {
                return value.clone();
            }
        } else if (value instanceof Array && value.length >= 3 && value.length <= 4) {
            for (let i = 0; i < value.length; i++) {
                if (typeof (value[i]) !== "number") {
                    return null;
                }
            }
            if (!old) {
                old = new pc.Color();
            }

            for (let i = 0; i < 4; i++) {

                old.data[i] = (i === 4 && value.length === 3) ? 1 : value[i];
            }

            return old;
        } else if (typeof (value) === "string" && /#([0-9abcdef]{2}){3,4}/i.test(value)) {
            if (!old) {
                old = new pc.Color();
            }

            old.fromString(value);
            return old;
        } else {
            return null;
        }
    }

    public static rawToVector(args: any, value: any, old: any) {
        let len = parseInt(args.type.slice(3), 10);
        let vecType: "Vec2" | "Vec3" | "Vec4" = "Vec" + len as any;

        if (value instanceof pc[vecType]) {
            if (old instanceof pc[vecType]) {
                return old;
            } else {
                return value.clone();
            }
        } else if (value instanceof Array && value.length === len) {
            for (let i = 0; i < value.length; i++) {
                if (typeof (value[i]) !== "number") {
                    return null;
                }
            }
            if (!old) {
                old = new pc[vecType]();
            }

            for (let i = 0; i < len; i++) {
                old.data[i] = value[i];
            }

            return old;
        } else {
            return null;
        }
    }

    public static rawToCurve(value: any) {
        if (value) {
            let curve;
            if (value instanceof pc.Curve || value instanceof pc.CurveSet) {
                curve = value.clone();
            } else {
                let CurveType: any = value.keys[0] instanceof Array ? pc.CurveSet : pc.Curve;
                curve = new CurveType(value.keys);
                curve.type = value.type;
            }
            return curve;
        }
    }

    public static rawToValue(app: pc.Application, args: any, value: any, old: any) {

        // TODO scripts2
        // arrays
        switch (args.type) {
            case "boolean":
                return ScriptAttributes.rawToBoolean(value);
            case "number":
                return ScriptAttributes.rawToNumber(value);
            case "json":
                return ScriptAttributes.rawToJSON(value);
            case "asset":
                return ScriptAttributes.rawToAsset(app, args, value);
            case "entity":
                return ScriptAttributes.rawToEntity(app, value);
            case "rgb":
            case "rgba":
                return ScriptAttributes.rawToColor(value, old);
            case "vec2":
            case "vec3":
            case "vec4":
                return ScriptAttributes.rawToVector(args, value, old);
            case "curve":
                return ScriptAttributes.rawToCurve(value);
        }

        return value;

    }

    constructor(scriptType: typeof ScriptType) {
        this.scriptType = scriptType;
        this.index = {};
    }

    public add(name: string, args: any): void {
        if (this.index[name]) {
            console.warn("attribute \"" + name + "\" is already defined for script type \"" +
                this.scriptType.name + "\"");
            return;
        } else if (pc.createScript.reservedAttributes[name]) {
            console.warn("attribute \"" + name + "\" is a reserved attribute name");
            return;
        }

        this.index[name] = args;
        Object.defineProperty(this.scriptType.prototype, name, {
            get() {
                return this.__attributes[name];
            },
            set(raw) {
                let old = this.__attributes[name];

                // convert to appropriate type
                this.__attributes[name] = ScriptAttributes.rawToValue(this.app, args, raw, old);

                this.fire("attr", name, this.__attributes[name], old);
                this.fire("attr:" + name, this.__attributes[name], old);
            }
        });
    }

    public remove(name: string): boolean {
        if (!this.index[name]) {
            return false;
        }

        delete this.index[name];
        delete this.scriptType.prototype[name];
        return true;
    }

    public has(name: string): boolean {
        return !!this.index[name];
    }
}
