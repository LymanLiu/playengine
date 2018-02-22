export default function enhance() {
    pc.Entity.prototype.getApplication = function() {
        return this._app;
    };
}
