import { Application } from "./application";

export default class Selection {
    private app: Application;
    private _items: any;

    constructor(app: Application) {
        this.app = app;
        this._items = {};
    }

    public get(uid: string) {
        return this._items[uid];
    }

    public add(item: any) {
        let uid = item.entity.getGuid();
        if (!this.get(uid)) {
            this._items[uid] = item;
            this.app.$.fire("app:selection:add", uid);
            this.app.$.fire(`app:selection:add:${uid}`, item);
        }
    }

    public remove(uid: string) {
        if (!this.get(uid)) {
            return;
        }

        delete this._items[uid];
        this.app.$.fire("app:selection:remove", uid);
        this.app.$.fire(`app:selection:remove:${uid}`, this.get(uid));
    }

    public clear() {
        for (let uid in this._items) {
            if (this._items.hasOwnProperty(uid)) {
                this.remove(uid);
            }
        }

        this.app.$.fire("app:selection:clear");
    }
}
