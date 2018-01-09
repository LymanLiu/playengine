import typescript from 'rollup-plugin-typescript';
import serve from 'rollup-plugin-serve';
import json from 'rollup-plugin-json';

export default {
    input: 'src/index.ts',
    output: [
        { file: 'dist/playengine.js', format: 'cjs' },
        { file: 'examples/dist/playengine.umd.js', format: 'umd', name: 'pe' },
    ],
    plugins: [
        serve({
            contentBase: 'examples/',
            port: 3333
        }),
        typescript({
            typescript: require('typescript')
        }),
        json()
    ]
}
