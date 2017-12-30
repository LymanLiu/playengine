export interface ScriptType {
    name: string;
    initialize?: () => void;
    update?: (dt : number) => void;
    swap?: () => void;
}

export function script(ScriptConstructor : new () => T) {
    return function (app : any) {
        let scriptInstance = new ScriptConstructor();
        let script = pc.createScript(scriptInstance.name, app);

        for (let prop in scriptInstance) {
            if (prop === 'name' || prop === 'attributes') continue;

            script.prototype[prop] = scriptInstance[prop];
        }

        for (let staticProp in ScriptConstructor) {
            if (staticProp === 'extendsFrom') continue;

            script[staticProp] = ScriptConstructor[staticProp];
        }

        return scriptInstance;
    }
}
