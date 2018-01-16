import { Application } from "../application";

export class ScriptType {
    name: string;
    app: pc.Application;
    entity: pc.Entity;
    attributes?: any;

    private _enabled: boolean;
    private _enabledOld: boolean;
    private __attributes: any;
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

    __initializeAttributes(force: boolean): void {
        if (!force && !this.__attributesRaw) return;

        for (var key in this.attributes) {
            if (this.__attributesRaw && this.__attributesRaw.hasOwnProperty(key)) {
                this[key] = this.__attributesRaw[key];
            } else if (!this.__attributes.hasOwnProperty(key)) {
                if (this.attributes[key].hasOwnProperty('default')) {
                    this[key] = this.attributes[key].default;
                } else {
                    this[key] = null;
                }
            }
        }

        this.__attributesRaw = null;
    }
}

export class ScriptAttributes {
    scriptType: ScriptType;
    index: any;

    static rawToValue(app: pc.Application, args: any, value: any, old: any) {
        var i;

        // TODO scripts2
        // arrays
        switch (args.type) {
            case 'boolean':
                return !!value;
            case 'number':
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
            case 'json':
                if (typeof (value) === 'object') {
                    return value;
                } else {
                    try {
                        return JSON.parse(value);
                    } catch (ex) {
                        return null;
                    }
                }
            case 'asset':
                if (args.array) {
                    var result = [];

                    if (value instanceof Array) {
                        for (i = 0; i < value.length; i++) {
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
            case 'entity':
                if (value instanceof pc.GraphNode) {
                    return value;
                } else if (typeof (value) === 'string') {
                    return app.root.findByGuid(value);
                } else {
                    return null;
                }
            case 'rgb':
            case 'rgba':
                if (value instanceof pc.Color) {
                    if (old instanceof pc.Color) {
                        old.copy(value);
                        return old;
                    } else {
                        return value.clone();
                    }
                } else if (value instanceof Array && value.length >= 3 && value.length <= 4) {
                    for (i = 0; i < value.length; i++) {
                        if (typeof (value[i]) !== 'number')
                            return null;
                    }
                    if (!old) old = new pc.Color();

                    for (i = 0; i < 4; i++)
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
            case 'vec2':
            case 'vec3':
            case 'vec4':
                var len = parseInt(args.type.slice(3), 10);

                if (value instanceof pc['Vec' + len]) {
                    if (old instanceof pc['Vec' + len]) {
                        old.copy(value);
                        return old;
                    } else {
                        return value.clone();
                    }
                } else if (value instanceof Array && value.length === len) {
                    for (i = 0; i < value.length; i++) {
                        if (typeof (value[i]) !== 'number')
                            return null;
                    }
                    if (!old) old = new pc['Vec' + len]();

                    for (i = 0; i < len; i++)
                        old.data[i] = value[i];

                    return old;
                } else {
                    return null;
                }
            case 'curve':
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
                break;
        }

        return value;

    }

    constructor(scriptType: any) {
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

export function createScript(ScriptConstructor: typeof ScriptType) {
    return function(app: Application) {
        let registry = app ? app.$.scripts : pc.Application.getApplication().scripts;
        ScriptConstructor.prototype.App = app;
        registry.add(ScriptConstructor)
        pc.ScriptHandler._push(ScriptConstructor);

        return ScriptConstructor;
    }
}
