interface EventCallback {
    callback: (...args: any[]) => void;
    scope: any;
    priority: number;
}

export default function enhance() {

    function compare(a: EventCallback, b: EventCallback) {
        return b.priority - a.priority;
    }

    pc.events.on = function(
        name: string,
        callback: (...args: any[]) => void,
        scope?: any,
        priority?: number
    ) {
        if (!name || typeof (name) !== "string" || !callback) {
            return this;
        }

        if (!this._callbacks) {
            this._callbacks = {};
        }

        if (!this._callbacks[name]) {
            this._callbacks[name] = [];
        }

        if (!this._callbackActive) {
            this._callbackActive = {};
        }

        if (this._callbackActive[name] && this._callbackActive[name] === this._callbacks[name]) {
            this._callbackActive[name] = this._callbackActive[name].slice();
        }

        this._callbacks[name].push({
            callback,
            scope: scope || this,
            priority: priority || 0
        });

        this._callbacks[name].sort(compare);

        return this;
    };

    pc.events.once = function(
        name: string,
        callback: any,
        scope?: any,
        priority?: number
    ) {
        callback.once = true;
        this.on(name, callback, scope, priority);
        return this;
    };
}
