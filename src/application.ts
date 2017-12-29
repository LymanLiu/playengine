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
    pcApp : any;

    constructor(canvas : HTMLCanvasElement, options : ApplicationOptions) {
        this.pcApp = new pc.Application(canvas, options);
        this.pcApp.graphicsDevice.maxPixelRatio = window.devicePixelRatio;
        this.pcApp.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
        this.pcApp.setCanvasResolution(pc.RESOLUTION_AUTO);
        this.pcApp.loader._handlers.texture.crossOrigin = true;
    }
}

