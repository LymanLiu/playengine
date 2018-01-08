import typescript from 'rollup-plugin-typescript';
import json from 'rollup-plugin-json';

export default {
    input: 'src/index.ts',
    output: [
        { file: 'dist/playengine.js', format: 'cjs' },
        { file: 'dist/playengine.umd.js', format: 'umd', name: 'pe' },
    ],
    plugins: [
        typescript({
            typescript: require('typescript')
        }),
        json()
    ]
}
