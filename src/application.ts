import { TextureManager, CubemapManager, MaterialManager, ModelManager } from "./assets";
import enhancePlayCanvas from "./enhance";

export interface ApplicationOptions {
    keyboard?: any,
    mouse?: any,
    touch?: any,
    gamepads?: any,
    scriptPrefix?: string,
    assetPrefix?: string,
    graphicsDeviceOptions?: Object
}

export class Application {
    $: pc.Application;
    textures: TextureManager;
    cubemaps: CubemapManager;
    materials: MaterialManager;
    models: ModelManager;

    isEnhanced = false;

    constructor(canvas: HTMLCanvasElement, options: ApplicationOptions = {}) {
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
    }

    enhance() {
        enhancePlayCanvas();
        this.isEnhanced = true;
    }
}

