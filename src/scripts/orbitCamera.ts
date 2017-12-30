import { ScriptType, script } from './script';

@script
export class OrbitCamera implements ScriptType {
    name = 'orbitCamera';

    static x = 1;

    initialize() {
        console.log();
    }

    update(dt) {

    }
}
