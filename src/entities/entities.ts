import { Application } from "../application";
import { Entity } from "./entity";

interface EntityManagerItems {
    [uid: string]: Entity;
}

export type EntityFilter = (entity: Entity) => boolean;

export default class EntityManager {
    private app: Application;
    private _items: EntityManagerItems;

    constructor(app: Application) {
        this.app = app;
        this._items = {};

        this.app.$.on("app:entity:create", this.onEntityCreate, this);
        this.app.$.on("app:entity:destroy", this.onEntityDestroy, this);
    }

    public get(uid: string) {
        return this._items[uid];
    }

    public add(entity: Entity) {
        const uid = entity.entity.getGuid();

        if (!this.get(uid)) {
            this._items[uid] = entity;
        }

        return this;
    }

    public remove(uid: string) {
        if (this.get(uid)) {
            delete this._items[uid];
        }

        return this;
    }

    public list(filter?: EntityFilter) {
        let result = [];

        for (let uid in this._items) {
            if (filter) {
                if (filter(this._items[uid])) {
                    result.push(this._items[uid]);
                }
            } else {
                result.push(this._items[uid]);
            }
        }

        return result;
    }

    private onEntityCreate(entity: Entity) {
        this.add(entity);
    }

    private onEntityDestroy(uid: string) {
        this.remove(uid);
    }
}
