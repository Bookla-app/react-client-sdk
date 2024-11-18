import typescript from 'rollup-plugin-typescript2';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { readFileSync } from 'fs';

// Read package.json
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

export default {
    input: 'src/index.ts',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            sourcemap: true,
        },
        {
            file: pkg.module,
            format: 'esm',
            sourcemap: true,
        },
    ],
    external: [...Object.keys(pkg.peerDependencies || {}), ...Object.keys(pkg.dependencies || {})],
    plugins: [
        nodeResolve(),
        commonjs(),
        typescript({
            tsconfig: './tsconfig.json',
            useTsconfigDeclarationDir: true,
        }),
    ],
};