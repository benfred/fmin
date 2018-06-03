import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default [{
    input: 'index.js',
    output: {
        file: 'build/fmin.js',
        format: 'umd',
        name: 'fmin'
    }
}, {
    input: 'index_vis.js',
    output: {
        file: 'build/fmin_vis.js',
        format: 'umd',
        name: 'fmin_vis'
    },
    plugins: [
        resolve({
            jsnext: true,
            main: true
        }),
        commonjs()
    ]
}];