import { Application } from "../application";

export class ScriptType {
    static attributes: ScriptAttributes;

    name: string;
    app: pc.Application;
    entity: pc.Entity;

    __attributes: any;
    private _enabled: boolean;
    private _enabledOld: boolean;
    private __attributesRaw: any;
    private __scriptType: ScriptType;

    [prop: string]: any;

    constructor(args: any = {}) {
        this.app = args.app;
        this.entity = args.entity;
        this._enabled = typeof (args.enabled) === 'boolean' ? args.enabled : true;
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
        if (this._enabled !== value)
            this._enabled = value;

        if (this.enabled !== this._enabledOld) {
            this._enabledOld = this.enabled;
            this.fire(this.enabled ? 'enable' : 'disable');
            this.fire('state', this.enabled);
        }
    }
}

export class ScriptAttributes {
    scriptType: ScriptType;
    index: any;

    static rawToBoolean(value: any) {
        return !!value;
    }

    static rawToNumber(value: any) {
        if (typeof (value) === 'number') {
            return value;
        } else if (typeof (value) === 'string') {
            var v = parseInt(value, 10);
            if (isNaN(v)) return null;
            return v;
        } else if (typeof (value) === 'boolean') {
            return !!value;
        } else {
            return null;
        }
    }

    static rawToJSON(value: any) {
        if (typeof (value) === 'object') {
            return value;
        } else {
            try {
                return JSON.parse(value);
            } catch (ex) {
                return null;
            }
        }
    }

    static rawToAsset(app: pc.Application, args: any, value: any) {
        if (args.array) {
            let result = [];
            if (value instanceof Array) {

                for (let i = 0; i < value.length; i++) {
                    if (value[i] instanceof pc.Asset) {
                        result.push(value[i]);
                    } else if (typeof (value[i]) === 'number') {
                        result.push(app.assets.get(value[i]) || null);
                    } else if (typeof (value[i]) === 'string') {
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
            } else if (typeof (value) === 'number') {
                return app.assets.get(value) || null;
            } else if (typeof (value) === 'string') {
                return app.assets.get(parseInt(value, 10)) || null;
            } else {
                return null;
            }
        }
    }

    static rawToEntity(app: pc.Application, value: any) {
        if (value instanceof pc.GraphNode) {
            return value;
        } else if (typeof (value) === 'string') {
            return app.root.findByGuid(value);
        } else {
            return null;
        }
    }

    static rawToColor(value: any, old: any) {
        if (value instanceof pc.Color) {
            if (old instanceof pc.Color) {
                old.copy(value);
                return old;
            } else {
                return value.clone();
            }
        } else if (value instanceof Array && value.length >= 3 && value.length <= 4) {
            for (let i = 0; i < value.length; i++) {
                if (typeof (value[i]) !== 'number')
                    return null;
            }
            if (!old) old = new pc.Color();

            for (let i = 0; i < 4; i++)
                old.data[i] = (i === 4 && value.length === 3) ? 1 : value[i];

            return old;
        } else if (typeof (value) === 'string' && /#([0-9abcdef]{2}){3,4}/i.test(value)) {
            if (!old)
                old = new pc.Color();

            old.fromString(value);
            return old;
        } else {
            return null;
        }
    }

    static rawToVector(args: any, value: any, old: any) {
        let len = parseInt(args.type.slice(3), 10);

        if (value instanceof pc['Vec' + len]) {
            if (old instanceof pc['Vec' + len]) {
                old.copy(value);
                return old;
            } else {
                return value.clone();
            }
        } else if (value instanceof Array && value.length === len) {
            for (let i = 0; i < value.length; i++) {
                if (typeof (value[i]) !== 'number')
                    return null;
            }
            if (!old) old = new pc['Vec' + len]();

            for (let i = 0; i < len; i++)
                old.data[i] = value[i];

            return old;
        } else {
            return null;
        }
    }

    static rawToCurve(value: any) {
        if (value) {
            var curve;
            if (value instanceof pc.Curve || value instanceof pc.CurveSet) {
                curve = value.clone();
            } else {
                var CurveType = value.keys[0] instanceof Array ? pc.CurveSet : pc.Curve;
                curve = new CurveType(value.keys);
                curve.type = value.type;
            }
            return curve;
        }
    }

    static rawToValue(app: pc.Application, args: any, value: any, old: any) {

        // TODO scripts2
        // arrays
        switch (args.type) {
            case 'boolean':
                return ScriptAttributes.rawToBoolean(value);
            case 'number':
                return ScriptAttributes.rawToNumber(value);
            case 'json':
                return ScriptAttributes.rawToJSON(value);
            case 'asset':
                return ScriptAttributes.rawToAsset(app, args, value);
            case 'entity':
                return ScriptAttributes.rawToEntity(app, value);
            case 'rgb':
            case 'rgba':
                return ScriptAttributes.rawToColor(value, old);
            case 'vec2':
            case 'vec3':
            case 'vec4':
                return ScriptAttributes.rawToVector(args, value, old);
            case 'curve':
                return ScriptAttributes.rawToCurve(value);
        }

        return value;

    }

    constructor(scriptType: ScriptType) {
        this.scriptType = scriptType;
        this.index = {};
    }

    add(name: string, args: any): void {
        if (this.index[name]) {
            console.warn('attribute \'' + name + '\' is already defined for script type \'' + this.scriptType.name + '\'');
            return;
        } else if (pc.createScript.reservedAttributes[name]) {
            console.warn('attribute \'' + name + '\' is a reserved attribute name');
            return;
        }

        this.index[name] = args;
        Object.defineProperty(this.scriptType.prototype, name, {
            get: function() {
                return this.__attributes[name];
            },
            set: function(raw) {
                var old = this.__attributes[name];

                // convert to appropriate type
                this.__attributes[name] = ScriptAttributes.rawToValue(this.app, args, raw, old);

                this.fire('attr', name, this.__attributes[name], old);
                this.fire('attr:' + name, this.__attributes[name], old);
            }
        });
    }

    remove(name: string): boolean {
        if (!this.index[name])
            return false;

        delete this.index[name];
        delete this.scriptType.prototype[name];
        return true;
    }

    has(name: string): boolean {
        return !!this.index[name];
    }
}

export function createScript(ScriptConstructor: ScriptType) {
    return function(app: Application) {
        ScriptConstructor.attributes = new ScriptAttributes(ScriptConstructor);
        ScriptConstructor.prototype.App = app;
        ScriptConstructor.prototype.__initializeAttributes = function(force: boolean): void {
            if (!force && !this.__attributesRaw) return;

            for (let key in ScriptConstructor.attributes.index) {
                if (this.__attributesRaw && this.__attributesRaw.hasOwnProperty(key)) {
                    this[key] = this.__attributesRaw[key];
                } else if (!this.__attributes.hasOwnProperty(key)) {
                    if (ScriptConstructor.attributes.index[key].hasOwnProperty('default')) {
                        this[key] = ScriptConstructor.attributes.index[key].default;
                    } else {
                        this[key] = null;
                    }
                }
            }

            this.__attributesRaw = null;
        };

        for (let key in ScriptConstructor.__attributes) {
            ScriptConstructor.attributes.add(key, ScriptConstructor.__attributes[key]);
        }

        let registry = app ? app.$.scripts : pc.Application.getApplication().scripts;
        registry.add(ScriptConstructor)
        pc.ScriptHandler._push(ScriptConstructor);

        return ScriptConstructor;
    }
}
