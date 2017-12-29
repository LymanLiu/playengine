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
    $ : any;

    constructor(canvas : HTMLCanvasElement, options : ApplicationOptions = {}) {
        this.$ = new pc.Application(canvas, options);
        this.$.graphicsDevice.maxPixelRatio = window.devicePixelRatio;
        this.$.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
        this.$.setCanvasResolution(pc.RESOLUTION_AUTO);
        this.$.loader._handlers.texture.crossOrigin = true;

        this.$.start();
    }
}

