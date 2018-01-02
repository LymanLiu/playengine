declare module pc {
    export function createScript(name : string, app : Application) : any;
    export class Application {
        constructor(canvas : HTMLCanvasElement, options : any);
        graphicsDevice: any;
        loader: any;
        assets: any;
        start: () => void;
        setCanvasFillMode: (mode: string) => void;
        setCanvasResolution: (mode: string) => void;
        on: (event: string, callback : () => void) => void;
    }

    export class Entity {
        
    }

    export class Asset {
        constructor(name: string, type: string, file: any, data: any);
        id: number;
    }

    export class StandardMaterial {

    }

    export class ModelHandler {
        static DEFAULT_MATERIAL: any;
    }

    export class Vec2 {
        x: number;
        y: number;
    }

    export class Vec3 {
        static UP: Vec3;
        static RIGHT: Vec3;
        static FORWARD: Vec3;
        x: number;
        y: number;
        z: number;
    }

    export class Vec4 {
        x: number;
        y: number;
        z: number;
        w: number;
    }

    export class Quat {
        x: number;
        y: number;
        z: number;
        w: number;

        transformVector: (vec : pc.Vec3, res? : pc.Vec3) => void;
    }

    export const FILLMODE_NONE: string;
    export const FILLMODE_FILL_WINDOW: string;
    export const FILLMODE_KEEP_ASPECT: string;
    export const RESOLUTION_AUTO: string;
    export const RESOLUTION_FIXED: string;
}
