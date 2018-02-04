export default function enhance() {

    pc.MeshInstance.prototype.intersectsRay = (() => {
        let localRay = new pc.Ray();
        let distance = new pc.Vec3();
        let aabb = new pc.BoundingBox();

        let points = [new pc.Vec3(), new pc.Vec3(), new pc.Vec3()];

        let edge1 = new pc.Vec3();
        let edge2 = new pc.Vec3();
        let normal = new pc.Vec3();

        let localTransform = new pc.Mat4();
        let worldTransform = new pc.Mat4();

        let localCoord = new pc.Vec3();
        let worldCoord = new pc.Vec3();

        function checkIntersection(
            meshInstance: pc.MeshInstance,
            i: number,
            worldRay: pc.Ray,
            a: pc.Vec3,
            b: pc.Vec3,
            c: pc.Vec3,
            point?: pc.Vec3
        ): pc.MeshInstanceIntersection {
            let backfaceCulling = (
                meshInstance.material.cull === pc.CULLFACE_BACK ||
                meshInstance.material.cull === pc.CULLFACE_FRONTANDBACK
            );

            let intersect;

            if (meshInstance.skinInstance) {
                intersect = worldRay.intersectTriangle(a, b, c, backfaceCulling, point);
            } else {
                intersect = localRay.intersectTriangle(a, b, c, backfaceCulling, point);
            }

            if (intersect === null) {
                return null;
            }

            edge1.sub2(b, a);
            edge2.sub2(c, a);
            normal.cross(edge1, edge2).normalize();

            localCoord.copy(intersect);
            worldCoord.copy(intersect);

            if (meshInstance.skinInstance) {
                localTransform.transformPoint(localCoord, localCoord);
            } else {
                worldTransform.transformPoint(worldCoord, worldCoord);
                worldTransform.transformPoint(a, a);
                worldTransform.transformPoint(b, b);
                worldTransform.transformPoint(c, c);
                worldTransform.transformVector(normal, normal);
            }

            distance.sub2(worldCoord, worldRay.origin);

            return {
                index: i,
                distance: distance.length(),
                point: worldCoord.clone(),
                localPoint: localCoord.clone(),
                normal: normal.clone(),
                vertices: [a.clone(), b.clone(), c.clone()],
                meshInstance
            };
        }

        return function intersectsRay(worldRay: pc.Ray, intersects?: pc.MeshInstanceIntersection[]) {
            aabb.copy(this.aabb);

            if (aabb.intersectsRay(worldRay) === false) {
                return null;
            }

            let vertexBuffer = this.mesh.vertexBuffer;
            let indexBuffer = this.mesh.indexBuffer[0];
            let base = this.mesh.primitive[0].base;
            let count = this.mesh.primitive[0].count;
            let dataF = new Float32Array(vertexBuffer.lock());
            let data8 = new Uint8Array(vertexBuffer.lock());
            let indices = indexBuffer.bytesPerIndex === 2
                ? new Uint16Array(indexBuffer.lock())
                : new Uint32Array(indexBuffer.lock());
            let elems = vertexBuffer.format.elements;
            let vertSize = vertexBuffer.format.size;
            let i;
            let j;
            let k;
            let index;

            let offsetP = 0;
            let offsetI = 0;
            let offsetW = 0;
            let intersect = null;

            for (i = 0; i < elems.length; i++) {
                if (elems[i].name === pc.SEMANTIC_POSITION) {
                    offsetP = elems[i].offset;
                } else if (elems[i].name === pc.SEMANTIC_BLENDINDICES) {
                    offsetI = elems[i].offset;
                } else if (elems[i].name === pc.SEMANTIC_BLENDWEIGHT) {
                    offsetW = elems[i].offset;
                }
            }

            let offsetPF = offsetP / 4;
            let offsetWF = offsetW / 4;
            let vertSizeF = vertSize / 4;

            intersects = (intersects === undefined) ? [] : intersects;

            localRay.origin.copy(worldRay.origin);
            localRay.direction.copy(worldRay.direction);

            worldTransform.copy(this.node.getWorldTransform());
            localTransform.copy(worldTransform).invert();

            localTransform.transformPoint(localRay.origin, localRay.origin);
            localTransform.transformVector(localRay.direction, localRay.direction);

            if (this.skinInstance) {
                let boneIndices = [0, 0, 0, 0];
                let boneWeights = [0, 0, 0, 0];
                let boneMatrices = this.skinInstance.matrices;
                let boneWeightVertices = [new pc.Vec3(), new pc.Vec3(), new pc.Vec3(), new pc.Vec3()];

                for (i = base; i < base + count; i += 3) {
                    for (j = 0; j < 3; j++) {

                        index = indices[i + j];

                        for (k = 0; k < 4; k++) {
                            boneIndices[k] = data8[index * vertSize + offsetI + k];
                            boneWeights[k] = dataF[index * vertSizeF + offsetPF + offsetWF + k];
                        }

                        index = index * vertSizeF + offsetPF;
                        points[j].set(dataF[index], dataF[index + 1], dataF[index + 2]);

                        for (k = 0; k < 4; k++) {
                            boneMatrices[boneIndices[k]].transformPoint(points[j], boneWeightVertices[k]);
                            boneWeightVertices[k].scale(boneWeights[k]);
                        }

                        points[j]
                            .copy(boneWeightVertices[0])
                            .add(boneWeightVertices[1])
                            .add(boneWeightVertices[2])
                            .add(boneWeightVertices[3]);
                    }

                    intersect = checkIntersection(this, i, worldRay, points[0], points[1], points[2]);

                    if (intersect) {
                        intersects.push(intersect);
                    }
                }

            } else {
                for (i = base; i < base + count; i += 3) {

                    for (j = 0; j < 3; j++) {
                        index = indices[i + j] * vertSizeF + offsetPF;
                        points[j].set(dataF[index], dataF[index + 1], dataF[index + 2]);
                    }

                    intersect = checkIntersection(this, i, worldRay, points[0], points[1], points[2]);

                    if (intersect) {
                        intersects.push(intersect);
                    }
                }
            }

            vertexBuffer.unlock();
            indexBuffer.unlock();

            return intersects.length > 0 ? intersects : null;
        };

    })();

}
