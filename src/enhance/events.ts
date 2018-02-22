interface EventCallback {
    callback: pc.EventListener;
    scope: any;
    priority: number;
}

export default function enhance() {

    function compare(a: EventCallback, b: EventCallback) {
        return b.priority - a.priority;
    }

    pc.events.on = function(
        name: string,
        callback: pc.EventListener,
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

    pc.events.fire2 = function(
        name: string,
        arg1?: any, arg2?: any, arg3?: any, arg4?: any, arg5?: any, arg6?: any, arg7?: any, arg8?: any
    ) {
        if (!name || !this._callbacks || !this._callbacks[name])
            return this;

        let callbacks;

        if (!this._callbackActive)
            this._callbackActive = {};

        if (!this._callbackActive[name]) {
            this._callbackActive[name] = this._callbacks[name];
        } else {
            if (this._callbackActive[name] === this._callbacks[name])
                this._callbackActive[name] = this._callbackActive[name].slice();

            callbacks = this._callbacks[name].slice();
        }

        for (
            let i = 0;
            (callbacks || this._callbackActive[name]) && (i < (callbacks || this._callbackActive[name]).length);
            i++
        ) {
            let evt = (callbacks || this._callbackActive[name])[i];
            evt.callback.call(evt.scope, arg1, arg2, arg3, arg4, arg5, arg6, arg7, arg8);

            if (evt.callback.once) {
                let ind = this._callbacks[name].indexOf(evt);
                if (ind !== -1) {
                    if (this._callbackActive[name] === this._callbacks[name])
                        this._callbackActive[name] = this._callbackActive[name].slice();

                    this._callbacks[name].splice(ind, 1);
                }
            }

            if (arg1._stopPropagation) break;
        }

        if (!callbacks)
            this._callbackActive[name] = null;

        return this;
    };

    pc.MouseEvent.prototype.stopPropagation = function() {
        this._stopPropagation = true;
    };
}
