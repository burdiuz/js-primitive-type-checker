import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';

const DEST = 'dist';
const UMD_NAME = 'PrimitiveTypeChecker';
const FILE_NAME = 'primitive-type-checker';

const external = [
  '@actualwave/type-checker-levels-storage',
  '@actualwave/type-checker-simple-reporting',
];

const basePlugins = () => [
  resolve(),
  commonjs(),
  typescript({ declaration: false }),
];

export default [
  {
    input: 'src/index.ts',
    output: { file: `${DEST}/index.js`, format: 'cjs', sourcemap: true, exports: 'named' },
    external,
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        declarationDir: `${DEST}/types`,
        declaration: true,
      }),
      copy({
        targets: [
          { src: 'package.json', dest: DEST },
          { src: 'LICENSE', dest: DEST },
          { src: 'README.md', dest: DEST },
          { src: 'SKILL.md', dest: DEST },
        ],
      }),
    ],
  },
  {
    input: 'src/index.ts',
    output: {
      file: `${DEST}/${FILE_NAME}.js`,
      format: 'umd',
      name: UMD_NAME,
      sourcemap: true,
      exports: 'named',
    },
    plugins: basePlugins(),
  },
  {
    input: 'src/index.ts',
    output: {
      file: `${DEST}/${FILE_NAME}.min.js`,
      format: 'umd',
      name: UMD_NAME,
      sourcemap: true,
      exports: 'named',
    },
    plugins: [...basePlugins(), terser()],
  },
];
