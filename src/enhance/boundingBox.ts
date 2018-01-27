export default function enhance() {
    pc.BoundingBox.prototype.toJSON = function() {
        return {
            center: Array.from(this.center.data),
            halfExtents: Array.from(this.halfExtents.data)
        };
    };
}
