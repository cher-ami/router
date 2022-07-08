import { resolve } from "path"
import { defineConfig } from "vite"
import debug from "@wbe/debug"
import react from "@vitejs/plugin-react"
const log = debug("config:vite.config")

/**
 * Vite config
 * @doc https://vitejs.dev/config/
 */
export default defineConfig(({ command, mode }) => {
  return {
    server: {
      middlewareMode: "ssr",
    },

    build: {
      assetsDir: "./",
      write: true,
      outDir: resolve("dist"),
      emptyOutDir: true,
      manifest: true,
      assetsInlineLimit: 0,
      rollupOptions: {
        // output: {
        //"index.html": "index-template.html",
        // entryFileNames: `[name].js`,
        // chunkFileNames: `[name].js`,
        // assetFileNames: `[name].[ext]`,
        // },
      },
    },

    plugins: [react()]
  }
})
