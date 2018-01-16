import typescript from 'rollup-plugin-typescript';
import serve from 'rollup-plugin-serve';
import json from 'rollup-plugin-json';

let extraPlugins = [];

if (process.env.NODE_ENV === 'development') {
    extraPlugins.push(
        serve({
            contentBase: 'examples/',
            port: 3333
        })
    );
}

export default {
    input: 'src/index.ts',
    output: [
        { file: 'dist/playengine.js', format: 'cjs' },
        { file: 'examples/dist/playengine.umd.js', format: 'umd', name: 'pe' },
    ],
    plugins: [
        typescript({
            typescript: require('typescript')
        }),
        json()
    ].concat(extraPlugins)
}
