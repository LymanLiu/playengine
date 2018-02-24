(function(l, i, v, e) { v = l.createElement(i); v.async = 1; v.src = '//' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; e = l.getElementsByTagName(i)[0]; e.parentNode.insertBefore(v, e)})(document, 'script');
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@scarletsky/playcanvas')) :
	typeof define === 'function' && define.amd ? define(['exports', '@scarletsky/playcanvas'], factory) :
	(factory((global.pe = {}),global.pc));
}(this, (function (exports,pc) { 'use strict';

pc = pc && pc.hasOwnProperty('default') ? pc['default'] : pc;

function __extends(d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var AssetManager = /** @class */ (function () {
    function AssetManager(app) {
        this.app = app;
        this._assets = {};
    }
    AssetManager.prototype.get = function (identity) {
        return this._assets[identity] || null;
    };
    AssetManager.prototype.load = function (identity) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var asset = _this._assets[identity];
            if (asset.loaded) {
                return resolve(asset);
            }
            asset.on("load", resolve);
            asset.on("error", reject);
            _this.app.$.assets.load(asset);
        });
    };
    return AssetManager;
}());

var TextureManager = /** @class */ (function (_super) {
    __extends(TextureManager, _super);
    function TextureManager(app) {
        return _super.call(this, app) || this;
    }
    TextureManager.prototype.add = function (data) {
        var textureAsset = new pc.Asset(data.name, pc.ASSET_TEXTURE, { url: data.url }, {
            addressu: data.addressu || "repeat",
            addressv: data.addressv || "repeat",
            anisotropy: data.anisotropy || 1,
            magfilter: data.magfilter || "linear",
            minfilter: data.minfilter || "linear_mip_linear",
            rgbm: typeof data.rgbm === "undefined" ? false : data.rgbm
        });
        this._assets[textureAsset.id] = textureAsset;
        this.app.$.assets.add(textureAsset);
        return textureAsset;
    };
    TextureManager.prototype.remove = function (identity) {
        this.app.$.assets.remove(this._assets[identity]);
        delete this._assets[identity];
        return this;
    };
    return TextureManager;
}(AssetManager));

var CubemapManager = /** @class */ (function (_super) {
    __extends(CubemapManager, _super);
    function CubemapManager(app) {
        return _super.call(this, app) || this;
    }
    CubemapManager.prototype.add = function (data) {
        var _this = this;
        var textureAssetIds = [];
        data.textures.forEach(function (textureData) {
            var textureAsset = _this.app.textures.add(textureData);
            textureAssetIds.push(textureAsset.id);
        });
        var cubemapAsset = new pc.Asset(data.name, pc.ASSET_CUBEMAP, data.cubemap ? { url: data.cubemap } : null, {
            anisotropy: CubemapManager.DEFAULT_CUBEMAP_OPTIONS.anisotropy,
            magFilter: CubemapManager.DEFAULT_CUBEMAP_OPTIONS.magfilter,
            minFilter: CubemapManager.DEFAULT_CUBEMAP_OPTIONS.minfilter,
            rgbm: CubemapManager.DEFAULT_CUBEMAP_OPTIONS.rgbm,
            textures: textureAssetIds
        });
        this.app.$.assets.add(cubemapAsset);
        this._assets[data.name] = cubemapAsset;
        return cubemapAsset;
    };
    CubemapManager.prototype.load = function (name, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return new Promise(function (resolve, reject) {
            var loadFaces = typeof options.loadFaces === "boolean" ? options.loadFaces : false;
            var loadedCounts = 0;
            var totalCounts = loadFaces ? 7 : 1;
            var cubemapAsset = _this._assets[name];
            if (cubemapAsset.loaded) {
                return resolve(cubemapAsset);
            }
            var onLoaded = function () {
                loadedCounts++;
                if (loadedCounts === totalCounts) {
                    resolve(cubemapAsset);
                }
            };
            if (loadFaces) {
                cubemapAsset.data.textures.forEach(function (textureAssetId) {
                    var textureAsset = _this.app.textures.get(textureAssetId);
                    textureAsset.ready(onLoaded);
                    textureAsset.once("error", reject);
                    _this.app.$.assets.load(textureAsset);
                });
            }
            cubemapAsset.ready(onLoaded);
            cubemapAsset.once("error", reject);
            _this.app.$.assets.load(cubemapAsset);
        });
    };
    CubemapManager.DEFAULT_CUBEMAP_OPTIONS = {
        anisotropy: 1,
        magfilter: 1,
        minfilter: 5,
        rgbm: true,
        textures: []
    };
    return CubemapManager;
}(AssetManager));

var MATERIAL_COLOR_FIELDS = [
    "diffuse", "specular", "ambient", "emissive"
];
var MATERIAL_VECTOR_FIELDS = [
    // vec2
    "diffuseMapOffset", "diffuseMapTiling",
    "opacityMapOffset", "opacityMapTiling",
    "aoMapOffset", "aoMapTiling",
    "specularMapOffset", "specularMapTiling",
    "metalnessMapOffset", "metalnessMapTiling",
    "glossMapOffset", "glossMapTiling",
    "heightMapOffset", "heightMapTiling",
    "emissiveMapOffset", "emissiveMapTiling",
    "normalMapOffset", "normalMapTiling",
    "lightMapOffset", "lightMapTiling",
];
var MATERIAL_OBJECT_FIELDS = [
    "cubeMapProjectionBox"
];
var MATERIAL_OBJECT_FIELDS2 = MATERIAL_OBJECT_FIELDS.reduce(function (prev, next) {
    prev[next] = true;
    return prev;
}, {});
var MATERIAL_ARRAY_FIELDS = MATERIAL_COLOR_FIELDS.concat(MATERIAL_VECTOR_FIELDS);
var MATERIAL_ARRAY_FIELDS2 = MATERIAL_ARRAY_FIELDS.reduce(function (prev, next) {
    prev[next] = true;
    return prev;
}, {});
var MATERIAL_TEXTURE_FIELDS = [
    "aoMap", "diffuseMap", "glossMap", "metalnessMap",
    "specularMap", "emissiveMap", "opacityMap", "lightMap",
    "normalMap", "heightMap", "sphereMap", "cubeMap"
];
var MATERIAL_TEXTURE_FIELDS2 = MATERIAL_TEXTURE_FIELDS.reduce(function (prev, next) {
    prev[next] = true;
    return prev;
}, {});
var ENTITY_BASE = "entity";
var ENTITY_CAMERA = "camera";
var ENTITY_LIGHT = "light";
var ENTITY_MODEL = "model";
var GIZMO_AABB = "aabb";
var GIZMO_GRID = "grid";
var GIZMO_TRANSFORM = "transform";
var constants = {
    ENTITY_BASE: ENTITY_BASE,
    ENTITY_CAMERA: ENTITY_CAMERA,
    ENTITY_LIGHT: ENTITY_LIGHT,
    ENTITY_MODEL: ENTITY_MODEL,
    GIZMO_AABB: GIZMO_AABB,
    GIZMO_GRID: GIZMO_GRID,
    GIZMO_TRANSFORM: GIZMO_TRANSFORM,
    MATERIAL_OBJECT_FIELDS: MATERIAL_OBJECT_FIELDS,
    MATERIAL_OBJECT_FIELDS2: MATERIAL_OBJECT_FIELDS2,
    MATERIAL_ARRAY_FIELDS: MATERIAL_ARRAY_FIELDS,
    MATERIAL_ARRAY_FIELDS2: MATERIAL_ARRAY_FIELDS2,
    MATERIAL_TEXTURE_FIELDS: MATERIAL_TEXTURE_FIELDS,
    MATERIAL_TEXTURE_FIELDS2: MATERIAL_TEXTURE_FIELDS2
};
//# sourceMappingURL=constants.js.map

var MaterialManager = /** @class */ (function (_super) {
    __extends(MaterialManager, _super);
    function MaterialManager(app) {
        return _super.call(this, app) || this;
    }
    MaterialManager.prototype.add = function (data) {
        if (!data.shader) {
            data.shader = "blinn";
        }
        var materialAsset = new pc.Asset(data.name, pc.ASSET_MATERIAL, null, data);
        this._assets[materialAsset.id] = materialAsset;
        this.app.$.assets.add(materialAsset);
        return materialAsset;
    };
    MaterialManager.prototype.link = function (materialData, texturesMap) {
        MATERIAL_TEXTURE_FIELDS.forEach(function (field) {
            if (typeof materialData[field] === "string") {
                materialData[field] = texturesMap[materialData[field]];
            }
        });
    };
    return MaterialManager;
}(AssetManager));

var ModelManager = /** @class */ (function (_super) {
    __extends(ModelManager, _super);
    function ModelManager(app) {
        return _super.call(this, app) || this;
    }
    ModelManager.prototype.add = function (data) {
        var _this = this;
        if (this._assets[data.uid]) {
            return this._assets[data.uid];
        }
        var texturesMap = {};
        var materialsMap = {};
        var modelDataOptions = {
            area: 0,
            mapping: [],
            materials: [],
            textures: [],
            animations: []
        };
        if (data.textures && data.textures.length > 0) {
            data.textures.forEach(function (textureData) {
                var textureAsset = _this.app.textures.add(textureData);
                texturesMap[textureData.name] = textureAsset.id;
                modelDataOptions.textures.push(textureAsset.id);
            });
        }
        if (data.materials && data.materials.length > 0) {
            data.materials.forEach(function (materialData) {
                if (materialsMap[materialData.name]) {
                    return;
                }
                _this.app.materials.link(materialData, texturesMap);
                var materialAsset = _this.app.materials.add(materialData);
                materialsMap[materialData.name] = materialAsset.id;
                modelDataOptions.materials.push(materialAsset.id);
            });
            modelDataOptions.mapping = data.mapping.map(function (name) { return ({ material: materialsMap[name] }); });
        }
        if (data.animations && data.animations.length > 0) {
            data.animations.forEach(function (animationData) {
                var animationAsset = _this.app.animations.add(animationData);
                modelDataOptions.animations.push(animationAsset.id);
            });
        }
        var modelAsset = new pc.Asset(data.name, pc.ASSET_MODEL, { url: data.url }, modelDataOptions);
        this._assets[data.uid] = modelAsset;
        this.app.$.assets.add(modelAsset);
        return modelAsset;
    };
    ModelManager.prototype.load = function (identity, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return new Promise(function (resolve, reject) {
            var modelAsset = _this._assets[identity];
            var loadedCounts = 0;
            var totalCounts = 1 + modelAsset.data.materials.length + modelAsset.data.textures.length;
            var modelAssets = modelAsset.data.materials.concat(modelAsset.data.textures);
            if (modelAsset.loaded) {
                return resolve(modelAsset);
            }
            if (options.loadAnimations) {
                totalCounts += modelAsset.data.animations.length;
                modelAssets = modelAssets.concat(modelAsset.data.animations);
            }
            var onLoaded = function (asset) {
                loadedCounts++;
                if (options.onProgress) {
                    options.onProgress(asset, loadedCounts, totalCounts);
                }
                if (loadedCounts === totalCounts) {
                    resolve(modelAsset);
                }
            };
            modelAssets.forEach(function (assetId) {
                var asset = _this.app.$.assets.get(assetId);
                asset.ready(onLoaded);
                asset.on("error", reject);
                _this.app.$.assets.load(asset);
            });
            modelAsset.ready(onLoaded);
            modelAsset.on("error", reject);
            _this.app.$.assets.load(modelAsset);
        });
    };
    return ModelManager;
}(AssetManager));

var AnimationManager = /** @class */ (function (_super) {
    __extends(AnimationManager, _super);
    function AnimationManager(app) {
        return _super.call(this, app) || this;
    }
    AnimationManager.prototype.add = function (data) {
        var animationAsset = new pc.Asset(data.name, pc.ASSET_ANIMATION, { url: data.url });
        this._assets[animationAsset.id] = animationAsset;
        this.app.$.assets.add(animationAsset);
        return animationAsset;
    };
    return AnimationManager;
}(AssetManager));

var ScriptAttributes = /** @class */ (function () {
    function ScriptAttributes(scriptType) {
        this.scriptType = scriptType;
        this.index = {};
    }
    ScriptAttributes.rawToBoolean = function (value) {
        return !!value;
    };
    ScriptAttributes.rawToNumber = function (value) {
        if (typeof (value) === "number") {
            return value;
        }
        else if (typeof (value) === "string") {
            var v = parseInt(value, 10);
            if (isNaN(v)) {
                return null;
            }
            return v;
        }
        else if (typeof (value) === "boolean") {
            return !!value;
        }
        else {
            return null;
        }
    };
    ScriptAttributes.rawToJSON = function (value) {
        if (typeof (value) === "object") {
            return value;
        }
        else {
            try {
                return JSON.parse(value);
            }
            catch (ex) {
                return null;
            }
        }
    };
    ScriptAttributes.rawToAsset = function (app, args, value) {
        if (args.array) {
            var result = [];
            if (value instanceof Array) {
                for (var i = 0; i < value.length; i++) {
                    if (value[i] instanceof pc.Asset) {
                        result.push(value[i]);
                    }
                    else if (typeof (value[i]) === "number") {
                        result.push(app.assets.get(value[i]) || null);
                    }
                    else if (typeof (value[i]) === "string") {
                        result.push(app.assets.get(parseInt(value[i], 10)) || null);
                    }
                    else {
                        result.push(null);
                    }
                }
            }
            return result;
        }
        else {
            if (value instanceof pc.Asset) {
                return value;
            }
            else if (typeof (value) === "number") {
                return app.assets.get(value) || null;
            }
            else if (typeof (value) === "string") {
                return app.assets.get(parseInt(value, 10)) || null;
            }
            else {
                return null;
            }
        }
    };
    ScriptAttributes.rawToEntity = function (app, value) {
        if (value instanceof pc.GraphNode) {
            return value;
        }
        else if (typeof (value) === "string") {
            return app.root.findByGuid(value);
        }
        else {
            return null;
        }
    };
    ScriptAttributes.rawToColor = function (value, old) {
        if (value instanceof pc.Color) {
            if (old instanceof pc.Color) {
                old.copy(value);
                return old;
            }
            else {
                return value.clone();
            }
        }
        else if (value instanceof Array && value.length >= 3 && value.length <= 4) {
            for (var i = 0; i < value.length; i++) {
                if (typeof (value[i]) !== "number") {
                    return null;
                }
            }
            if (!old) {
                old = new pc.Color();
            }
            for (var i = 0; i < 4; i++) {
                old.data[i] = (i === 4 && value.length === 3) ? 1 : value[i];
            }
            return old;
        }
        else if (typeof (value) === "string" && /#([0-9abcdef]{2}){3,4}/i.test(value)) {
            if (!old) {
                old = new pc.Color();
            }
            old.fromString(value);
            return old;
        }
        else {
            return null;
        }
    };
    ScriptAttributes.rawToVector = function (args, value, old) {
        var len = parseInt(args.type.slice(3), 10);
        var vecType = "Vec" + len;
        if (value instanceof pc[vecType]) {
            if (old instanceof pc[vecType]) {
                return old;
            }
            else {
                return value.clone();
            }
        }
        else if (value instanceof Array && value.length === len) {
            for (var i = 0; i < value.length; i++) {
                if (typeof (value[i]) !== "number") {
                    return null;
                }
            }
            if (!old) {
                old = new pc[vecType]();
            }
            for (var i = 0; i < len; i++) {
                old.data[i] = value[i];
            }
            return old;
        }
        else {
            return null;
        }
    };
    ScriptAttributes.rawToCurve = function (value) {
        if (value) {
            var curve = void 0;
            if (value instanceof pc.Curve || value instanceof pc.CurveSet) {
                curve = value.clone();
            }
            else {
                var CurveType = value.keys[0] instanceof Array ? pc.CurveSet : pc.Curve;
                curve = new CurveType(value.keys);
                curve.type = value.type;
            }
            return curve;
        }
    };
    ScriptAttributes.rawToValue = function (app, args, value, old) {
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
    };
    ScriptAttributes.prototype.add = function (name, args) {
        if (this.index[name]) {
            console.warn("attribute \"" + name + "\" is already defined for script type \"" +
                this.scriptType.name + "\"");
            return;
        }
        else if (pc.createScript.reservedAttributes[name]) {
            console.warn("attribute \"" + name + "\" is a reserved attribute name");
            return;
        }
        this.index[name] = args;
        Object.defineProperty(this.scriptType.prototype, name, {
            get: function () {
                return this.__attributes[name];
            },
            set: function (raw) {
                var old = this.__attributes[name];
                // convert to appropriate type
                this.__attributes[name] = ScriptAttributes.rawToValue(this.app, args, raw, old);
                this.fire("attr", name, this.__attributes[name], old);
                this.fire("attr:" + name, this.__attributes[name], old);
            }
        });
    };
    ScriptAttributes.prototype.remove = function (name) {
        if (!this.index[name]) {
            return false;
        }
        delete this.index[name];
        delete this.scriptType.prototype[name];
        return true;
    };
    ScriptAttributes.prototype.has = function (name) {
        return !!this.index[name];
    };
    return ScriptAttributes;
}());

var ScriptType = /** @class */ (function () {
    function ScriptType(args) {
        if (args === void 0) { args = {}; }
        this.app = args.app;
        this.entity = args.entity;
        this._enabled = typeof (args.enabled) === "boolean" ? args.enabled : true;
        this._enabledOld = this.enabled;
        this.__attributes = {};
        this.__attributesRaw = args.attributes || null;
        this.__scriptType = this;
        pc.events.attach(this);
    }
    Object.defineProperty(ScriptType.prototype, "enabled", {
        get: function () {
            return this._enabled && this.entity.script.enabled && this.entity.enabled;
        },
        set: function (value) {
            if (this._enabled !== value) {
                this._enabled = value;
            }
            if (this.enabled !== this._enabledOld) {
                this._enabledOld = this.enabled;
                this.fire(this.enabled ? "enable" : "disable");
                this.fire("state", this.enabled);
            }
        },
        enumerable: true,
        configurable: true
    });
    return ScriptType;
}());
function createScript(ScriptConstructor) {
    return function (app) {
        ScriptConstructor.attributes = new ScriptAttributes(ScriptConstructor);
        ScriptConstructor.prototype.App = app;
        ScriptConstructor.prototype.__initializeAttributes = function (force) {
            if (!force && !this.__attributesRaw) {
                return;
            }
            for (var key in ScriptConstructor.attributes.index) {
                if (this.__attributesRaw && this.__attributesRaw.hasOwnProperty(key)) {
                    this[key] = this.__attributesRaw[key];
                }
                else if (!this.__attributes.hasOwnProperty(key)) {
                    if (ScriptConstructor.attributes.index[key].hasOwnProperty("default")) {
                        this[key] = ScriptConstructor.attributes.index[key].default;
                    }
                    else {
                        this[key] = null;
                    }
                }
            }
            this.__attributesRaw = null;
        };
        for (var key in ScriptConstructor.__attributes) {
            if (ScriptConstructor.__attributes.hasOwnProperty(key)) {
                ScriptConstructor.attributes.add(key, ScriptConstructor.__attributes[key]);
            }
        }
        var registry = app ? app.$.scripts : pc.Application.getApplication().scripts;
        registry.add(ScriptConstructor);
        pc.ScriptHandler._push(ScriptConstructor);
        return ScriptConstructor;
    };
}

var AnimationController = /** @class */ (function (_super) {
    __extends(AnimationController, _super);
    function AnimationController() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AnimationController.prototype.initialize = function () {
        this.lastState = {
            playing: this.entity.animation.playing,
            anim: this.entity.animation.currAnim
        };
    };
    AnimationController.prototype.update = function () {
        var animation = this.entity.animation;
        var currPlaying = animation.playing;
        var lastPlaying = this.lastState.playing;
        if (lastPlaying === currPlaying) {
            return;
        }
        this.lastState.playing = animation.playing;
        this.lastState.anim = animation.currAnim;
        if (!lastPlaying && currPlaying) {
            animation.fire("start", animation.currAnim);
        }
        else if (lastPlaying && !currPlaying) {
            animation.fire("end", animation.currAnim);
        }
    };
    AnimationController.__name = "animationController";
    return AnimationController;
}(ScriptType));
var AnimationController$1 = createScript(AnimationController);
//# sourceMappingURL=animationController.js.map

var EntityManager = /** @class */ (function () {
    function EntityManager(app) {
        this.app = app;
        this._items = {};
        this.app.$.on("app:entity:create", this.onEntityCreate, this);
        this.app.$.on("app:entity:destroy", this.onEntityDestroy, this);
    }
    EntityManager.prototype.get = function (uid) {
        return this._items[uid];
    };
    EntityManager.prototype.add = function (entity) {
        var uid = entity.entity.getGuid();
        if (!this.get(uid)) {
            this._items[uid] = entity;
        }
        return this;
    };
    EntityManager.prototype.remove = function (uid) {
        if (this.get(uid)) {
            delete this._items[uid];
        }
        return this;
    };
    EntityManager.prototype.list = function () {
        var result = [];
        for (var uid in this._items) {
            if (this._items.hasOwnProperty(uid)) {
                result.push(this._items[uid]);
            }
        }
        return result;
    };
    EntityManager.prototype.onEntityCreate = function (entity) {
        this.add(entity);
    };
    EntityManager.prototype.onEntityDestroy = function (uid) {
        this.remove(uid);
    };
    return EntityManager;
}());

var Gizmo = /** @class */ (function () {
    function Gizmo(app) {
        this.app = app;
    }
    return Gizmo;
}());

var GizmoGrid = /** @class */ (function (_super) {
    __extends(GizmoGrid, _super);
    function GizmoGrid(app) {
        var _this = _super.call(this, app) || this;
        _this._size = 10;
        _this._divisions = 10;
        _this._gridColor = new pc.Color(1, 1, 1, 1);
        _this._axisColor = new pc.Color(0, 0, 0, 1);
        _this.entity = new pc.Entity();
        _this.entity.enabled = false;
        _this.entity.addComponent("model");
        _this.create();
        _this.app.$.root.addChild(_this.entity);
        return _this;
    }
    Object.defineProperty(GizmoGrid.prototype, "size", {
        get: function () {
            return this._size;
        },
        set: function (value) {
            this._size = value;
            this.create();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GizmoGrid.prototype, "divisions", {
        get: function () {
            return this._divisions;
        },
        set: function (value) {
            this._divisions = value;
            this.create();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GizmoGrid.prototype, "gridColor", {
        get: function () {
            return this._gridColor;
        },
        set: function (value) {
            this._gridColor = value;
            this.create();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GizmoGrid.prototype, "axisColor", {
        get: function () {
            return this._axisColor;
        },
        set: function (value) {
            this._axisColor = value;
            this.create();
        },
        enumerable: true,
        configurable: true
    });
    GizmoGrid.prototype.attach = function () {
        this.entity.enabled = true;
    };
    GizmoGrid.prototype.detach = function () {
        this.entity.enabled = false;
    };
    GizmoGrid.prototype.create = function () {
        var size = this.size;
        var divisions = this.divisions;
        var halfSize = size / 2;
        var center = divisions / 2;
        var step = size / divisions;
        var numVerts = (divisions + 1) * 4;
        var graphicsDevice = this.app.$.graphicsDevice;
        var vertexFormat = new pc.VertexFormat(graphicsDevice, [
            { semantic: pc.SEMANTIC_POSITION, components: 3, type: pc.TYPE_FLOAT32 },
            { semantic: pc.SEMANTIC_COLOR, components: 4, type: pc.TYPE_FLOAT32 }
        ]);
        var vertexBuffer = new pc.VertexBuffer(graphicsDevice, vertexFormat, numVerts);
        var vertexIterator = new pc.VertexIterator(vertexBuffer);
        for (var i = 0, j = -halfSize; i <= divisions; i++, j += step) {
            var color = i === center ? this._axisColor : this._gridColor;
            vertexIterator.element[pc.SEMANTIC_POSITION].set(-halfSize, 0, j);
            vertexIterator.element[pc.SEMANTIC_COLOR].set(color.r, color.g, color.b, color.a);
            vertexIterator.next();
            vertexIterator.element[pc.SEMANTIC_POSITION].set(halfSize, 0, j);
            vertexIterator.element[pc.SEMANTIC_COLOR].set(color.r, color.g, color.b, color.a);
            vertexIterator.next();
            vertexIterator.element[pc.SEMANTIC_POSITION].set(j, 0, -halfSize);
            vertexIterator.element[pc.SEMANTIC_COLOR].set(color.r, color.g, color.b, color.a);
            vertexIterator.next();
            vertexIterator.element[pc.SEMANTIC_POSITION].set(j, 0, halfSize);
            vertexIterator.element[pc.SEMANTIC_COLOR].set(color.r, color.g, color.b, color.a);
            vertexIterator.next();
        }
        vertexIterator.end();
        var mesh = new pc.Mesh();
        mesh.vertexBuffer = vertexBuffer;
        mesh.primitive[0].type = pc.PRIMITIVE_LINES;
        mesh.primitive[0].base = 0;
        mesh.primitive[0].count = numVerts;
        mesh.primitive[0].indexed = false;
        var node = new pc.GraphNode();
        var library = this.app.$.graphicsDevice.getProgramLibrary();
        var shader = library.getProgram("basic", { vertexColors: true, diffuseMapping: false });
        var material = new pc.Material();
        material.shader = shader;
        var meshInstance = new pc.MeshInstance(node, mesh, material);
        var model = new pc.Model();
        model.graph = node;
        model.meshInstances = [meshInstance];
        this.entity.model.model = model;
    };
    GizmoGrid.prototype.destroy = function () {
        this.entity.model.model.destroy();
    };
    return GizmoGrid;
}(Gizmo));

var GizmoAabb = /** @class */ (function (_super) {
    __extends(GizmoAabb, _super);
    function GizmoAabb(app) {
        var _this = _super.call(this, app) || this;
        _this._color = new pc.Color(1, 1, 1, 1);
        _this._target = null;
        _this._vecA = new pc.Vec3();
        _this._vecB = new pc.Vec3();
        return _this;
    }
    Object.defineProperty(GizmoAabb.prototype, "color", {
        get: function () {
            return this._color;
        },
        set: function (color) {
            this._color = color;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GizmoAabb.prototype, "target", {
        get: function () {
            return this._target;
        },
        enumerable: true,
        configurable: true
    });
    GizmoAabb.prototype.attach = function (target) {
        if (!target) {
            throw Error("GizmoAabb should attach with Model or Model[]");
        }
        var onUpdate = Array.isArray(target) ? this.onUpdate2 : this.onUpdate;
        this.detach();
        this._target = target;
        this.app.$.on("update", onUpdate, this);
    };
    GizmoAabb.prototype.detach = function () {
        this._target = null;
        this.app.$.off("update", this.onUpdate, this);
        this.app.$.off("update", this.onUpdate2, this);
    };
    GizmoAabb.prototype.destroy = function () {
        this.detach();
    };
    GizmoAabb.prototype.onUpdate = function () {
        this.render(this._target.aabb);
    };
    GizmoAabb.prototype.onUpdate2 = function () {
        var _this = this;
        this._target.forEach(function (target) { return _this.render(target.aabb); });
    };
    GizmoAabb.prototype.render = function (aabb) {
        /*

          5____4
        1/___0/|
        | 6__|_7
        2/___3/

        */
        // 0 - 1
        this._vecA.set(aabb.center.x + aabb.halfExtents.x, aabb.center.y + aabb.halfExtents.y, aabb.center.z + aabb.halfExtents.z);
        this._vecB.set(aabb.center.x - aabb.halfExtents.x, aabb.center.y + aabb.halfExtents.y, aabb.center.z + aabb.halfExtents.z);
        this.app.$.renderLine(this._vecA, this._vecB, this._color);
        // 0 - 3
        this._vecA.set(aabb.center.x + aabb.halfExtents.x, aabb.center.y + aabb.halfExtents.y, aabb.center.z + aabb.halfExtents.z);
        this._vecB.set(aabb.center.x + aabb.halfExtents.x, aabb.center.y - aabb.halfExtents.y, aabb.center.z + aabb.halfExtents.z);
        this.app.$.renderLine(this._vecA, this._vecB, this._color);
        // 0 - 4
        this._vecA.set(aabb.center.x + aabb.halfExtents.x, aabb.center.y + aabb.halfExtents.y, aabb.center.z + aabb.halfExtents.z);
        this._vecB.set(aabb.center.x + aabb.halfExtents.x, aabb.center.y + aabb.halfExtents.y, aabb.center.z - aabb.halfExtents.z);
        this.app.$.renderLine(this._vecA, this._vecB, this._color);
        // 1 - 2
        this._vecA.set(aabb.center.x - aabb.halfExtents.x, aabb.center.y + aabb.halfExtents.y, aabb.center.z + aabb.halfExtents.z);
        this._vecB.set(aabb.center.x - aabb.halfExtents.x, aabb.center.y - aabb.halfExtents.y, aabb.center.z + aabb.halfExtents.z);
        this.app.$.renderLine(this._vecA, this._vecB, this._color);
        // 1 - 5
        this._vecA.set(aabb.center.x - aabb.halfExtents.x, aabb.center.y + aabb.halfExtents.y, aabb.center.z + aabb.halfExtents.z);
        this._vecB.set(aabb.center.x - aabb.halfExtents.x, aabb.center.y + aabb.halfExtents.y, aabb.center.z - aabb.halfExtents.z);
        this.app.$.renderLine(this._vecA, this._vecB, this._color);
        // 2 - 3
        this._vecA.set(aabb.center.x - aabb.halfExtents.x, aabb.center.y - aabb.halfExtents.y, aabb.center.z + aabb.halfExtents.z);
        this._vecB.set(aabb.center.x + aabb.halfExtents.x, aabb.center.y - aabb.halfExtents.y, aabb.center.z + aabb.halfExtents.z);
        this.app.$.renderLine(this._vecA, this._vecB, this._color);
        // 2 - 6
        this._vecA.set(aabb.center.x - aabb.halfExtents.x, aabb.center.y - aabb.halfExtents.y, aabb.center.z + aabb.halfExtents.z);
        this._vecB.set(aabb.center.x - aabb.halfExtents.x, aabb.center.y - aabb.halfExtents.y, aabb.center.z - aabb.halfExtents.z);
        this.app.$.renderLine(this._vecA, this._vecB, this._color);
        // 3 - 7
        this._vecA.set(aabb.center.x + aabb.halfExtents.x, aabb.center.y - aabb.halfExtents.y, aabb.center.z + aabb.halfExtents.z);
        this._vecB.set(aabb.center.x + aabb.halfExtents.x, aabb.center.y - aabb.halfExtents.y, aabb.center.z - aabb.halfExtents.z);
        this.app.$.renderLine(this._vecA, this._vecB, this._color);
        // 4 - 5
        this._vecA.set(aabb.center.x + aabb.halfExtents.x, aabb.center.y + aabb.halfExtents.y, aabb.center.z - aabb.halfExtents.z);
        this._vecB.set(aabb.center.x - aabb.halfExtents.x, aabb.center.y + aabb.halfExtents.y, aabb.center.z - aabb.halfExtents.z);
        this.app.$.renderLine(this._vecA, this._vecB, this._color);
        // 4 - 7
        this._vecA.set(aabb.center.x + aabb.halfExtents.x, aabb.center.y + aabb.halfExtents.y, aabb.center.z - aabb.halfExtents.z);
        this._vecB.set(aabb.center.x + aabb.halfExtents.x, aabb.center.y - aabb.halfExtents.y, aabb.center.z - aabb.halfExtents.z);
        this.app.$.renderLine(this._vecA, this._vecB, this._color);
        // 5 - 6
        this._vecA.set(aabb.center.x - aabb.halfExtents.x, aabb.center.y + aabb.halfExtents.y, aabb.center.z - aabb.halfExtents.z);
        this._vecB.set(aabb.center.x - aabb.halfExtents.x, aabb.center.y - aabb.halfExtents.y, aabb.center.z - aabb.halfExtents.z);
        this.app.$.renderLine(this._vecA, this._vecB, this._color);
        // 6 - 7
        this._vecA.set(aabb.center.x - aabb.halfExtents.x, aabb.center.y - aabb.halfExtents.y, aabb.center.z - aabb.halfExtents.z);
        this._vecB.set(aabb.center.x + aabb.halfExtents.x, aabb.center.y - aabb.halfExtents.y, aabb.center.z - aabb.halfExtents.z);
        this.app.$.renderLine(this._vecA, this._vecB, this._color);
    };
    return GizmoAabb;
}(Gizmo));

var Entity = /** @class */ (function () {
    function Entity(args) {
        if (args === void 0) { args = {}; }
        this.entity = new pc.Entity();
        this.type = ENTITY_BASE;
        if (args.uid) {
            this.uid = args.uid;
        }
        if (args.name) {
            this.entity.name = args.name;
        }
        if (args.position) {
            (_a = this.entity).setPosition.apply(_a, args.position);
        }
        if (args.rotation) {
            (_b = this.entity).setEulerAngles.apply(_b, args.rotation);
        }
        if (args.scale) {
            (_c = this.entity).setLocalScale.apply(_c, args.scale);
        }
        this.entity.getApplication().fire("app:entity:create", this);
        var _a, _b, _c;
    }
    Entity.prototype.destroy = function () {
        this.entity.getApplication().fire("app:entity:create", this.entity.getGuid());
        this.entity.destroy();
    };
    return Entity;
}());

var GizmoTransformControls = /** @class */ (function (_super) {
    __extends(GizmoTransformControls, _super);
    function GizmoTransformControls() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.hoverAxis = null;
        _this.hoverPoint = new pc.Vec3();
        _this.startPoint = new pc.Vec3();
        _this.hitPoint = new pc.Vec3();
        _this.position = new pc.Vec3();
        _this.offset = new pc.Vec3();
        _this.vecA = new pc.Vec3();
        _this.vecB = new pc.Vec3();
        _this.vecC = new pc.Vec3();
        _this.vecD = new pc.Vec3();
        _this.matA = new pc.Mat4();
        _this.quatA = new pc.Quat();
        _this.quatB = new pc.Quat();
        _this.isDragging = false;
        return _this;
    }
    GizmoTransformControls.prototype.initialize = function () {
        this.transform = this.App.gizmos.transform;
        this.on("enable", this.onEnable);
        this.on("disable", this.onDisable);
        this.onEnable();
    };
    GizmoTransformControls.prototype.update = function () {
        var _this = this;
        var handlerGizmos = this.transform.modeInstance.handlerGizmos;
        var _loop_1 = function (name) {
            handlerGizmos[name].forEach(function (mi) {
                var material = mi.material;
                var color = _this.hoverAxis === name ? [1, 1, 1, 1] : material._color;
                material.color.set(color[0], color[1], color[2], color[3]);
                material.update();
            });
        };
        for (var name in handlerGizmos) {
            _loop_1(name);
        }
    };
    GizmoTransformControls.prototype.onEnable = function () {
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this, 9);
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this, 9);
        this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this, 9);
    };
    GizmoTransformControls.prototype.onDisable = function () {
        this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        this.app.mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this);
    };
    GizmoTransformControls.prototype.onMouseDown = function (event) {
        if (!this.hoverAxis)
            return;
        event.stopPropagation();
        this.startPoint.copy(this.hoverPoint);
        this.position.copy(this.transform.root.getPosition());
        this.transform.targets.forEach(function (target) {
            target._gizmoTransformStart = Array.from(target.entity.getWorldTransform().data);
        });
        this.isDragging = true;
    };
    GizmoTransformControls.prototype.onMouseUp = function (event) {
        if (!this.isDragging)
            return;
        event.stopPropagation();
        this.transform.updatePlanes();
        this.transform.targets.forEach(function (target) {
            delete target._gizmoTransformStart;
        });
        this.isDragging = false;
    };
    GizmoTransformControls.prototype.onMouseMove = function (event) {
        var _this = this;
        var ray = this.App.selection.prepareRay(event.x, event.y);
        var intersects = ray.intersectMeshInstances(this.transform.modeInstance.pickerMeshInstances);
        if (this.isDragging) {
            this.transform
                .getPlaneByAxis(this.hoverAxis)
                .intersectsRay(ray, this.hitPoint);
            if (this.transform.mode === "translate") {
                this.offset.sub2(this.hitPoint, this.startPoint);
                if (this.hoverAxis.search("X") === -1)
                    this.offset.x = 0;
                if (this.hoverAxis.search("Y") === -1)
                    this.offset.y = 0;
                if (this.hoverAxis.search("Z") === -1)
                    this.offset.z = 0;
                this.vecA.add2(this.position, this.offset);
                this.transform.root.setPosition(this.vecA);
                this.transform.targets.forEach(function (target) {
                    _this.matA.set(target._gizmoTransformStart);
                    _this.matA.getTranslation(_this.vecB);
                    target.entity.setPosition(_this.vecB.x + _this.offset.x, _this.vecB.y + _this.offset.y, _this.vecB.z + _this.offset.z);
                });
            }
            else if (this.transform.mode === "scale") {
                this.offset.sub2(this.hitPoint, this.startPoint);
                if (this.hoverAxis.search("X") === -1)
                    this.offset.x = 0;
                if (this.hoverAxis.search("Y") === -1)
                    this.offset.y = 0;
                if (this.hoverAxis.search("Z") === -1)
                    this.offset.z = 0;
                this.transform.targets.forEach(function (target) {
                    _this.matA.set(target._gizmoTransformStart);
                    _this.matA.getScale(_this.vecA);
                    _this.matA.invert().getScale(_this.vecB);
                    target.entity.setLocalScale(_this.vecA.x * (1 + _this.offset.x / _this.vecB.x), _this.vecA.y * (1 + _this.offset.y / _this.vecB.y), _this.vecA.z * (1 + _this.offset.z / _this.vecB.z));
                });
            }
            else if (this.transform.mode === "rotate") {
                this.transform.targets.forEach(function (target) {
                    var worldPosition = target.entity.getPosition();
                    _this.matA.set(target._gizmoTransformStart);
                    _this.quatA.setFromMat4(_this.matA);
                    _this.vecA.copy(_this.startPoint).sub(worldPosition).normalize();
                    _this.vecB.copy(_this.hitPoint).sub(worldPosition).normalize();
                    // start
                    _this.vecC.set(Math.atan2(_this.vecA.z, _this.vecA.y) * pc.math.RAD_TO_DEG, Math.atan2(_this.vecA.x, _this.vecA.z) * pc.math.RAD_TO_DEG, Math.atan2(_this.vecA.y, _this.vecA.x) * pc.math.RAD_TO_DEG);
                    // offset
                    _this.vecD.set(Math.atan2(_this.vecB.z, _this.vecB.y) * pc.math.RAD_TO_DEG, Math.atan2(_this.vecB.x, _this.vecB.z) * pc.math.RAD_TO_DEG, Math.atan2(_this.vecB.y, _this.vecB.x) * pc.math.RAD_TO_DEG);
                    switch (_this.hoverAxis) {
                        case "X":
                            _this.quatB.setFromAxisAngle(pc.Vec3.RIGHT, _this.vecD.x - _this.vecC.x);
                            break;
                        case "Y":
                            _this.quatB.setFromAxisAngle(pc.Vec3.UP, _this.vecD.y - _this.vecC.y);
                            break;
                        case "Z":
                            _this.quatB.setFromAxisAngle(pc.Vec3.BACK, _this.vecD.z - _this.vecC.z);
                            break;
                    }
                    _this.quatB.mul(_this.quatA);
                    target.entity.setRotation(_this.quatB);
                });
            }
            return;
        }
        else if (!intersects) {
            this.hoverAxis = null;
            return;
        }
        var result = intersects[0];
        this.hoverAxis = result.meshInstance.node.name;
        this.transform.getPlaneByAxis(this.hoverAxis).intersectsRay(ray, this.hoverPoint);
    };
    GizmoTransformControls.__name = "gizmoTransformControls";
    return GizmoTransformControls;
}(ScriptType));
var GizmoTransformControls$1 = createScript(GizmoTransformControls);

var GizmoTransformInstance = /** @class */ (function () {
    function GizmoTransformInstance(app) {
        this.app = app;
        this.root = new pc.Entity();
        this.root.addComponent("model");
        this.node = new pc.GraphNode();
        this.model = new pc.Model();
        this.model.graph = this.node;
        this.handlerMeshInstances = [];
        this.pickerMeshInstances = [];
    }
    GizmoTransformInstance.prototype.setupMeshInstances = function (type, gizmos) {
        var _this = this;
        var _loop_1 = function (name) {
            gizmos[name].forEach(function (mi) {
                mi.node.name = name;
                _this.node.addChild(mi.node);
                _this.model.meshInstances.push(mi);
                switch (type) {
                    case "handler":
                        _this.handlerMeshInstances.push(mi);
                        break;
                    case "picker":
                        _this.pickerMeshInstances.push(mi);
                        break;
                }
            });
        };
        for (var name in gizmos) {
            _loop_1(name);
        }
    };
    return GizmoTransformInstance;
}());

var GizmoTranslate = /** @class */ (function (_super) {
    __extends(GizmoTranslate, _super);
    function GizmoTranslate(app) {
        var _this = _super.call(this, app) || this;
        _this.handlerGizmos = {
            X: [
                _this.createLine([0, 0, 0, 1, 0, 0], [1, 0, 0, 1]),
                _this.createArrow([0.9, 0, 0], [0, 0, -90], [0.1, 0.2, 0.1], [1, 0, 0, 1])
            ],
            Y: [
                _this.createLine([0, 0, 0, 0, 1, 0], [0, 1, 0, 1]),
                _this.createArrow([0, 0.9, 0], [0, 0, 0], [0.1, 0.2, 0.1], [0, 1, 0, 1])
            ],
            Z: [
                _this.createLine([0, 0, 0, 0, 0, 1], [0, 0, 1, 1]),
                _this.createArrow([0, 0, 0.9], [90, 0, 0], [0.1, 0.2, 0.1], [0, 0, 1, 1])
            ],
            XY: [
                _this.createPlane([0.15, 0.15, 0], [90, 0, 0], [0.3, 0.3, 0.3], [0, 0, 1, 0.25])
            ],
            XZ: [
                _this.createPlane([0.15, 0, 0.15], [0, 0, 0], [0.3, 0.3, 0.3], [0, 1, 0, 0.25])
            ],
            YZ: [
                _this.createPlane([0, 0.15, 0.15], [0, 0, -90], [0.3, 0.3, 0.3], [1, 0, 0, 0.25])
            ]
        };
        _this.pickerGizmos = {
            X: [
                _this.createCylinder([0.65, 0, 0], [0, 0, -90], [0.2, 0.7, 0.2], [1, 0, 0, 0])
            ],
            Y: [
                _this.createCylinder([0, 0.65, 0], [0, 0, 0], [0.2, 0.7, 0.2], [0, 1, 0, 0])
            ],
            Z: [
                _this.createCylinder([0, 0, 0.65], [90, 0, 0], [0.2, 0.7, 0.2], [0, 0, 1, 0])
            ],
            XY: [
                _this.createPlane([0.15, 0.15, 0], [90, 0, 0], [0.3, 0.3, 0.3], [0, 0, 1, 0])
            ],
            XZ: [
                _this.createPlane([0.15, 0, 0.15], [0, 0, 0], [0.3, 0.3, 0.3], [0, 1, 0, 0.1])
            ],
            YZ: [
                _this.createPlane([0, 0.15, 0.15], [0, 0, -90], [0.3, 0.3, 0.3], [1, 0, 0, 0.1])
            ]
        };
        _this.setupMeshInstances("handler", _this.handlerGizmos);
        _this.setupMeshInstances("picker", _this.pickerGizmos);
        _this.root.model.model = _this.model;
        return _this;
    }
    GizmoTranslate.prototype.createLine = function (positions, color) {
        var node = new pc.GraphNode();
        var mesh = pc.createLines(this.app.$.graphicsDevice, positions);
        var material = new pc.BasicMaterial();
        material._color = color;
        material.depthTest = false;
        material.depthWrite = false;
        material.color = new pc.Color(color);
        material.update();
        var meshInstance = new pc.MeshInstance(node, mesh, material);
        meshInstance.layer = pc.LAYER_GIZMO;
        return meshInstance;
    };
    GizmoTranslate.prototype.createArrow = function (position, rotation, scale, color) {
        var node = new pc.GraphNode();
        var mesh = pc.createCone(this.app.$.graphicsDevice);
        var material = new pc.BasicMaterial();
        node.setLocalPosition.apply(node, position);
        node.setLocalEulerAngles.apply(node, rotation);
        node.setLocalScale.apply(node, scale);
        material._color = color;
        material.depthTest = false;
        material.depthWrite = false;
        material.color = new pc.Color(color);
        material.update();
        var meshInstance = new pc.MeshInstance(node, mesh, material);
        meshInstance.layer = pc.LAYER_GIZMO;
        return meshInstance;
    };
    GizmoTranslate.prototype.createCylinder = function (position, rotation, scale, color) {
        var node = new pc.GraphNode();
        var mesh = pc.createCylinder(this.app.$.graphicsDevice);
        var material = new pc.BasicMaterial();
        node.setLocalPosition.apply(node, position);
        node.setLocalEulerAngles.apply(node, rotation);
        node.setLocalScale.apply(node, scale);
        material.color = new pc.Color(color);
        material.blend = true;
        material.blendSrc = pc.BLENDMODE_SRC_ALPHA;
        material.blendDst = pc.BLENDMODE_ONE_MINUS_SRC_ALPHA;
        material.update();
        return new pc.MeshInstance(node, mesh, material);
    };
    GizmoTranslate.prototype.createPlane = function (position, rotation, scale, color) {
        var node = new pc.GraphNode();
        var mesh = pc.createPlane(this.app.$.graphicsDevice);
        var material = new pc.BasicMaterial();
        node.setLocalPosition.apply(node, position);
        node.setLocalEulerAngles.apply(node, rotation);
        node.setLocalScale.apply(node, scale);
        material._color = color;
        material.depthTest = false;
        material.depthWrite = false;
        material.color = new pc.Color(color);
        material.blend = true;
        material.blendSrc = pc.BLENDMODE_SRC_ALPHA;
        material.blendDst = pc.BLENDMODE_ONE_MINUS_SRC_ALPHA;
        material.update();
        var meshInstance = new pc.MeshInstance(node, mesh, material);
        meshInstance.layer = pc.LAYER_GIZMO;
        return meshInstance;
    };
    return GizmoTranslate;
}(GizmoTransformInstance));

var GizmoRotate = /** @class */ (function (_super) {
    __extends(GizmoRotate, _super);
    function GizmoRotate(app) {
        var _this = _super.call(this, app) || this;
        _this.handlerGizmos = {
            X: [
                _this.createCircle([0, 0, 90], [1, 0, 0, 1])
            ],
            Y: [
                _this.createCircle([0, 0, 0], [0, 1, 0, 1])
            ],
            Z: [
                _this.createCircle([90, 0, 0], [0, 0, 1, 1])
            ]
        };
        _this.pickerGizmos = {
            X: [
                _this.createTorus([0, 0, 90], [1, 0, 0, 0])
            ],
            Y: [
                _this.createTorus([0, 0, 0], [0, 1, 0, 0])
            ],
            Z: [
                _this.createTorus([90, 0, 0], [0, 0, 1, 0])
            ]
        };
        _this.setupMeshInstances("handler", _this.handlerGizmos);
        _this.setupMeshInstances("picker", _this.pickerGizmos);
        _this.root.model.model = _this.model;
        return _this;
    }
    GizmoRotate.prototype.createCircle = function (rotation, color) {
        var node = new pc.GraphNode();
        var mesh = pc.createCircle(this.app.$.graphicsDevice);
        var material = new pc.BasicMaterial();
        node.setEulerAngles.apply(node, rotation);
        material._color = color;
        material.depthTest = false;
        material.depthWrite = false;
        material.color = new pc.Color(color);
        material.update();
        var meshInstance = new pc.MeshInstance(node, mesh, material);
        meshInstance.layer = pc.LAYER_GIZMO;
        return meshInstance;
    };
    GizmoRotate.prototype.createTorus = function (rotation, color) {
        var node = new pc.GraphNode();
        var mesh = pc.createTorus(this.app.$.graphicsDevice, {
            tubeRadius: 0.12,
            ringRadius: 1,
            segments: 30,
            sides: 20
        });
        var material = new pc.BasicMaterial();
        node.setEulerAngles.apply(node, rotation);
        material.color = new pc.Color(color);
        material.blend = true;
        material.blendSrc = pc.BLENDMODE_SRC_ALPHA;
        material.blendDst = pc.BLENDMODE_ONE_MINUS_SRC_ALPHA;
        material.update();
        return new pc.MeshInstance(node, mesh, material);
    };
    return GizmoRotate;
}(GizmoTransformInstance));

var GizmoScale = /** @class */ (function (_super) {
    __extends(GizmoScale, _super);
    function GizmoScale(app) {
        var _this = _super.call(this, app) || this;
        _this.handlerGizmos = {
            X: [
                _this.createLine([0, 0, 0, 1, 0, 0], [1, 0, 0, 1]),
                _this.createBox([0.95, 0, 0], [0.1, 0.1, 0.1], [1, 0, 0, 1])
            ],
            Y: [
                _this.createLine([0, 0, 0, 0, 1, 0], [0, 1, 0, 1]),
                _this.createBox([0, 0.95, 0], [0.1, 0.1, 0.1], [0, 1, 0, 1])
            ],
            Z: [
                _this.createLine([0, 0, 0, 0, 0, 1], [0, 0, 1, 1]),
                _this.createBox([0, 0, 0.95], [0.1, 0.1, 0.1], [0, 0, 1, 1])
            ]
        };
        _this.pickerGizmos = {
            X: [
                _this.createCylinder([0.65, 0, 0], [0, 0, -90], [0.2, 0.7, 0.2], [1, 0, 0, 0])
            ],
            Y: [
                _this.createCylinder([0, 0.65, 0], [0, 0, 0], [0.2, 0.7, 0.2], [0, 1, 0, 0])
            ],
            Z: [
                _this.createCylinder([0, 0, 0.65], [90, 0, 0], [0.2, 0.7, 0.2], [0, 0, 1, 0])
            ]
        };
        _this.setupMeshInstances("handler", _this.handlerGizmos);
        _this.setupMeshInstances("picker", _this.pickerGizmos);
        _this.root.model.model = _this.model;
        return _this;
    }
    GizmoScale.prototype.createLine = function (positions, color) {
        var node = new pc.GraphNode();
        var mesh = pc.createLines(this.app.$.graphicsDevice, positions);
        var material = new pc.BasicMaterial();
        material._color = color;
        material.depthTest = false;
        material.depthWrite = false;
        material.color = new pc.Color(color);
        material.update();
        var meshInstance = new pc.MeshInstance(node, mesh, material);
        meshInstance.layer = pc.LAYER_GIZMO;
        return meshInstance;
    };
    GizmoScale.prototype.createBox = function (position, scale, color) {
        var node = new pc.GraphNode();
        var mesh = pc.createBox(this.app.$.graphicsDevice);
        var material = new pc.BasicMaterial();
        node.setLocalPosition.apply(node, position);
        node.setLocalScale.apply(node, scale);
        material._color = color;
        material.depthTest = false;
        material.depthWrite = false;
        material.color = new pc.Color(color);
        material.update();
        var meshInstance = new pc.MeshInstance(node, mesh, material);
        meshInstance.layer = pc.LAYER_GIZMO;
        return meshInstance;
    };
    GizmoScale.prototype.createCylinder = function (position, rotation, scale, color) {
        var node = new pc.GraphNode();
        var mesh = pc.createCylinder(this.app.$.graphicsDevice);
        var material = new pc.BasicMaterial();
        node.setLocalPosition.apply(node, position);
        node.setLocalEulerAngles.apply(node, rotation);
        node.setLocalScale.apply(node, scale);
        material.color = new pc.Color(color);
        material.blend = true;
        material.blendSrc = pc.BLENDMODE_SRC_ALPHA;
        material.blendDst = pc.BLENDMODE_ONE_MINUS_SRC_ALPHA;
        material.update();
        return new pc.MeshInstance(node, mesh, material);
    };
    return GizmoScale;
}(GizmoTransformInstance));

var GizmoTransform = /** @class */ (function (_super) {
    __extends(GizmoTransform, _super);
    function GizmoTransform(app) {
        var _this = _super.call(this, app) || this;
        _this._mode = "translate";
        var controls = GizmoTransformControls$1(app);
        _this.planes = {
            XY: new pc.Plane(new pc.Vec3(0, 0, 0), new pc.Vec3(0, 0, 1)),
            XZ: new pc.Plane(new pc.Vec3(0, 0, 0), new pc.Vec3(0, 1, 0)),
            YZ: new pc.Plane(new pc.Vec3(0, 0, 0), new pc.Vec3(1, 0, 0))
        };
        _this.translate = new GizmoTranslate(app);
        _this.rotate = new GizmoRotate(app);
        _this.scale = new GizmoScale(app);
        _this.targets = [];
        _this.root = new pc.Entity();
        _this.root.enabled = false;
        _this.root.addComponent("script");
        _this.root.script.create(controls.__name);
        _this.root.addChild(_this.translate.root);
        _this.root.addChild(_this.rotate.root);
        _this.root.addChild(_this.scale.root);
        _this.app.$.root.addChild(_this.root);
        _this.mode = _this._mode;
        return _this;
    }
    Object.defineProperty(GizmoTransform.prototype, "mode", {
        get: function () {
            return this._mode;
        },
        set: function (value) {
            this._mode = value;
            this.translate.root.enabled = false;
            this.rotate.root.enabled = false;
            this.scale.root.enabled = false;
            switch (value) {
                case "translate":
                    this.translate.root.enabled = true;
                    break;
                case "rotate":
                    this.rotate.root.enabled = true;
                    break;
                case "scale":
                    this.scale.root.enabled = true;
                    break;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GizmoTransform.prototype, "modeInstance", {
        get: function () {
            switch (this._mode) {
                case "translate":
                    return this.translate;
                case "rotate":
                    return this.rotate;
                case "scale":
                    return this.scale;
            }
        },
        enumerable: true,
        configurable: true
    });
    GizmoTransform.prototype.attach = function (targets) {
        if (Array.isArray(targets)) {
            this.targets = targets;
        }
        else if (targets instanceof Entity) {
            this.targets = [targets];
        }
        this.root.setPosition(this.targets[0].entity.getPosition());
        this.root.enabled = true;
    };
    GizmoTransform.prototype.detach = function () {
        this.targets = [];
        this.root.enabled = false;
    };
    GizmoTransform.prototype.destroy = function () {
        this.app.$.root.removeChild(this.root);
        this.root.destroy();
        this.targets = [];
        this.translate = null;
    };
    GizmoTransform.prototype.getPlaneByAxis = function (axis) {
        switch (this._mode) {
            case "translate":
            case "scale":
                switch (axis) {
                    case "X":
                        return this.planes.XY;
                    case "Y":
                        return this.planes.XY;
                    case "Z":
                        return this.planes.XZ;
                    default:
                        return this.planes[axis];
                }
            case "rotate":
                switch (axis) {
                    case "X":
                        return this.planes.YZ;
                    case "Y":
                        return this.planes.XZ;
                    case "Z":
                        return this.planes.XY;
                }
        }
    };
    GizmoTransform.prototype.updatePlanes = function () {
        this.planes.XY.point.copy(this.root.getPosition());
        this.planes.XZ.point.copy(this.root.getPosition());
        this.planes.YZ.point.copy(this.root.getPosition());
    };
    return GizmoTransform;
}(Gizmo));

var GizmoManager = /** @class */ (function () {
    function GizmoManager(app) {
        this.app = app;
    }
    GizmoManager.prototype.create = function (type) {
        switch (type) {
            case GIZMO_GRID:
                this.grid = new GizmoGrid(this.app);
                break;
            case GIZMO_AABB:
                this.aabb = new GizmoAabb(this.app);
                break;
            case GIZMO_TRANSFORM:
                this.transform = new GizmoTransform(this.app);
                break;
        }
        return this;
    };
    GizmoManager.prototype.remove = function (type) {
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
    };
    return GizmoManager;
}());

var AnimationCycleMode;
(function (AnimationCycleMode) {
    AnimationCycleMode["NONE"] = "none";
    AnimationCycleMode["ONE"] = "one";
    AnimationCycleMode["ALL"] = "all";
})(AnimationCycleMode || (AnimationCycleMode = {}));
var Model = /** @class */ (function (_super) {
    __extends(Model, _super);
    function Model(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this, args) || this;
        _this.type = ENTITY_MODEL;
        _this._aabb = new pc.BoundingBox();
        _this.entity.addComponent("model", { type: "asset" });
        if (args.type) {
            _this.entity.model.type = args.type;
        }
        if (args.asset) {
            _this.entity.model.asset = args.asset;
        }
        if (args.animations) {
            if (!_this.entity.script) {
                _this.entity.addComponent("script");
            }
            _this.entity.script.create("animationController");
            _this.entity.addComponent("animation", {
                activate: args.animations.activate || false,
                assets: Array.isArray(args.animations.assets) ? args.animations.assets : [],
                loop: false,
                speed: args.animations.speed || 1
            });
            _this.cycleMode = args.animations.cycleMode || AnimationCycleMode.NONE;
        }
        return _this;
    }
    Object.defineProperty(Model.prototype, "model", {
        get: function () {
            return this.entity.model.model;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "hasModel", {
        get: function () {
            return !!this.model;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "aabb", {
        get: function () {
            var model = this.model;
            if (!model) {
                return null;
            }
            this._aabb.copy(model.meshInstances[0].aabb);
            for (var i = 1; i < model.meshInstances.length; i++) {
                this._aabb.add(model.meshInstances[i].aabb);
            }
            return this._aabb;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "mapping", {
        get: function () {
            return this.model.meshInstances.map(function (mi) { return mi.material.name; });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "materials", {
        get: function () {
            return this.model.getMaterials();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "textures", {
        get: function () {
            var results = [];
            this.materials.map(function (material) {
                MATERIAL_TEXTURE_FIELDS.forEach(function (field) {
                    var texture = material[field];
                    if (texture && !~results.indexOf(texture)) {
                        results.push(texture);
                    }
                });
            });
            return results;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "animations", {
        get: function () {
            if (!this.entity.animation) {
                return null;
            }
            var results = [];
            var assets = this.entity.animation.assets;
            var animations = this.entity.animation.animations;
            var animationsIndex = this.entity.animation.animationsIndex;
            assets.forEach(function (assetId) {
                var name = animationsIndex[assetId];
                var animation = animations[name];
                results.push({
                    animation: animation,
                    asset: assetId,
                    name: name
                });
            });
            return results;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Model.prototype, "cycleMode", {
        get: function () {
            return this._cycleMode;
        },
        set: function (value) {
            var animation = this.entity.animation;
            switch (this.cycleMode) {
                case AnimationCycleMode.NONE:
                    animation.play(animation.currAnim);
                    break;
                case AnimationCycleMode.ONE:
                    animation.off("end", this.onCycleOne);
                    break;
                case AnimationCycleMode.ALL:
                    animation.off("end", this.onCycleAll);
                    break;
            }
            switch (value) {
                case AnimationCycleMode.ONE:
                    animation.on("end", this.onCycleOne, this);
                    break;
                case AnimationCycleMode.ALL:
                    animation.on("end", this.onCycleAll, this);
                    break;
            }
            this._cycleMode = value;
        },
        enumerable: true,
        configurable: true
    });
    Model.prototype.onCycleOne = function (currAnim) {
        this.entity.animation.play(currAnim);
    };
    Model.prototype.onCycleAll = function (currAnim) {
        var nextAnim = null;
        var animations = this.animations;
        if (animations.length === 1) {
            nextAnim = currAnim;
        }
        else {
            for (var i = 0; i < animations.length; i++) {
                var animation = animations[i];
                if (animation.name === currAnim) {
                    if (i === animations.length - 1) {
                        nextAnim = animations[0].name;
                    }
                    else {
                        nextAnim = animations[i + 1].name;
                    }
                }
            }
        }
        this.entity.animation.play(nextAnim);
    };
    return Model;
}(Entity));

var Selection = /** @class */ (function () {
    function Selection(app) {
        this.app = app;
        this.camera = null;
        this.fromPoint = new pc.Vec3();
        this.toPoint = new pc.Vec3();
        this.worldRay = new pc.Ray();
        this._items = {};
    }
    Selection.prototype.get = function (uid) {
        return this._items[uid];
    };
    Selection.prototype.add = function (item) {
        var uid = item.entity.getGuid();
        if (!this.get(uid)) {
            this._items[uid] = item;
            this.app.$.fire("app:selection:add", uid);
            this.app.$.fire("app:selection:add:" + uid, item);
        }
    };
    Selection.prototype.remove = function (uid) {
        if (!this.get(uid)) {
            return;
        }
        delete this._items[uid];
        this.app.$.fire("app:selection:remove", uid);
        this.app.$.fire("app:selection:remove:" + uid, this.get(uid));
    };
    Selection.prototype.clear = function () {
        for (var uid in this._items) {
            if (this._items.hasOwnProperty(uid)) {
                this.remove(uid);
            }
        }
        this.app.$.fire("app:selection:clear");
    };
    Selection.prototype.attach = function (camera) {
        this.camera = camera;
        return this;
    };
    Selection.prototype.detach = function () {
        this.camera = null;
        return this;
    };
    Selection.prototype.prepareRay = function (x, y) {
        var camera = this.camera.entity.camera;
        var fromPoint = this.fromPoint;
        var toPoint = this.toPoint;
        var ray = this.worldRay;
        camera.screenToWorld(x, y, camera.nearClip, fromPoint);
        camera.screenToWorld(x, y, camera.farClip, toPoint);
        ray.origin.copy(fromPoint);
        ray.direction.copy(toPoint).sub(ray.origin).normalize();
        return ray;
    };
    Selection.prototype.select = function (x, y) {
        this.checkCamera();
        this.prepareRay(x, y);
        var result = null;
        var ray = this.worldRay;
        var entities = this.app.entities.list();
        for (var _i = 0, entities_1 = entities; _i < entities_1.length; _i++) {
            var entity = entities_1[_i];
            if (entity instanceof Model && entity.aabb.intersectsRay(ray)) {
                result = entity;
                break;
            }
        }
        return result;
    };
    Selection.prototype.checkCamera = function () {
        if (!this.camera) {
            throw Error("No camera found, please use selection.attach first.");
        }
        if (!this.camera.entity.enabled) {
            throw Error("The attached camera is not enabled now, please enable it first.");
        }
    };
    return Selection;
}());

function enhance() {
    function compare(a, b) {
        return b.priority - a.priority;
    }
    pc.events.on = function (name, callback, scope, priority) {
        if (!name || typeof (name) !== "string" || !callback) {
            return this;
        }
        if (!this._callbacks) {
            this._callbacks = {};
        }
        if (!this._callbacks[name]) {
            this._callbacks[name] = [];
        }
        if (!this._callbackActive) {
            this._callbackActive = {};
        }
        if (this._callbackActive[name] && this._callbackActive[name] === this._callbacks[name]) {
            this._callbackActive[name] = this._callbackActive[name].slice();
        }
        this._callbacks[name].push({
            callback: callback,
            scope: scope || this,
            priority: priority || 0
        });
        this._callbacks[name].sort(compare);
        return this;
    };
    pc.events.once = function (name, callback, scope, priority) {
        callback.once = true;
        this.on(name, callback, scope, priority);
        return this;
    };
    pc.events.fire2 = function (name, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8) {
        if (!name || !this._callbacks || !this._callbacks[name])
            return this;
        var callbacks;
        if (!this._callbackActive)
            this._callbackActive = {};
        if (!this._callbackActive[name]) {
            this._callbackActive[name] = this._callbacks[name];
        }
        else {
            if (this._callbackActive[name] === this._callbacks[name])
                this._callbackActive[name] = this._callbackActive[name].slice();
            callbacks = this._callbacks[name].slice();
        }
        for (var i = 0; (callbacks || this._callbackActive[name]) && (i < (callbacks || this._callbackActive[name]).length); i++) {
            var evt = (callbacks || this._callbackActive[name])[i];
            evt.callback.call(evt.scope, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8);
            if (evt.callback.once) {
                var ind = this._callbacks[name].indexOf(evt);
                if (ind !== -1) {
                    if (this._callbackActive[name] === this._callbacks[name])
                        this._callbackActive[name] = this._callbackActive[name].slice();
                    this._callbacks[name].splice(ind, 1);
                }
            }
            if (arg1._stopPropagation)
                break;
        }
        if (!callbacks)
            this._callbackActive[name] = null;
        return this;
    };
    pc.MouseEvent.prototype.stopPropagation = function () {
        this._stopPropagation = true;
    };
}
//# sourceMappingURL=events.js.map

function enhance$1() {
    pc.createLines = function (device, positions) {
        var numVerts = positions.length / 3;
        var vertexFormat = new pc.VertexFormat(device, [
            { semantic: pc.SEMANTIC_POSITION, components: 3, type: pc.TYPE_FLOAT32 }
        ]);
        var vertexBuffer = new pc.VertexBuffer(device, vertexFormat, numVerts);
        var vertexIterator = new pc.VertexIterator(vertexBuffer);
        for (var i = 0; i < numVerts; i++) {
            vertexIterator.element[pc.SEMANTIC_POSITION].set(positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2]);
            vertexIterator.next();
        }
        vertexIterator.end();
        var mesh = new pc.Mesh();
        mesh.primitive[0].type = pc.PRIMITIVE_LINES;
        mesh.primitive[0].base = 0;
        mesh.primitive[0].count = numVerts;
        mesh.primitive[0].indexed = false;
        mesh.vertexBuffer = vertexBuffer;
        return mesh;
    };
    pc.createCircle = function (device, radius, segments) {
        if (radius === void 0) { radius = 1; }
        if (segments === void 0) { segments = 72; }
        var positions = [];
        for (var i = 0; i < segments; i++) {
            var rad = 2 * Math.PI * (i / segments);
            var x = Math.cos(rad) * radius;
            var z = Math.sin(rad) * radius;
            positions.push(x, 0, z);
        }
        var mesh = pc.createLines(device, positions);
        mesh.primitive[0].type = pc.PRIMITIVE_LINELOOP;
        return mesh;
    };
}
//# sourceMappingURL=procedural.js.map

function enhance$2() {
    pc.Ray.prototype.intersectTriangle = (function () {
        var diff = new pc.Vec3();
        var edge1 = new pc.Vec3();
        var edge2 = new pc.Vec3();
        var normal = new pc.Vec3();
        return function intersectTriangle(a, b, c, backfaceCulling, res) {
            res = (res === undefined) ? new pc.Vec3() : res;
            edge1.sub2(b, a);
            edge2.sub2(c, a);
            normal.cross(edge1, edge2);
            var DdN = this.direction.dot(normal);
            var sign;
            if (DdN > 0) {
                if (backfaceCulling) {
                    return null;
                }
                sign = 1;
            }
            else if (DdN < 0) {
                sign = -1;
                DdN = -DdN;
            }
            else {
                return null;
            }
            diff.sub2(this.origin, a);
            var DdQxE2 = sign * this.direction.dot(edge2.cross(diff, edge2));
            if (DdQxE2 < 0) {
                return null;
            }
            var DdE1xQ = sign * this.direction.dot(edge1.cross(edge1, diff));
            if (DdE1xQ < 0) {
                return null;
            }
            if (DdQxE2 + DdE1xQ > DdN) {
                return null;
            }
            var QdN = -sign * diff.dot(normal);
            if (QdN < 0) {
                return null;
            }
            return res.copy(this.direction).scale(QdN / DdN).add(this.origin);
        };
    })();
    pc.Ray.prototype.intersectMeshInstances = function (meshInstances) {
        var i = 0;
        var intersects = [];
        for (i = 0; i < meshInstances.length; i++) {
            meshInstances[i].intersectsRay(this, intersects);
        }
        if (intersects.length === 0) {
            return null;
        }
        return intersects.sort(function (a, b) {
            return a.distance - b.distance;
        });
    };
}
//# sourceMappingURL=ray.js.map

function enhance$3() {
    pc.MeshInstance.prototype.intersectsRay = (function () {
        var localRay = new pc.Ray();
        var distance = new pc.Vec3();
        var aabb = new pc.BoundingBox();
        var points = [new pc.Vec3(), new pc.Vec3(), new pc.Vec3()];
        var edge1 = new pc.Vec3();
        var edge2 = new pc.Vec3();
        var normal = new pc.Vec3();
        var localTransform = new pc.Mat4();
        var worldTransform = new pc.Mat4();
        var localCoord = new pc.Vec3();
        var worldCoord = new pc.Vec3();
        function checkIntersection(meshInstance, i, worldRay, a, b, c, point) {
            var backfaceCulling = (meshInstance.material.cull === pc.CULLFACE_BACK ||
                meshInstance.material.cull === pc.CULLFACE_FRONTANDBACK);
            var intersect;
            if (meshInstance.skinInstance) {
                intersect = worldRay.intersectTriangle(a, b, c, backfaceCulling, point);
            }
            else {
                intersect = localRay.intersectTriangle(a, b, c, backfaceCulling, point);
            }
            if (intersect === null) {
                return null;
            }
            edge1.sub2(b, a);
            edge2.sub2(c, a);
            normal.cross(edge1, edge2).normalize();
            localCoord.copy(intersect);
            worldCoord.copy(intersect);
            if (meshInstance.skinInstance) {
                localTransform.transformPoint(localCoord, localCoord);
            }
            else {
                worldTransform.transformPoint(worldCoord, worldCoord);
                worldTransform.transformPoint(a, a);
                worldTransform.transformPoint(b, b);
                worldTransform.transformPoint(c, c);
                worldTransform.transformVector(normal, normal);
            }
            distance.sub2(worldCoord, worldRay.origin);
            return {
                index: i,
                distance: distance.length(),
                point: worldCoord.clone(),
                localPoint: localCoord.clone(),
                normal: normal.clone(),
                vertices: [a.clone(), b.clone(), c.clone()],
                meshInstance: meshInstance
            };
        }
        return function intersectsRay(worldRay, intersects) {
            aabb.copy(this.aabb);
            if (aabb.intersectsRay(worldRay) === false) {
                return null;
            }
            var vertexBuffer = this.mesh.vertexBuffer;
            var indexBuffer = this.mesh.indexBuffer[0];
            var base = this.mesh.primitive[0].base;
            var count = this.mesh.primitive[0].count;
            var dataF = new Float32Array(vertexBuffer.lock());
            var data8 = new Uint8Array(vertexBuffer.lock());
            var indices = indexBuffer.bytesPerIndex === 2
                ? new Uint16Array(indexBuffer.lock())
                : new Uint32Array(indexBuffer.lock());
            var elems = vertexBuffer.format.elements;
            var vertSize = vertexBuffer.format.size;
            var i;
            var j;
            var k;
            var index;
            var offsetP = 0;
            var offsetI = 0;
            var offsetW = 0;
            var intersect = null;
            for (i = 0; i < elems.length; i++) {
                if (elems[i].name === pc.SEMANTIC_POSITION) {
                    offsetP = elems[i].offset;
                }
                else if (elems[i].name === pc.SEMANTIC_BLENDINDICES) {
                    offsetI = elems[i].offset;
                }
                else if (elems[i].name === pc.SEMANTIC_BLENDWEIGHT) {
                    offsetW = elems[i].offset;
                }
            }
            var offsetPF = offsetP / 4;
            var offsetWF = offsetW / 4;
            var vertSizeF = vertSize / 4;
            intersects = (intersects === undefined) ? [] : intersects;
            localRay.origin.copy(worldRay.origin);
            localRay.direction.copy(worldRay.direction);
            worldTransform.copy(this.node.getWorldTransform());
            localTransform.copy(worldTransform).invert();
            localTransform.transformPoint(localRay.origin, localRay.origin);
            localTransform.transformVector(localRay.direction, localRay.direction);
            if (this.skinInstance) {
                var boneIndices = [0, 0, 0, 0];
                var boneWeights = [0, 0, 0, 0];
                var boneMatrices = this.skinInstance.matrices;
                var boneWeightVertices = [new pc.Vec3(), new pc.Vec3(), new pc.Vec3(), new pc.Vec3()];
                for (i = base; i < base + count; i += 3) {
                    for (j = 0; j < 3; j++) {
                        index = indices[i + j];
                        for (k = 0; k < 4; k++) {
                            boneIndices[k] = data8[index * vertSize + offsetI + k];
                            boneWeights[k] = dataF[index * vertSizeF + offsetPF + offsetWF + k];
                        }
                        index = index * vertSizeF + offsetPF;
                        points[j].set(dataF[index], dataF[index + 1], dataF[index + 2]);
                        for (k = 0; k < 4; k++) {
                            boneMatrices[boneIndices[k]].transformPoint(points[j], boneWeightVertices[k]);
                            boneWeightVertices[k].scale(boneWeights[k]);
                        }
                        points[j]
                            .copy(boneWeightVertices[0])
                            .add(boneWeightVertices[1])
                            .add(boneWeightVertices[2])
                            .add(boneWeightVertices[3]);
                    }
                    intersect = checkIntersection(this, i, worldRay, points[0], points[1], points[2]);
                    if (intersect) {
                        intersects.push(intersect);
                    }
                }
            }
            else {
                for (i = base; i < base + count; i += 3) {
                    for (j = 0; j < 3; j++) {
                        index = indices[i + j] * vertSizeF + offsetPF;
                        points[j].set(dataF[index], dataF[index + 1], dataF[index + 2]);
                    }
                    intersect = checkIntersection(this, i, worldRay, points[0], points[1], points[2]);
                    if (intersect) {
                        intersects.push(intersect);
                    }
                }
            }
            vertexBuffer.unlock();
            indexBuffer.unlock();
            return intersects.length > 0 ? intersects : null;
        };
    })();
}
//# sourceMappingURL=mesh.js.map

function enhance$4() {
    pc.Entity.prototype.getApplication = function () {
        return this._app;
    };
}
//# sourceMappingURL=entity.js.map

function enhance$5() {
    pc.BoundingBox.prototype.toJSON = function () {
        return {
            center: Array.from(this.center.data),
            halfExtents: Array.from(this.halfExtents.data)
        };
    };
}
//# sourceMappingURL=boundingBox.js.map

function enhance$6() {
    pc.Texture.prototype.toJSON = (function () {
        var fields = [
            "name",
            "width",
            "height",
            "depth",
            "format",
            "minFilter",
            "magFilter",
            "anisotropy",
            "addressU",
            "addressV",
            "addressW",
            "mipmaps",
            "cubemap",
            "volume",
            "rgbm",
            "fixCubemapSeams",
            "flipY",
            "compareOnRead",
            "compareFunc"
        ];
        var defaultTexture = toJSON.call(new pc.Texture(pc.Application.getApplication().graphicsDevice));
        function toJSON(options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            var result = { url: null };
            var element = this._levels[0];
            if (element instanceof HTMLImageElement) {
                result.url = element.getAttribute('src');
            }
            else if (element instanceof HTMLCanvasElement) {
                result.url = element.toDataURL();
            }
            fields.forEach(function (field) {
                result[field] = _this[field];
            });
            if (options.diff) {
                fields.forEach(function (field) {
                    var value1 = defaultTexture[field];
                    var value2 = _this[field];
                    if (value1 === value2) {
                        delete result[field];
                    }
                });
            }
            return result;
        }
        return toJSON;
    })();
}
//# sourceMappingURL=texture.js.map

function enhance$7() {
    pc.StandardMaterial.prototype.toJSON = (function () {
        var fields = [
            "alphaTest", "alphaToCoverage",
            "ambient", "ambientTint",
            "aoMap", "aoMapChannel", "aoMapOffset", "aoMapTiling",
            "aoMapUv", "aoMapVertexColor",
            "blendType",
            "bumpiness",
            "conserveEnergy",
            "cubeMap", "cubeMapProjection", "cubeMapProjectionBox",
            "cull",
            "depthTest", "depthWrite", "diffuse",
            "diffuseMap", "diffuseMapChannel", "diffuseMapOffset", "diffuseMapTiling",
            "diffuseMapTint", "diffuseMapUv", "diffuseMapVertexColor",
            "emissive", "emissiveIntensity", "emissiveMap",
            "emissiveMapChannel", "emissiveMapOffset", "emissiveMapTiling",
            "emissiveMapTint", "emissiveMapUv", "emissiveMapVertexColor",
            "fresnelModel",
            "glossMap", "glossMapChannel", "glossMapOffset", "glossMapTiling",
            "glossMapUv", "glossMapVertexColor",
            "heightMap", "heightMapChannel", "heightMapFactor",
            "heightMapOffset", "heightMapTiling", "heightMapVertexColor", "heightMapUv",
            "lightMap", "lightMapChannel", "lightMapOffset",
            "lightMapTiling", "lightMapUv", "lightMapVertexColor",
            "metalness", "metalnessMap", "metalnessMapChannel",
            "metalnessMapOffset", "metalnessMapTiling",
            "metalnessMapUv", "metalnessMapVertexColor",
            "name",
            "normalMap", "normalMapOffset", "normalMapTiling",
            "normalMapUv", "normalMapVertexColor",
            "occludeSpecular", "occludeSpecularIntensity",
            "opacity", "opacityMap", "opacityMapChannel",
            "opacityMapOffset", "opacityMapTiling",
            "opacityMapUv", "opacityMapVertexColor",
            "reflectivity", "refraction", "refractionIndex",
            "shadingModel",
            "shadowSampleType",
            "shininess",
            "specular", "specularAntialias", "specularMap",
            "specularMapChannel", "specularMapOffset", "specularMapTiling",
            "specularMapTint", "specularMapUv", "specularMapVertexColor", "sphereMap",
            "useFog", "useGammaTonemap", "useLighting",
            "useMetalness", "useSkybox",
        ];
        var defaultMaterial = toJSON.call(pc.ModelHandler.DEFAULT_MATERIAL);
        function toJSON(options) {
            var _this = this;
            if (options === void 0) { options = {}; }
            var result = {};
            fields.forEach(function (field) {
                // texture
                if (MATERIAL_TEXTURE_FIELDS2[field]) {
                    if (_this[field] !== null) {
                        result[field] = _this[field].name;
                    }
                    else {
                        result[field] = null;
                    }
                    // color or vector
                }
                else if (MATERIAL_ARRAY_FIELDS2[field]) {
                    result[field] = Array.from(_this[field].data);
                }
                else if (MATERIAL_OBJECT_FIELDS2[field]) {
                    result[field] = _this[field] ? _this[field].toJSON() : null;
                    // atom
                }
                else {
                    if (field === "bumpiness") {
                        result.bumpMapFactor = _this[field];
                    }
                    else {
                        result[field] = _this[field];
                    }
                }
            });
            if (options.diff) {
                fields.forEach(function (field) {
                    if (field === "bumpiness") {
                        field = "bumpMapFactor";
                    }
                    var value1 = defaultMaterial[field];
                    var value2 = result[field];
                    // test two array is equal or not
                    if (MATERIAL_ARRAY_FIELDS2[field]) {
                        value1 = value1.toString();
                        value2 = value2.toString();
                    }
                    if (MATERIAL_OBJECT_FIELDS2[field]) {
                        value1 = JSON.stringify(value1);
                        value2 = JSON.stringify(value2);
                    }
                    if (value1 === value2) {
                        delete result[field];
                    }
                });
            }
            return result;
        }
        return toJSON;
    })();
}
//# sourceMappingURL=standardMaterial.js.map

function enhancePlayCanvas() {
    enhance();
    enhance$1();
    enhance$2();
    enhance$3();
    enhance$4();
    enhance$5();
    enhance$6();
    enhance$7();
}
//# sourceMappingURL=index.js.map

var Application = /** @class */ (function () {
    function Application(canvas, options) {
        if (options === void 0) { options = {}; }
        this.isEnhanced = false;
        this.isAutoResized = false;
        this.$ = new pc.Application(canvas, options);
        this.$.graphicsDevice.maxPixelRatio = window.devicePixelRatio;
        this.$.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
        this.$.setCanvasResolution(pc.RESOLUTION_AUTO);
        this.$.loader.getHandler(pc.ASSET_TEXTURE).crossOrigin = true;
        this.$.root.name = "Application Root";
        this.$.start();
        this.entities = new EntityManager(this);
        this.textures = new TextureManager(this);
        this.cubemaps = new CubemapManager(this);
        this.materials = new MaterialManager(this);
        this.models = new ModelManager(this);
        this.animations = new AnimationManager(this);
        this.gizmos = new GizmoManager(this);
        this.selection = new Selection(this);
        this.onResize = this._onResize.bind(this);
    }
    Application.prototype.enhance = function () {
        enhancePlayCanvas();
        AnimationController$1(this);
        if (this.$.mouse) {
            pc.events.attach(this.$.mouse);
            this.$.mouse.fire = pc.events.fire2;
        }
        if (this.$.touch) {
            pc.events.attach(this.$.touch);
            this.$.touch.fire = pc.events.fire2;
        }
        if (this.$.keyboard) {
            pc.events.attach(this.$.keyboard);
        }
        this.isEnhanced = true;
        return this;
    };
    Application.prototype.autoResize = function () {
        window.addEventListener("resize", this.onResize, false);
        window.addEventListener("orientationchange", this.onResize, false);
        this.isAutoResized = true;
        return this;
    };
    Application.prototype._onResize = function () {
        var canvas = this.$.graphicsDevice.canvas;
        this.$.resizeCanvas(canvas.width, canvas.height);
    };
    return Application;
}());

var Camera = /** @class */ (function (_super) {
    __extends(Camera, _super);
    function Camera(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this, args) || this;
        _this.type = ENTITY_CAMERA;
        _this.entity.addComponent("camera");
        return _this;
    }
    return Camera;
}(Entity));

var LightType;
(function (LightType) {
    LightType["DIRECTIONAL"] = "directional";
    LightType["POINT"] = "point";
    LightType["SPOT"] = "spot";
})(LightType || (LightType = {}));
var Light = /** @class */ (function (_super) {
    __extends(Light, _super);
    function Light(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this, args) || this;
        _this.type = ENTITY_LIGHT;
        _this.entity.addComponent("light");
        if (args.type) {
            _this.entity.light.type = args.type;
        }
        return _this;
    }
    return Light;
}(Entity));

var Picker = /** @class */ (function (_super) {
    __extends(Picker, _super);
    function Picker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Picker.prototype.initialize = function () {
        this.on("enable", this.onEnable, this);
        this.on("disable", this.onDisable, this);
        this.onEnable();
    };
    /* tslint:disable-next-line  */
    Picker.prototype.onSelect = function (_result) {
    };
    Picker.prototype.onEnable = function () {
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
    };
    Picker.prototype.onDisable = function () {
        this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
    };
    Picker.prototype.onMouseMove = function (e) {
        var result = this.select(e.x, e.y);
        this.onSelect(result);
    };
    Picker.prototype.select = function (x, y) {
        var target = this.App.selection.select(x, y);
        if (!target || !target.model || !target.model.meshInstances) {
            return null;
        }
        return this.App.selection
            .prepareRay(x, y)
            .intersectMeshInstances(target.model.meshInstances);
    };
    Picker.__name = "picker";
    return Picker;
}(ScriptType));
var Picker$1 = createScript(Picker);
//# sourceMappingURL=picker.js.map

var OrbitCamera = /** @class */ (function (_super) {
    __extends(OrbitCamera, _super);
    function OrbitCamera() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._targetDistance = 0;
        _this._targetPitch = 0;
        _this._targetYaw = 0;
        _this._distance = 0;
        _this._pitch = 0;
        _this._yaw = 0;
        _this._pivotPoint = new pc.Vec3();
        _this._modelsAabb = new pc.BoundingBox();
        return _this;
    }
    Object.defineProperty(OrbitCamera.prototype, "distance", {
        get: function () {
            return this._targetDistance;
        },
        set: function (value) {
            this._targetDistance = this._clampDistance(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OrbitCamera.prototype, "pitch", {
        get: function () {
            return this._targetPitch;
        },
        set: function (value) {
            this._targetPitch = this._clampPitchAngle(value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OrbitCamera.prototype, "yaw", {
        get: function () {
            return this._targetYaw;
        },
        set: function (value) {
            this._targetYaw = value;
            // Ensure that the yaw takes the shortest route by making sure that
            // the difference between the targetYaw and the actual is 180 degrees
            // in either direction
            var diff = this._targetYaw - this._yaw;
            var reminder = diff % 360;
            if (reminder > 180) {
                this._targetYaw = this._yaw - (360 - reminder);
            }
            else if (reminder < -180) {
                this._targetYaw = this._yaw + (360 + reminder);
            }
            else {
                this._targetYaw = this._yaw + reminder;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OrbitCamera.prototype, "pivotPoint", {
        get: function () {
            return this._pivotPoint;
        },
        set: function (value) {
            this._pivotPoint.copy(value);
        },
        enumerable: true,
        configurable: true
    });
    OrbitCamera.prototype.initialize = function () {
        var cameraQuat = this.entity.getRotation();
        this._checkAspectRatio();
        this._buildAabb(this.focusEntity || this.app.root, 0);
        this.entity.lookAt(this._modelsAabb.center);
        this._pivotPoint.copy(this._modelsAabb.center);
        this._yaw = this._calcYaw(cameraQuat);
        this._pitch = this._clampPitchAngle(this._calcPitch(cameraQuat, this._yaw));
        this.entity.setLocalEulerAngles(this._pitch, this._yaw, 0);
        this._targetYaw = this._yaw;
        this._targetPitch = this._pitch;
    };
    OrbitCamera.prototype.update = function (dt) {
        var t = this.inertiaFactor === 0 ? 1 : Math.min(dt / this.inertiaFactor, 1);
        this._distance = pc.math.lerp(this._distance, this._targetDistance, t);
        this._yaw = pc.math.lerp(this._yaw, this._targetYaw, t);
        this._pitch = pc.math.lerp(this._pitch, this._targetPitch, t);
        this._updatePosition();
    };
    OrbitCamera.prototype.focus = function (focusEntity) {
        this._buildAabb(focusEntity, 0);
        var halfExtents = this._modelsAabb.halfExtents;
        var distance = Math.max(halfExtents.x, Math.max(halfExtents.y, halfExtents.z));
        distance = (distance / Math.tan(0.5 * this.entity.camera.fov * pc.math.DEG_TO_RAD));
        distance = (distance * 2);
        this.distance = distance;
        this._removeInertia();
        this._pivotPoint.copy(this._modelsAabb.center);
    };
    OrbitCamera.prototype.resetAndLookAt = function (resetPoint, lookAtPoint) {
        this.pivotPoint.copy(lookAtPoint);
        this.entity.setPosition(resetPoint);
        this.entity.lookAt(lookAtPoint);
        var distance = OrbitCamera.distanceBetween;
        distance.sub2(lookAtPoint, resetPoint);
        this.distance = distance.length();
        this.pivotPoint.copy(lookAtPoint);
        var cameraQuat = this.entity.getRotation();
        this.yaw = this._calcYaw(cameraQuat);
        this.pitch = this._calcPitch(cameraQuat, this.yaw);
        // this._removeInertia();
        this._updatePosition();
    };
    OrbitCamera.prototype.reset = function (pitch, yaw, distance) {
        this.pitch = pitch;
        this.yaw = yaw;
        this.distance = distance;
        this._removeInertia();
    };
    OrbitCamera.prototype._updatePosition = function () {
        this.entity.setLocalPosition(0, 0, 0);
        this.entity.setLocalEulerAngles(this._pitch, this._yaw, 0);
        var position = this.entity.getPosition();
        position.copy(this.entity.forward);
        position.scale(-this._distance);
        position.add(this.pivotPoint);
        this.entity.setPosition(position);
    };
    OrbitCamera.prototype._removeInertia = function () {
        this._yaw = this._targetYaw;
        this._pitch = this._targetPitch;
        this._distance = this._targetDistance;
    };
    OrbitCamera.prototype._checkAspectRatio = function () {
        var height = this.app.graphicsDevice.height;
        var width = this.app.graphicsDevice.width;
        // Match the axis of FOV to match the aspect ratio of the canvas so
        // the focused entities is always in frame
        this.entity.camera.horizontalFov = height > width;
    };
    OrbitCamera.prototype._buildAabb = function (entity, modelsAdded) {
        var i = 0;
        if (entity.model) {
            var mi = entity.model.meshInstances;
            for (i = 0; i < mi.length; i++) {
                if (modelsAdded === 0) {
                    this._modelsAabb.copy(mi[i].aabb);
                }
                else {
                    this._modelsAabb.add(mi[i].aabb);
                }
                modelsAdded += 1;
            }
        }
        for (i = 0; i < entity.children.length; ++i) {
            modelsAdded += this._buildAabb(entity.children[i], modelsAdded);
        }
        return modelsAdded;
    };
    OrbitCamera.prototype._clampDistance = function (distance) {
        if (this.distanceMax > 0) {
            return pc.math.clamp(distance, this.distanceMin, this.distanceMax);
        }
        else {
            return Math.max(distance, this.distanceMin);
        }
    };
    OrbitCamera.prototype._clampPitchAngle = function (pitch) {
        return pc.math.clamp(pitch, -this.pitchAngleMax, -this.pitchAngleMin);
    };
    OrbitCamera.prototype._calcPitch = function (quat, yaw) {
        var quatWithoutYaw = OrbitCamera.quatWithoutYaw;
        var yawOffset = OrbitCamera.yawOffset;
        yawOffset.setFromEulerAngles(0, -yaw, 0);
        quatWithoutYaw.mul2(yawOffset, quat);
        var transformedForward = new pc.Vec3();
        quatWithoutYaw.transformVector(pc.Vec3.FORWARD, transformedForward);
        return Math.atan2(transformedForward.y, -transformedForward.z) * pc.math.RAD_TO_DEG;
    };
    OrbitCamera.prototype._calcYaw = function (quat) {
        var transformedForward = new pc.Vec3();
        quat.transformVector(pc.Vec3.FORWARD, transformedForward);
        return Math.atan2(-transformedForward.x, -transformedForward.z) * pc.math.RAD_TO_DEG;
    };
    OrbitCamera.__name = "orbitCamera";
    OrbitCamera.__attributes = {
        distanceMax: {
            type: "number",
            default: 0,
            title: "Distance Max",
            description: "Setting this at 0 will give an infinite distance limit"
        },
        distanceMin: {
            type: "number",
            default: 0,
            title: "Distance Min"
        },
        pitchAngleMax: {
            type: "number",
            default: 90,
            title: "Pitch Angle Max (degrees)"
        },
        pitchAngleMin: {
            type: "number",
            default: -90,
            title: "Pitch Angle Min (degrees)"
        },
        inertiaFactor: {
            type: "number",
            default: 0,
            title: "Inertia Factor",
            /* tslint:disable-next-line */
            description: "Higher value means that the camera will continue moving after the user has stopped dragging. 0 is fully responsive."
        },
        focusEntity: {
            type: "entity",
            title: "Focus Entity",
            description: "Entity for the camera to focus on. If blank, then the camera will use the whole scene"
        },
        frameOnStart: {
            type: "boolean",
            default: true,
            title: "Frame on Start",
            description: "Frames the entity or scene at the start of the application."
        },
    };
    OrbitCamera.distanceBetween = new pc.Vec3();
    OrbitCamera.fromWorldPoint = new pc.Vec3();
    OrbitCamera.toWorldPoint = new pc.Vec3();
    OrbitCamera.worldDiff = new pc.Vec3();
    OrbitCamera.quatWithoutYaw = new pc.Quat();
    OrbitCamera.yawOffset = new pc.Quat();
    return OrbitCamera;
}(ScriptType));
var OrbitCamera$1 = createScript(OrbitCamera);

var OrbitCameraMouseInput = /** @class */ (function (_super) {
    __extends(OrbitCameraMouseInput, _super);
    function OrbitCameraMouseInput() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OrbitCameraMouseInput.prototype.initialize = function () {
        this.orbitCamera = this.entity.script.orbitCamera;
        if (this.orbitCamera) {
            this.on("enable", this.onEnable);
            this.on("disable", this.onDisable);
            this.onEnable();
        }
        // Disabling the context menu stops the browser displaying a menu when
        // you right-click the page
        this.app.mouse.disableContextMenu();
        this.lookButtonDown = false;
        this.panButtonDown = false;
        this.lastPoint = new pc.Vec2();
        this.onMouseOut = this._onMouseOut.bind(this);
    };
    OrbitCameraMouseInput.prototype.onEnable = function () {
        this.lookButtonDown = false;
        this.panButtonDown = false;
        this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.mouse.on(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        this.app.mouse.on(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        this.app.mouse.on(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);
        window.addEventListener("mouseout", this.onMouseOut, false);
    };
    OrbitCameraMouseInput.prototype.onDisable = function () {
        this.lookButtonDown = false;
        this.panButtonDown = false;
        this.app.mouse.off(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
        this.app.mouse.off(pc.EVENT_MOUSEUP, this.onMouseUp, this);
        this.app.mouse.off(pc.EVENT_MOUSEMOVE, this.onMouseMove, this);
        this.app.mouse.off(pc.EVENT_MOUSEWHEEL, this.onMouseWheel, this);
        window.removeEventListener("mouseout", this.onMouseOut, false);
    };
    OrbitCameraMouseInput.prototype.pan = function (screenPoint) {
        var fromWorldPoint = OrbitCameraMouseInput.fromWorldPoint;
        var toWorldPoint = OrbitCameraMouseInput.toWorldPoint;
        var worldDiff = OrbitCameraMouseInput.worldDiff;
        // For panning to work at any zoom level, we use screen point to world projection
        // to work out how far we need to pan the pivotEntity in world space
        var camera = this.entity.camera;
        var distance = this.orbitCamera.distance;
        camera.screenToWorld(screenPoint.x, screenPoint.y, distance, fromWorldPoint);
        camera.screenToWorld(this.lastPoint.x, this.lastPoint.y, distance, toWorldPoint);
        worldDiff.sub2(toWorldPoint, fromWorldPoint);
        this.orbitCamera.pivotPoint.add(worldDiff);
    };
    OrbitCameraMouseInput.prototype.onMouseDown = function (event) {
        event.event.preventDefault();
        event.event.stopPropagation();
        switch (event.button) {
            case pc.MOUSEBUTTON_LEFT:
                this.lookButtonDown = true;
                break;
            case pc.MOUSEBUTTON_MIDDLE:
            case pc.MOUSEBUTTON_RIGHT:
                this.panButtonDown = true;
                break;
        }
        this.app.fire("app:camera:movestart");
    };
    OrbitCameraMouseInput.prototype.onMouseUp = function (event) {
        var _this = this;
        event.event.preventDefault();
        event.event.stopPropagation();
        switch (event.button) {
            case pc.MOUSEBUTTON_LEFT:
                this.lookButtonDown = false;
                break;
            case pc.MOUSEBUTTON_MIDDLE:
            case pc.MOUSEBUTTON_RIGHT:
                this.panButtonDown = false;
                break;
        }
        setTimeout(function () {
            _this.app.fire("app:camera:moveend");
        }, 250);
    };
    OrbitCameraMouseInput.prototype.onMouseMove = function (event) {
        if (this.lookButtonDown) {
            this.orbitCamera.pitch -= event.dy * this.orbitSensitivity;
            this.orbitCamera.yaw -= event.dx * this.orbitSensitivity;
            this.app.fire("app:camera:move");
        }
        else if (this.panButtonDown) {
            this.pan(event);
            this.app.fire("app:camera:move");
        }
        this.lastPoint.set(event.x, event.y);
    };
    OrbitCameraMouseInput.prototype.onMouseWheel = function (event) {
        event.event.preventDefault();
        this.orbitCamera.distance -= event.wheel * this.distanceSensitivity * (this.orbitCamera.distance * 0.1);
        this.app.fire("app:camera:move");
    };
    OrbitCameraMouseInput.prototype._onMouseOut = function () {
        this.lookButtonDown = false;
        this.panButtonDown = false;
    };
    OrbitCameraMouseInput.__name = "orbitCameraMouseInput";
    OrbitCameraMouseInput.__attributes = {
        orbitSensitivity: {
            type: "number",
            default: 0.3,
            title: "Orbit Sensitivity",
            description: "How fast the camera moves around the orbit. Higher is faster"
        },
        distanceSensitivity: {
            type: "number",
            default: 0.15,
            title: "Distance Sensitivity",
            description: "How fast the camera moves in and out. Higher is faster"
        }
    };
    OrbitCameraMouseInput.fromWorldPoint = new pc.Vec3();
    OrbitCameraMouseInput.toWorldPoint = new pc.Vec3();
    OrbitCameraMouseInput.worldDiff = new pc.Vec3();
    return OrbitCameraMouseInput;
}(ScriptType));
var OrbitCameraMouseInput$1 = createScript(OrbitCameraMouseInput);
//# sourceMappingURL=orbitCameraMouseInput.js.map

var OrbitCameraTouchInput = /** @class */ (function (_super) {
    __extends(OrbitCameraTouchInput, _super);
    function OrbitCameraTouchInput() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    OrbitCameraTouchInput.prototype.initialize = function () {
        this.orbitCamera = this.entity.script.orbitCamera;
        // Store the position of the touch so we can calculate the distance moved
        this.lastTouchPoint = new pc.Vec2();
        this.lastPinchMidPoint = new pc.Vec2();
        this.lastPinchDistance = 0;
        if (this.orbitCamera && this.app.touch) {
            // Use the same callback for the touchStart, touchEnd and touchCancel events as they
            // all do the same thing which is to deal the possible multiple touches to the screen
            this.on("enable", this.onEnable);
            this.on("disable", this.onDisable);
            this.onEnable();
        }
    };
    OrbitCameraTouchInput.prototype.onEnable = function () {
        this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStartEndCancel, this);
        this.app.touch.on(pc.EVENT_TOUCHEND, this.onTouchStartEndCancel, this);
        this.app.touch.on(pc.EVENT_TOUCHCANCEL, this.onTouchStartEndCancel, this);
        this.app.touch.on(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
    };
    OrbitCameraTouchInput.prototype.onDisable = function () {
        this.app.touch.off(pc.EVENT_TOUCHSTART, this.onTouchStartEndCancel, this);
        this.app.touch.off(pc.EVENT_TOUCHEND, this.onTouchStartEndCancel, this);
        this.app.touch.off(pc.EVENT_TOUCHCANCEL, this.onTouchStartEndCancel, this);
        this.app.touch.off(pc.EVENT_TOUCHMOVE, this.onTouchMove, this);
    };
    OrbitCameraTouchInput.prototype.getPinchDistance = function (pointA, pointB) {
        // Return the distance between the two points
        var dx = pointA.x - pointB.x;
        var dy = pointA.y - pointB.y;
        return Math.sqrt((dx * dx) + (dy * dy));
    };
    OrbitCameraTouchInput.prototype.calcMidPoint = function (pointA, pointB, result) {
        result.set(pointB.x - pointA.x, pointB.y - pointA.y);
        result.scale(0.5);
        result.x += pointA.x;
        result.y += pointA.y;
    };
    OrbitCameraTouchInput.prototype.onTouchStartEndCancel = function (event) {
        var _this = this;
        event.event.preventDefault();
        // We only care about the first touch for camera rotation. As the user touches the screen,
        // we stored the current touch position
        var touches = event.touches;
        if (touches.length === 1) {
            this.lastTouchPoint.set(touches[0].x, touches[0].y);
        }
        else if (touches.length === 2) {
            // If there are 2 touches on the screen, then set the pinch distance
            this.lastPinchDistance = this.getPinchDistance(touches[0], touches[1]);
            this.calcMidPoint(touches[0], touches[1], this.lastPinchMidPoint);
        }
        switch (event.event.type) {
            case "touchstart":
                this.app.fire("app:camera:movestart");
                break;
            case "touchend":
            case "touchcancel":
                setTimeout(function () {
                    _this.app.fire("app:camera:moveend");
                }, 250);
                break;
        }
    };
    OrbitCameraTouchInput.prototype.pan = function (midPoint) {
        var fromWorldPoint = OrbitCameraTouchInput.fromWorldPoint;
        var toWorldPoint = OrbitCameraTouchInput.toWorldPoint;
        var worldDiff = OrbitCameraTouchInput.worldDiff;
        // For panning to work at any zoom level, we use screen point to world projection
        // to work out how far we need to pan the pivotEntity in world space
        var camera = this.entity.camera;
        var distance = this.orbitCamera.distance;
        camera.screenToWorld(midPoint.x, midPoint.y, distance, fromWorldPoint);
        camera.screenToWorld(this.lastPinchMidPoint.x, this.lastPinchMidPoint.y, distance, toWorldPoint);
        worldDiff.sub2(toWorldPoint, fromWorldPoint);
        this.orbitCamera.pivotPoint.add(worldDiff);
    };
    OrbitCameraTouchInput.prototype.onTouchMove = function (event) {
        var pinchMidPoint = OrbitCameraTouchInput.pinchMidPoint;
        // We only care about the first touch for camera rotation. Work out the difference moved since the last event
        // and use that to update the camera target position
        var touches = event.touches;
        if (touches.length === 1) {
            var touch = touches[0];
            this.orbitCamera.pitch -= (touch.y - this.lastTouchPoint.y) * this.orbitSensitivity;
            this.orbitCamera.yaw -= (touch.x - this.lastTouchPoint.x) * this.orbitSensitivity;
            this.lastTouchPoint.set(touch.x, touch.y);
            this.app.fire("app:camera:move");
        }
        else if (touches.length === 2) {
            // Calculate the difference in pinch distance since the last event
            var currentPinchDistance = this.getPinchDistance(touches[0], touches[1]);
            var diffInPinchDistance = currentPinchDistance - this.lastPinchDistance;
            this.lastPinchDistance = currentPinchDistance;
            this.orbitCamera.distance -= (diffInPinchDistance * this.distanceSensitivity * 0.1) *
                (this.orbitCamera.distance * 0.1);
            // Calculate pan difference
            this.calcMidPoint(touches[0], touches[1], pinchMidPoint);
            if (Math.abs(diffInPinchDistance) <= this.pinchSensitivity) {
                this.pan(pinchMidPoint);
                this.app.fire("app:camera:move");
            }
            this.lastPinchMidPoint.copy(pinchMidPoint);
        }
    };
    OrbitCameraTouchInput.__name = "orbitCameraTouchInput";
    OrbitCameraTouchInput.__attributes = {
        orbitSensitivity: {
            type: "number",
            default: 0.4,
            title: "Orbit Sensitivity",
            description: "How fast the camera moves around the orbit. Higher is faster"
        },
        distanceSensitivity: {
            type: "number",
            default: 0.2,
            title: "Distance Sensitivity",
            description: "How fast the camera moves in and out. Higher is faster"
        },
        pinchSensitivity: {
            type: "number",
            default: 1,
            title: "Pinch Sensitivity"
        }
    };
    OrbitCameraTouchInput.fromWorldPoint = new pc.Vec3();
    OrbitCameraTouchInput.toWorldPoint = new pc.Vec3();
    OrbitCameraTouchInput.worldDiff = new pc.Vec3();
    OrbitCameraTouchInput.pinchMidPoint = new pc.Vec2();
    return OrbitCameraTouchInput;
}(ScriptType));
var OrbitCameraTouchInput$1 = createScript(OrbitCameraTouchInput);
//# sourceMappingURL=orbitCameraTouchInput.js.map

var scripts = {
    createScript: createScript,
    ScriptType: ScriptType,
    Picker: Picker$1,
    OrbitCamera: OrbitCamera$1,
    OrbitCameraMouseInput: OrbitCameraMouseInput$1,
    OrbitCameraTouchInput: OrbitCameraTouchInput$1
};
//# sourceMappingURL=index.js.map

function createShader(shaderDefinition) {
    return function (graphicsDevice) {
        shaderDefinition.fshader = "precision " + graphicsDevice.precision + " float;\n" + shaderDefinition.fshader;
        return new pc.Shader(graphicsDevice, shaderDefinition);
    };
}
//# sourceMappingURL=shader.js.map

var vshader = "\nattribute vec3 aPosition;\nattribute vec3 aNormal;\n\nuniform mat4 matrix_view;\nuniform mat4 matrix_model;\nuniform mat3 matrix_normal;\nuniform mat4 matrix_viewProjection;\n\nvarying vec3 vNormal;\n\nvoid main(void) {\n    vNormal = mat3(matrix_view) * matrix_normal * aNormal;\n    gl_Position = matrix_viewProjection * matrix_model * vec4(aPosition, 1.0);\n}\n";
var fshader = "\nvarying vec3 vNormal;\n\nvoid main(void) {\n  vec3 normalViewColor = normalize(vNormal) * 0.5 + 0.5;\n  gl_FragColor  = vec4(normalViewColor, 1.0);\n}\n";
var shaderDefinition = {
    attributes: {
        aPosition: pc.SEMANTIC_POSITION,
        aNormal: pc.SEMANTIC_NORMAL
    },
    vshader: vshader,
    fshader: fshader
};
var MeshNormalShader = createShader(shaderDefinition);
//# sourceMappingURL=index.js.map

var shaders = {
    MeshNormalShader: MeshNormalShader
};
//# sourceMappingURL=index.js.map

exports.Application = Application;
exports.Entity = Entity;
exports.Model = Model;
exports.Camera = Camera;
exports.Light = Light;
exports.scripts = scripts;
exports.shaders = shaders;
exports.constants = constants;

Object.defineProperty(exports, '__esModule', { value: true });

})));
