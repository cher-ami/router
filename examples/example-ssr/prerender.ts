import fs from "fs-extra";
import path from "path";
import { routes } from "./src/routes";


const { render } = require("../server/index-server.js");
const { log } = console;

const _generateHtmlFile = async (route, layout): Promise<void> => {
  // prepare complete route path
  let preparedRoute = [
    // base
    import.meta.env.VITE_APP_BASE || "/",

    // path
    route.path,
  ]
    .join("")
    // remove multi slashes
    .replace(/(https?:\/\/)|(\/)+/g, "$1$2");

  // get react app HTML render to string
  const { renderToString, ssrStaticProps, globalData } = await render(preparedRoute);

  if (preparedRoute === "/") preparedRoute = "/index";
  // include it in the template
  const template = layout
    .replace(`<!--app-html-->`, renderToString)
    .replace(`"<!--ssr-static-props-->"`, JSON.stringify(ssrStaticProps))
    .replace(`"<!--ssr-global-data-->"`, JSON.stringify(globalData));

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
};

/**
 * TODO
 * cas à traiter
 * - on a une liste de page venant du BO ou non
 * - on a un langservice ou non
 * - on a que la liste des routes
 *
 * @param request
 * @param response
 */
export const prerender = async (request, response) => {
  const pageList = await fetchPageList();

  const layout = fs.readFileSync("./dist/static/index.html", { encoding: "utf8" });

  // pre-render each route...
  for (const route of routes) {
    // /article/:slug

    for (const page of pageList) {
      // article/article-1
      // article/article-2
      // faire un match entre le path et l'URL

      // si la page (URL) courante est compatible avec le route, je la génère
      if (true) {
        _generateHtmlFile(route, layout);
      }
    }
  }

  response?.send("pages are generated!");
};
