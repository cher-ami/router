import { defineConfig } from "tsup"
import { spawn } from "child_process"

export default defineConfig({
  entry: { index: "src/index.ts" },
  splitting: false,
  clean: true,
  minify: true,
  dts: true,
  format: ["cjs", "esm"],
  name: "@cher-ami/router",
  external: ["@cher-ami/debug", "history", "path-to-regexp", "react", "react-dom"],
  sourcemap: true,
  async onSuccess() {
    const process = spawn("npx", ["size-limit"], { shell: true })
    process.stdout.on("data", (data) => console.log(data.toString()))
  },
})
