import { resolve } from "path"
import { defineConfig } from "vite"
import debug from "@wbe/debug"
const log = debug("config:vite.config")

export default defineConfig(({ command, mode }) => {
  return {
    build: {
      assetsDir: "./",
      write: true,
      outDir: resolve("dist/_scripts"),
      emptyOutDir: true,
      manifest: false,
      assetsInlineLimit: 0,
      ssr: true,

      rollupOptions: {
        input: [
          resolve("prerender.ts"),
          resolve("server.js"),
          resolve("exe-server.js"),
        ],
        output: {
          manualChunks: undefined,
          entryFileNames: `[name].js`,
          chunkFileNames: `[name].js`,
          assetFileNames: `[name].[ext]`,
        },

      },
    },
  }
})
