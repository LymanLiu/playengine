import { Application } from "../application";
import ScriptAttributes from "./attribute";

export class ScriptType implements pc.ScriptType {
    public static __name: any;
    public static __attributes?: any;
    public static attributes: ScriptAttributes;

    [prop: string]: any;

    public name: string;
    protected app: pc.Application;
    protected entity: pc.Entity;

    public __attributes: any;
    public __scriptType: ScriptType;
    public __attributesRaw: any;

    private _enabled: boolean;
    private _enabledOld: boolean;

    constructor(args: any = {}) {
        this.app = args.app;
        this.entity = args.entity;
        this._enabled = typeof (args.enabled) === "boolean" ? args.enabled : true;
        this._enabledOld = this.enabled;
        this.__attributes = {};
        this.__attributesRaw = args.attributes || null;
        this.__scriptType = this;

        pc.events.attach(this);
    }

    get enabled(): boolean {
        return this._enabled && this.entity.script.enabled && this.entity.enabled;
    }

    set enabled(value: boolean) {
        if (this._enabled !== value) {
            this._enabled = value;
        }

        if (this.enabled !== this._enabledOld) {
            this._enabledOld = this.enabled;
            this.fire(this.enabled ? "enable" : "disable");
            this.fire("state", this.enabled);
        }
    }
}

export function createScript(ScriptConstructor: typeof ScriptType) {
    return (app: Application) => {
        ScriptConstructor.attributes = new ScriptAttributes(ScriptConstructor);
        ScriptConstructor.prototype.App = app;
        ScriptConstructor.prototype.__initializeAttributes = function(force: boolean): void {
            if (!force && !this.__attributesRaw) {
                return;
            }

            for (let key in ScriptConstructor.attributes.index) {
                if (this.__attributesRaw && this.__attributesRaw.hasOwnProperty(key)) {
                    this[key] = this.__attributesRaw[key];
                } else if (!this.__attributes.hasOwnProperty(key)) {
                    if (ScriptConstructor.attributes.index[key].hasOwnProperty("default")) {
                        this[key] = ScriptConstructor.attributes.index[key].default;
                    } else {
                        this[key] = null;
                    }
                }
            }

            this.__attributesRaw = null;
        };

        for (let key in ScriptConstructor.__attributes) {
            if (ScriptConstructor.__attributes.hasOwnProperty(key)) {
                ScriptConstructor.attributes.add(key, ScriptConstructor.__attributes[key]);
            }
        }

        let registry = app ? app.$.scripts : pc.Application.getApplication().scripts;
        registry.add(ScriptConstructor);
        pc.ScriptHandler._push(ScriptConstructor);

        return ScriptConstructor;
    };
}
