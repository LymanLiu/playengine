export default function enhance() {
    pc.Ray.prototype.intersectTriangle = (() => {
        let diff = new pc.Vec3();
        let edge1 = new pc.Vec3();
        let edge2 = new pc.Vec3();
        let normal = new pc.Vec3();

        return function intersectTriangle(
            a: pc.Vec3,
            b: pc.Vec3,
            c: pc.Vec3,
            backfaceCulling: boolean,
            res: pc.Vec3
        ): pc.Vec3 {
            res = (res === undefined) ? new pc.Vec3() : res;
            edge1.sub2(b, a);
            edge2.sub2(c, a);
            normal.cross(edge1, edge2);

            let DdN = this.direction.dot(normal);
            let sign;

            if (DdN > 0) {
                if (backfaceCulling) {
                    return null;
                }
                sign = 1;
            } else if (DdN < 0) {
                sign = -1;
                DdN = -DdN;
            } else {
                return null;
            }

            diff.sub2(this.origin, a);

            let DdQxE2 = sign * this.direction.dot(edge2.cross(diff, edge2));

            if (DdQxE2 < 0) {
                return null;
            }

            let DdE1xQ = sign * this.direction.dot(edge1.cross(edge1, diff));

            if (DdE1xQ < 0) {
                return null;
            }
            if (DdQxE2 + DdE1xQ > DdN) {
                return null;
            }

            let QdN = -sign * diff.dot(normal);

            if (QdN < 0) {
                return null;
            }

            return res.copy(this.direction).scale(QdN / DdN).add(this.origin);
        };
    })();
}
