import { resolve } from "path"
import { defineConfig } from "vite"
import debug from "@wbe/debug"
const log = debug("config:vite.config")

export default defineConfig(({ command, mode }) => {
  return {
    base: "/",
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
          resolve("server.js"),
          resolve("prerender/prerender.ts"),
          resolve("prerender/exe-prerender.ts"),
        ],
        output: {
          manualChunks: undefined,
          entryFileNames: `[name].js`,
          chunkFileNames: `[name].js`,
          assetFileNames: `[name].[ext]`,
        },

        external: ["react", "react-dom"],
      },
    },

    resolve: {
      alias: {
        "~": resolve(__dirname, "src"),
      },
    },
  }
})
