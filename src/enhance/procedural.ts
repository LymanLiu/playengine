export default function enhance() {
    pc.createLines = (device: pc.GraphicsDevice, positions: number[]) => {
        const numVerts = positions.length / 3;
        const vertexFormat = new pc.VertexFormat(device, [
            { semantic: pc.SEMANTIC_POSITION, components: 3, type: pc.TYPE_FLOAT32 }
        ]);
        const vertexBuffer = new pc.VertexBuffer(device, vertexFormat, numVerts);
        const vertexIterator = new pc.VertexIterator(vertexBuffer);

        for (let i = 0; i < numVerts; i++) {
            vertexIterator.element[pc.SEMANTIC_POSITION].set(
                positions[i * 3],
                positions[i * 3 + 1],
                positions[i * 3 + 2]
            );
            vertexIterator.next();
        }
        vertexIterator.end();

        const mesh = new pc.Mesh();
        mesh.primitive[0].type = pc.PRIMITIVE_LINES;
        mesh.primitive[0].base = 0;
        mesh.primitive[0].count = numVerts;
        mesh.primitive[0].indexed = false;
        mesh.vertexBuffer = vertexBuffer;
        return mesh;
    };

    pc.createCircle = (device: pc.GraphicsDevice, radius: number = 1, segments: number = 72) => {
        let positions: number[] = [];

        for (let i = 0; i < segments; i++) {
            let rad = 2 * Math.PI * (i / segments);
            let x = Math.cos(rad) * radius;
            let z = Math.sin(rad) * radius;
            positions.push(x, 0, z);
        }

        let mesh = pc.createLines(device, positions);
        mesh.primitive[0].type = pc.PRIMITIVE_LINELOOP;

        return mesh;
    };
}
