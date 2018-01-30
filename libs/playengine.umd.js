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
var constants = {
    MATERIAL_OBJECT_FIELDS: MATERIAL_OBJECT_FIELDS,
    MATERIAL_OBJECT_FIELDS2: MATERIAL_OBJECT_FIELDS2,
    MATERIAL_ARRAY_FIELDS: MATERIAL_ARRAY_FIELDS,
    MATERIAL_ARRAY_FIELDS2: MATERIAL_ARRAY_FIELDS2,
    MATERIAL_TEXTURE_FIELDS: MATERIAL_TEXTURE_FIELDS,
    MATERIAL_TEXTURE_FIELDS2: MATERIAL_TEXTURE_FIELDS2
};

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
        if (this._assets[data.uid])
            return this;
        var assets = [];
        var texturesMap = {};
        var materialsMap = {};
        var modelDataOptions = {
            area: 0,
            mapping: [],
            assets: []
        };
        if (data.textures && data.textures.length > 0) {
            data.textures.forEach(function (textureData) {
                var textureAsset = _this.app.textures.add(textureData);
                texturesMap[textureData.name] = textureAsset.id;
                modelDataOptions.assets.push(textureAsset.id);
                assets.push(textureAsset.id);
            });
        }
        if (data.materials && data.materials.length > 0) {
            data.materials.forEach(function (materialData) {
                if (materialsMap[materialData.name])
                    return;
                _this.app.materials.link(materialData, texturesMap);
                var materialAsset = _this.app.materials.add(materialData);
                materialsMap[materialData.name] = materialAsset.id;
                modelDataOptions.assets.push(materialAsset.id);
                assets.push(materialAsset.id);
            });
            modelDataOptions.mapping = data.mapping.map(function (name) { return ({ material: materialsMap[name] }); });
        }
        var modelAsset = new pc.Asset(data.name, pc.ASSET_MODEL, { url: data.url }, modelDataOptions);
        this._assets[data.uid] = modelAsset;
        this.app.$.assets.add(modelAsset);
        return this;
    };
    ModelManager.prototype.load = function (identity, options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        return new Promise(function (resolve, reject) {
            var modelAsset = _this._assets[identity];
            var loadedCounts = 0;
            var totalCounts = 1 + modelAsset.data.assets.length;
            var onLoaded = function (asset) {
                loadedCounts++;
                if (options.onProgress) {
                    options.onProgress(asset, loadedCounts, totalCounts);
                }
                if (loadedCounts === totalCounts) {
                    resolve(modelAsset);
                }
            };
            modelAsset.data.assets.forEach(function (assetId) {
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

function enhance() {
    pc.BoundingBox.prototype.toJSON = function () {
        return {
            center: Array.from(this.center.data),
            halfExtents: Array.from(this.halfExtents.data)
        };
    };
}

function enhance$1() {
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

function enhance$2() {
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
                        result["bumpMapFactor"] = _this[field];
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

/// <reference path="./index.d.ts" />
function enhancePlayCanvas() {
    enhance();
    enhance$1();
    enhance$2();
}

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
        this.$.start();
        this.textures = new TextureManager(this);
        this.cubemaps = new CubemapManager(this);
        this.materials = new MaterialManager(this);
        this.models = new ModelManager(this);
        this.onResize = this._onResize.bind(this);
    }
    Application.prototype.enhance = function () {
        enhancePlayCanvas();
        this.isEnhanced = true;
        return this;
    };
    Application.prototype.autoResize = function () {
        window.addEventListener('resize', this.onResize, false);
        window.addEventListener('orientationchange', this.onResize, false);
        this.isAutoResized = true;
        return this;
    };
    Application.prototype._onResize = function () {
        var canvas = this.$.graphicsDevice.canvas;
        this.$.resizeCanvas(canvas.width, canvas.height);
    };
    return Application;
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
            if (this._enabled !== value)
                this._enabled = value;
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
            if (isNaN(v))
                return null;
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
                if (typeof (value[i]) !== "number")
                    return null;
            }
            if (!old)
                old = new pc.Color();
            for (var i = 0; i < 4; i++)
                old.data[i] = (i === 4 && value.length === 3) ? 1 : value[i];
            return old;
        }
        else if (typeof (value) === "string" && /#([0-9abcdef]{2}){3,4}/i.test(value)) {
            if (!old)
                old = new pc.Color();
            old.fromString(value);
            return old;
        }
        else {
            return null;
        }
    };
    ScriptAttributes.rawToVector = function (args, value, old) {
        var len = parseInt(args.type.slice(3), 10);
        var VecType = "Vec" + len;
        if (value instanceof pc[VecType]) {
            if (old instanceof pc[VecType]) {
                old.copy(value);
                return old;
            }
            else {
                return value.clone();
            }
        }
        else if (value instanceof Array && value.length === len) {
            for (var i = 0; i < value.length; i++) {
                if (typeof (value[i]) !== "number")
                    return null;
            }
            if (!old)
                old = new pc[VecType]();
            for (var i = 0; i < len; i++)
                old.data[i] = value[i];
            return old;
        }
        else {
            return null;
        }
    };
    ScriptAttributes.rawToCurve = function (value) {
        if (value) {
            var curve;
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
            console.warn("attribute \"" + name + "\" is already defined for script type \"" + this.scriptType.name + "\"");
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
        if (!this.index[name])
            return false;
        delete this.index[name];
        delete this.scriptType.prototype[name];
        return true;
    };
    ScriptAttributes.prototype.has = function (name) {
        return !!this.index[name];
    };
    return ScriptAttributes;
}());
function createScript(ScriptConstructor) {
    return function (app) {
        ScriptConstructor.attributes = new ScriptAttributes(ScriptConstructor);
        ScriptConstructor.prototype.App = app;
        ScriptConstructor.prototype.__initializeAttributes = function (force) {
            if (!force && !this.__attributesRaw)
                return;
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
            ScriptConstructor.attributes.add(key, ScriptConstructor.__attributes[key]);
        }
        var registry = app ? app.$.scripts : pc.Application.getApplication().scripts;
        registry.add(ScriptConstructor);
        pc.ScriptHandler._push(ScriptConstructor);
        return ScriptConstructor;
    };
}

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
        _this._pivotPoint = new pc.Vec3;
        _this._modelsAabb = new pc.BoundingBox;
        _this.lastPoint = new pc.Vec2();
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
        distanceMax: { type: "number", default: 0, title: "Distance Max", description: "Setting this at 0 will give an infinite distance limit" },
        distanceMin: { type: "number", default: 0, title: "Distance Min" },
        pitchAngleMax: { type: "number", default: 90, title: "Pitch Angle Max (degrees)" },
        pitchAngleMin: { type: "number", default: -90, title: "Pitch Angle Min (degrees)" },
        inertiaFactor: { type: "number", default: 0, title: "Inertia Factor", description: "Higher value means that the camera will continue moving after the user has stopped dragging. 0 is fully responsive." },
        focusEntity: { type: "entity", title: "Focus Entity", description: "Entity for the camera to focus on. If blank, then the camera will use the whole scene" },
        frameOnStart: { type: "boolean", default: true, title: "Frame on Start", description: "Frames the entity or scene at the start of the application." },
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
                {
                    this.lookButtonDown = true;
                }
                break;
            case pc.MOUSEBUTTON_MIDDLE:
            case pc.MOUSEBUTTON_RIGHT:
                {
                    this.panButtonDown = true;
                }
                break;
        }
    };
    OrbitCameraMouseInput.prototype.onMouseUp = function (event) {
        event.event.preventDefault();
        event.event.stopPropagation();
        var self = this;
        switch (event.button) {
            case pc.MOUSEBUTTON_LEFT:
                {
                    this.lookButtonDown = false;
                }
                break;
            case pc.MOUSEBUTTON_MIDDLE:
            case pc.MOUSEBUTTON_RIGHT:
                {
                    this.panButtonDown = false;
                }
                break;
        }
        setTimeout(function () {
            self.app.fire("app:camera:moveend");
        }, 250);
    };
    OrbitCameraMouseInput.prototype.onMouseMove = function (event) {
        if (this.lookButtonDown) {
            this.orbitCamera.pitch -= event.dy * this.orbitSensitivity;
            this.orbitCamera.yaw -= event.dx * this.orbitSensitivity;
            this.app.fire("app:camera:movestart");
        }
        else if (this.panButtonDown) {
            this.pan(event);
            this.app.fire("app:camera:movestart");
        }
        this.lastPoint.set(event.x, event.y);
    };
    OrbitCameraMouseInput.prototype.onMouseWheel = function (event) {
        this.orbitCamera.distance -= event.wheel * this.distanceSensitivity * (this.orbitCamera.distance * 0.1);
        event.event.preventDefault();
    };
    OrbitCameraMouseInput.prototype._onMouseOut = function () {
        this.lookButtonDown = false;
        this.panButtonDown = false;
    };
    OrbitCameraMouseInput.__name = "orbitCameraMouseInput";
    OrbitCameraMouseInput.__attributes = {
        orbitSensitivity: { type: "number", default: 0.3, title: "Orbit Sensitivity", description: "How fast the camera moves around the orbit. Higher is faster" },
        distanceSensitivity: { type: "number", default: 0.15, title: "Distance Sensitivity", description: "How fast the camera moves in and out. Higher is faster" }
    };
    OrbitCameraMouseInput.fromWorldPoint = new pc.Vec3();
    OrbitCameraMouseInput.toWorldPoint = new pc.Vec3();
    OrbitCameraMouseInput.worldDiff = new pc.Vec3();
    return OrbitCameraMouseInput;
}(ScriptType));
var OrbitCameraMouseInput$1 = createScript(OrbitCameraMouseInput);

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
        if (touches.length == 1) {
            this.lastTouchPoint.set(touches[0].x, touches[0].y);
        }
        else if (touches.length == 2) {
            // If there are 2 touches on the screen, then set the pinch distance
            this.lastPinchDistance = this.getPinchDistance(touches[0], touches[1]);
            this.calcMidPoint(touches[0], touches[1], this.lastPinchMidPoint);
        }
        setTimeout(function () {
            _this.app.fire("app:camera.moveend");
        }, 250);
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
        if (touches.length == 1) {
            var touch = touches[0];
            this.orbitCamera.pitch -= (touch.y - this.lastTouchPoint.y) * this.orbitSensitivity;
            this.orbitCamera.yaw -= (touch.x - this.lastTouchPoint.x) * this.orbitSensitivity;
            this.lastTouchPoint.set(touch.x, touch.y);
            this.app.fire("app:camera:movestart");
        }
        else if (touches.length == 2) {
            // Calculate the difference in pinch distance since the last event
            var currentPinchDistance = this.getPinchDistance(touches[0], touches[1]);
            var diffInPinchDistance = currentPinchDistance - this.lastPinchDistance;
            this.lastPinchDistance = currentPinchDistance;
            this.orbitCamera.distance -= (diffInPinchDistance * this.distanceSensitivity * 0.1) * (this.orbitCamera.distance * 0.1);
            // Calculate pan difference
            this.calcMidPoint(touches[0], touches[1], pinchMidPoint);
            if (Math.abs(diffInPinchDistance) <= this.pinchSensitivity) {
                this.pan(pinchMidPoint);
                this.app.fire("app:camera:movestart");
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

var scripts = {
    createScript: createScript,
    ScriptType: ScriptType,
    OrbitCamera: OrbitCamera$1,
    OrbitCameraMouseInput: OrbitCameraMouseInput$1,
    OrbitCameraTouchInput: OrbitCameraTouchInput$1
};

var Entity = /** @class */ (function () {
    function Entity(args) {
        if (args === void 0) { args = {}; }
        this.entity = new pc.Entity();
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
        var _a, _b, _c;
    }
    return Entity;
}());

var Model = /** @class */ (function (_super) {
    __extends(Model, _super);
    function Model(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this, args) || this;
        _this.entity.addComponent("model");
        if (args.uid) {
            _this.uid = args.uid;
        }
        if (args.type) {
            _this.entity.model.type = args.type;
        }
        if (args.asset) {
            _this.entity.model.asset = args.asset;
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
    return Model;
}(Entity));

var Camera = /** @class */ (function (_super) {
    __extends(Camera, _super);
    function Camera(args) {
        if (args === void 0) { args = {}; }
        var _this = _super.call(this, args) || this;
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
        _this.entity.addComponent("light");
        if (args.type) {
            _this.entity.light.type = args.type;
        }
        return _this;
    }
    return Light;
}(Entity));

exports.Application = Application;
exports.scripts = scripts;
exports.Entity = Entity;
exports.Model = Model;
exports.Camera = Camera;
exports.Light = Light;
exports.constants = constants;

Object.defineProperty(exports, '__esModule', { value: true });

})));
