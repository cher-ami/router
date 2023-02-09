import * as mfs from "../config/helpers/mfs.js"
import path from "path"
import { render } from "../src/index-server"
const { log } = console

export const prerender = async (urls: string[]) => {
  log("URLs to generate", urls)
  const indexTemplateSrc = "./dist/static/index-template.html"

  // copy index as template to avoid the override with the generated static index.html bellow
  if (!(await mfs.fileExists(indexTemplateSrc)))
    await mfs.copyFile("./dist/static/index.html", indexTemplateSrc)

  // now the layout is index-template.html
  const layout = await mfs.readFile(indexTemplateSrc)

  // pre-render each route...
  for (const url of urls) {
    let preparedUrl = url.startsWith("/") ? url : `/${url}`

    // get react app HTML render to string
    try {
      const { renderToString, ssrStaticProps, globalData, languages } =
        await render(preparedUrl)

      if (preparedUrl === "/") preparedUrl = "/index"

      if (languages && languages.some((e) => `/${e.key}` === preparedUrl)) {
        preparedUrl = `${preparedUrl}/index`
      }

      // include it in the template
      const template = layout
        ? layout
            .replace(`<!--app-html-->`, renderToString)
            .replace(`"<!--ssr-static-props-->"`, JSON.stringify(ssrStaticProps))
            .replace(`"<!--ssr-global-data-->"`, JSON.stringify(globalData))
        : ""

      // prepare sub folder templates if exist
      const routePath = path.resolve(`dist/static${preparedUrl}`)

      // add .html to the end of th pat
      const htmlFilePath = `${routePath}.html`

      // write file on the server
      await mfs.createFile(htmlFilePath, template)

      console.log(` → ${htmlFilePath.split("static")[1]}`)
    } catch (e) {
      console.log(e)
    }
  }
}
