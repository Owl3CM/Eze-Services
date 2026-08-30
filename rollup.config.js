import babel from "@rollup/plugin-babel";
import typescript from "rollup-plugin-typescript2";
import peerDepsExternal from "rollup-plugin-peer-deps-external";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import postcss from "rollup-plugin-postcss";

const config = {
  input: "lib/index.ts",
  plugins: [
    peerDepsExternal(),
    resolve({
      extensions: [".mjs", ".js", ".json", ".node", ".ts", ".tsx"],
    }),
    commonjs({
      include: "node_modules/**",
    }),
    typescript({
      clean: true,
      include: ["**/*.ts", "**/*.tsx", "**/*.cts", "**/*.mts"],
    }),
    postcss({
      plugins: [],
      minimize: true,
    }),
    terser(),
    babel({
      babelHelpers: "bundled",
      presets: [["@babel/preset-react", { runtime: "automatic" }]],
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      exclude: "node_modules/**",
    }),
  ],
  output: [
    {
      file: "dist/index.js",
      format: "esm",
      sourcemap: true,
    },
    {
      file: "dist/index.cjs",
      format: "cjs",
      exports: "named",
      sourcemap: true,
    },
  ],
};

export default config;
