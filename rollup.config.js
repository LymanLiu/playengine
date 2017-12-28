import path from 'path';
import typescript from 'rollup-plugin-typescript';
import json from 'rollup-plugin-json';

export default {
    entry: path.resolve(__dirname, './src/Application.ts'),
    output: [
        { file: 'dist/playengine.js', format: 'cjs' },
        { file: 'dist/playengine.umd.js', format: 'umd', name: 'playengine' },
        { file: 'dist/playengine.es.js', format: 'es' }
    ],
    plugins: [
        typescript(),
        json()
    ]
}
