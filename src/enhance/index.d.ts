declare namespace pc {

    type EventListener = (...args: any[]) => void;

    /* tslint:disable-next-line */
    interface events {
        on(name: string, callback: pc.EventListener, scope?: any, priority?: number): void;
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
    }

    interface MeshInstance {
        intersectsRay(worldRay: pc.Ray, intersects?: MeshInstanceIntersection[]): MeshInstanceIntersection[];
    }
}
