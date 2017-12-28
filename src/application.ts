export class Application {
    pcApp : any;

    constructor(canvas : HTMLCanvasElement, options : Object) {
        this.pcApp = new pc.Application(canvas, options);
        this.pcApp.graphicsDevice.maxPixelRatio = window.devicePixelRatio;
        this.pcApp.setCanvasFillMode(pc.FILLMODE_FILL_WINDOW);
        this.pcApp.setCanvasResolution(pc.RESOLUTION_AUTO);
        this.pcApp.loader_handlers.texture.crossOrigin = true;
    }
}

