import typescript from 'rollup-plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import inject from 'rollup-plugin-inject';
import serve from 'rollup-plugin-serve';
import json from 'rollup-plugin-json';

const builds = {
    cjs: {
        output: {
            file: 'dist/playengine.js',
            format: 'cjs'
        }
    },
    umd: {
        output: {
            file: 'dist/playengine.umd.js',
            format: 'umd',
            name: 'pe',
            globals: {
                '@scarletsky/playcanvas': 'pc'
            }
        },
        external: [
            '@scarletsky/playcanvas'
        ],
        plugins: [
            inject({
                pc: '@scarletsky/playcanvas'
            }),
            resolve(),
            commonjs()
        ]
    }
};

function genConfig(name) {
    const opts = name === 'dev' ? builds.umd : builds[name];
    const config = {
        input: 'src/index.ts',
        output: opts.output,
        external: opts.external,
        plugins: [
            typescript({
                typescript: require('typescript')
            }),
            json()
        ].concat(opts.plugins || [])
    };

    if (name === 'dev') {
        config.output.file = 'examples/dist/playengine.umd.js';
        config.plugins.push(serve({
            contentBase: 'examples/',
            port: 3333
        }));
    }

    return config;
}

export default genConfig(process.env.TARGET);
