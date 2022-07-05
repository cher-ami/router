import fs from "fs-extra";
import path from "path";
import { routes } from "./src/routes";

const { render } = require("../server/index-server.js");
const { log } = console;

export const prerender = async (request, response) => {
  const layout = fs.readFileSync("./dist/static/index.html", { encoding: "utf8" });

  // pre-render each route...
  for (const route of routes) {
    // prepare complete route path
    const preparedRoute = [
      // base
      import.meta.env.VITE_APP_BASE || "/",

      // path
      route.path === "/" ? "/index" : route.path,
    ]
      .join("")
      // remove multi slashes
      .replace(/(https?:\/\/)|(\/)+/g, "$1$2");

    // get react app HTML render to string
    const { renderToString, ssrStaticProps } = await render(preparedRoute);

    // include it in the template
    const template = layout
      .replace(`<!--app-html-->`, renderToString)
      .replace(`"<!--ssr-static-props-->"`, JSON.stringify(ssrStaticProps));

    // prepare sub folder templates if exist
    const routePath = path.resolve(`dist/static${preparedRoute}`);
    const dirs = path.dirname(routePath);
    if (!fs.existsSync(dirs)) {
      fs.mkdirSync(dirs, { recursive: true });
    }

    // add .html to the end of th pat
    const htmlFilePath = `${routePath}.html`;

    // write file on the server
    fs.writeFileSync(htmlFilePath, template);
    console.log(` → ${htmlFilePath.split("static")[1]}`);
  }

  response?.send("pages are generated!");
};
