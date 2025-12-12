import express from "express"
import portFinderSync from "portfinder-sync"
import { renderToPipeableStream } from "react-dom/server"
import { createServer } from "vite"

const port = portFinderSync.getPort(3000)

;(async () => {
  /**
   * Dev server
   *
   *
   */
  async function createDevServer() {
    const app = express()

    // dev script to inject
    const devScripts = {
      js: [{ tag: "script", attr: { type: "module", src: "/src/index.tsx" } }],
    }

    // Create Vite server in middleware mode.
    // This disables Vite's own HTML serving logic and let the parent server take control.
    // https://vitejs.dev/config/server-options.html#server-middlewaremode
    const vite = await createServer({
      logLevel: "info",
      server: {
        middlewareMode: true,
      },
      appType: "custom",
    })

    // use vite's connect instance as middleware
    app.use(vite.middlewares)
    app.use("*", async (req, res, next) => {
      if (req.originalUrl === "/favicon.ico") return

      try {
        // Transforms the ESM source code to be usable in Node.js
        const { render } = await vite.ssrLoadModule(`src/server/index-server.tsx`)

        // Get react-dom from the render method
        const dom = await render(req.originalUrl, devScripts, false)

        // Create stream to support Suspense API
        const stream = renderToPipeableStream(dom, {
          onShellReady() {
            // If the page is a 404 page, set the status code to 404
            if (dom?.props?.["data-is404"]) {
              res.statusCode = 404
            } else {
              res.statusCode = 200
            }
            res.setHeader("Content-type", "text/html")
            stream.pipe(res)
          },
          onError(e) {
            res.statusCode = 500
            console.error(e)
          },
        })
      } catch (e) {
        vite.ssrFixStacktrace(e)
        next(e)
      }
    })

    // return vite, app and server
    return { vite, app }
  }

  /**
   * Let's go!
   */
  createDevServer().then(({ app }) =>
    app.listen(port, () => {
      console.log(`http://localhost:${port}`)
    }),
  )
})()
