import { TextureManager, CubemapManager, MaterialManager, ModelManager, AnimationManager } from "./assets";
import AnimationController from "./scripts/animationController";
import enhancePlayCanvas from "./enhance";

export interface ApplicationOptions {
    keyboard?: any;
    mouse?: any;
    touch?: any;
    gamepads?: any;
    scriptPrefix?: string;
    assetPrefix?: string;
    graphicsDeviceOptions?: object;
}

export class Application {
    public $: pc.Application;
    public textures: TextureManager;
    public cubemaps: CubemapManager;
    public materials: MaterialManager;
    public models: ModelManager;
    public animations: AnimationManager;

    public isEnhanced = false;
    public isAutoResized = false;

    private onResize: (event?: any) => void;

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
        this.animations = new AnimationManager(this);

        this.onResize = this._onResize.bind(this);
    }

    public enhance() {
        enhancePlayCanvas();
        AnimationController(this);
        this.isEnhanced = true;

        return this;
    }

    public autoResize() {
        window.addEventListener("resize", this.onResize, false);
        window.addEventListener("orientationchange", this.onResize, false);
        this.isAutoResized = true;

        return this;
    }

    private _onResize() {
        const canvas = this.$.graphicsDevice.canvas;
        this.$.resizeCanvas(canvas.width, canvas.height);
    }
}
