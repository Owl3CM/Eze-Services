import babel from "@rollup/plugin-babel";
import typescript from "rollup-plugin-typescript2";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import postcss from "rollup-plugin-postcss";
import { terser } from "rollup-plugin-terser";

const config = {
  input: "lib/index.ts",
  plugins: [
    peerDepsExternal(),
    resolve(),
    commonjs({
      include: "node_modules/**",
    }),
    typescript(),
    postcss({
      plugins: [],
      minimize: true,
    }),
    terser(),
    babel({
      babelHelpers: "bundled",
      presets: ["@babel/preset-react"],
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      exclude: "node_modules/**",
    }),
  ],
  output: {
    file: "dist/index.js",
    format: "cjs",
    sourcemap: true,
  },
};

export default config;
