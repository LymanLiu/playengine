declare module pc {
    export class Application {
        constructor(canvas : HTMLCanvasElement, options : any);
        start: () => void;
        setCanvasFillMode: (mode: string) => void;
        setCanvasResolution: (mode: string) => void;
        on: (event: string, callback : () => void) => void;
    }

    export const FILLMODE_NONE: string;
    export const FILLMODE_FILL_WINDOW: string;
    export const FILLMODE_KEEP_ASPECT: string;
    export const RESOLUTION_AUTO: string;
    export const RESOLUTION_FIXED: string;
}
