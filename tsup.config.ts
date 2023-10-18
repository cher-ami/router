import { defineConfig } from "tsup";
import { spawn } from "child_process";

export default defineConfig({
  entry: { index: "src/index.ts" },
  splitting: false,
  clean: true,
  minify: true,
  dts: true,
  format: ["cjs", "esm"],
  name: "interpol",
  external: ["@wbe/debug", "history", "path-to-regexp"],
  sourcemap: true,
  async onSuccess() {
    const process = spawn("npx", ["size-limit"], { shell: true });
    process.stdout.on("data", (data) => console.log(data.toString()));
  },
});