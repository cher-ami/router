import { resolve } from "path";
import { defineConfig } from "vite";
import debug from "@wbe/debug";
import react from "@vitejs/plugin-react";
const log = debug("config:vite.config");

/**
 * Vite config
 * @doc https://vitejs.dev/config/
 */
export default defineConfig(({ command, mode }) => {
  return {
    base: '/',
    build: {
      assetsDir: "./",
      write: true,
      outDir: resolve("dist"),
      emptyOutDir: true,
      manifest: true,
      assetsInlineLimit: 0,
      rollupOptions: {},
    },

    plugins: [react()],

    resolve: {
      extensions: [".mjs", ".js", ".ts", ".jsx", ".tsx", ".json", ".vue"],
      alias: {
        "~": resolve(__dirname, "src"),
      },
    },
  };
});
