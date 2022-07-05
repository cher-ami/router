const fs = require("fs-extra");
const { resolve } = require("path");
const express = require("express");
const { createServer: createViteServer } = require("vite");
const serveStatic = require("serve-static");
const compression = require("compression");
const { log } = console;

/**
 * Create development server
 */
// prettier-ignore
async function createDevServer()
{
  const app = express()

  // Create Vite server in middleware mode. This disables Vite's own HTML
  // serving logic and let the parent server take control.
  //
  // In middleware mode, if you want to use Vite's own HTML serving logic
  // use `'html'` as the `middlewareMode` (ref https://vitejs.dev/config/#server-middlewaremode)
  const vite = await createViteServer({
    logLevel: 'info',
    server: { middlewareMode: 'ssr' }
  })
  // use vite's connect instance as middleware
  app.use(vite.middlewares)

  app.use('*', async (req, res, next) => {
    const url = req.originalUrl
    if (url === "/favicon.ico") return

    try {
      // 1. Read index.html
      let template = fs.readFileSync( resolve('index.html'), 'utf-8')
      //console.log('template', template)

      // 2. Apply Vite HTML transforms. This injects the Vite HMR client, and
      //    also applies HTML transforms from Vite plugins, e.g. global preambles
      //    from @vitejs/plugin-react
      template = await vite.transformIndexHtml(url, template)

      // 3. Load the server entry. vite.ssrLoadModule automatically transforms
      //    your ESM source code to be usable in Node.js! There is no bundling
      //    required, and provides efficient invalidation similar to HMR.
      const { render } = await vite.ssrLoadModule('./src/index-server.tsx')

      // 4. render the app HTML. This assumes entry-server.js's exported `render`
      //    function calls appropriate framework SSR APIs,
      //    e.g. ReactDOMServer.renderToString()
      const {renderToString, ssrStaticProps } = await render(url)

      log({url, renderToString, ssrStaticProps})

      // 5. Inject the app-rendered HTML into the template.
      let html = template
      .replace(`<!--app-html-->`, renderToString)
      .replace(`"<!--ssr-static-props-->"`, JSON.stringify( ssrStaticProps ))

      // 6. Send the rendered HTML back.
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      // If an error is caught, let Vite fix the stracktrace so it maps back to
      // your actual source code.
      vite.ssrFixStacktrace(e)
      next(e)
    }
  })

  return { app, vite }
}

/**
 * Create production server
 */
// prettier-ignore
async function createProdServer()
{
  console.log("prod server")
  const app = express()

  const vite = await createViteServer({
    logLevel: 'info',
    server: { middlewareMode: 'ssr' }
  })

  app.use(compression())
  app.use(serveStatic(resolve("dist/client"), { index: false }))

  app.use("*", async (req, res) => {
    try {
      const url = req.originalUrl
      const template = fs.readFileSync(resolve("dist/client/index.html"), "utf-8")
      const {render} = require("./dist/server/index-server.js")
      const appHtml = render(url)
      const html = template.replace(`<!--app-html-->`, appHtml)
      res.status(200).set({ "Content-Type": "text/html" }).end(html)

    } catch (e) {
      console.log(e.stack)
      res.status(500).end(e.stack)
    }
  })

  return { app, vite }
}

/**
 * Let's go!
 */
const isProd = process.env.NODE_ENV === "production";

if (!isProd) {
  createDevServer().then(({ app }) =>
    app.listen(3000, () => {
      console.log("http://localhost:3000");
    })
  );
} else {
  createProdServer().then(({ app }) =>
    app.listen(3000, () => {
      console.log("http://localhost:3000");
    })
  );
}
