declare namespace pc {

    type EventListener = (...args: any[]) => void;

    namespace events {
        function on(name: string, callback: pc.EventListener, scope?: any, priority?: number): void;
        function fire2(
            name: string,
            arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any, arg6?: any, arg7?: any, arg8?: any
        ): void;
    }

    interface Mouse {
        on(name: string, callback: pc.EventListener, scope?: any, priority?: number): void;
    }

    interface TouchDevice {
        on(name: string, callback: pc.EventListener, scope?: any, priority?: number): void;
    }

    interface MouseEvent {
        stopPropagation(): void;
    }

    interface TouchEvent {
        stopPropagation(): void;
    }

    interface MeshInstanceIntersection {
        index: number;
        distance: number;
        point: pc.Vec3;
        localPoint: pc.Vec3;
        normal: pc.Vec3;
        vertices: pc.Vec3[];
        meshInstance: pc.MeshInstance;
    }

    interface ToJSONOptions {
        diff?: boolean;
    }

    interface EnhanceAsset {
        toJSON(options?: ToJSONOptions): object;
    }

    interface BasicMaterial {
        _color: number[];
    }

    interface StandardMaterial extends EnhanceAsset {
        [prop: string]: any;
    }

    interface Texture extends EnhanceAsset { }
    interface BoundingBox extends EnhanceAsset { }

    interface Ray {
        intersectTriangle(
            a: pc.Vec3,
            b: pc.Vec3,
            c: pc.Vec3,
            backfaceCulling: boolean,
            res?: pc.Vec3
        ): pc.Vec3;

        intersectMeshInstances(meshInstances: pc.MeshInstance[]): MeshInstanceIntersection[];
    }

    interface MeshInstance {
        intersectsRay(worldRay: pc.Ray, intersects?: MeshInstanceIntersection[]): MeshInstanceIntersection[];
    }

    interface Entity {
        getApplication(): pc.Application;
    }

    function createLines(device: pc.GraphicsDevice, positions: number[]): pc.Mesh;
    function createCircle(device: pc.GraphicsDevice, radius?: number, segments?: number): pc.Mesh;
}
