import { LangService, TRoute } from "..";
import { Routers } from "../api/routers";
import { removeBaseToUrl, joinPaths } from "../api/helpers";
import debug from "@wbe/debug";
const logg = debug(`router:langHelpers`);

/**
 * Get current lang path by Lang
 *
 * ex:
 * const route = {
 *     component: ...,
 *     path: { en: "/about", fr: "/a-propos", de: "uber", name: "about" },
 * }
 *
 * selectLangPathByLang(route, "fr") // will return  "/a-propos"
 *
 * @param route
 * @param lang
 */
export function getLangPathByLang(
  route: TRoute,
  lang = LangService.currentLang?.key
): string {
  let selectedPath: string;
  if (typeof route.path === "string") {
    selectedPath = route.path;
  } else if (typeof route.path === "object") {
    Object.keys(route.path).find((el) => {
      if (el === lang) selectedPath = route.path?.[el];
    });
  }
  return selectedPath;
}

/**
 * Get lang path by another lang path
 * ex:
 *     path: { en: "/about", fr: "/a-propos", de: "uber" },
 *
 * with "/about", we need "fr" path  "/a-propos"
 * selectLangPathByPath("/about", "fr", routes) // will return "/a-propos"
 *
 *
 * ex 2
 * Path can be an object with all available related lang path string too:
 *
 *  const pathsObj = path: { en: "/about", fr: "/a-propos", de: "/uber" };
 *  So, with pathObj, we need fr path "/a-propos"
 *  * selectLangPathByPath(pathsObj, "fr", routes) // will return "/a-propos"
 *
 * @param path: current path string or object
 * @param base
 * @param lang: Lang key we want to get the alternate path
 * @param routes: Route liste
 */

type TGetLangPathByPath = {
  path: string | { [p: string]: string };
  base?: string;
  lang?: string | undefined;
  routes?: TRoute[] | undefined;
  basePath?: string;
  log?: boolean;
};

export function getLangPathByPath({
  path,
  base = null,
  lang = LangService.currentLang?.key || undefined,
  routes = Routers?.routes,
  basePath = null,
  log = false,
}: TGetLangPathByPath): string {
  if (!routes) {
    log && logg("No routes is set, return", { routes });
    return;
  }
  // store path
  const storePaths: string[] = [basePath];
  // inital path
  const initialPath = path?.[lang] || path;
  // quick fix in case base is a simple "/"
  if (base === "/") base = "";
  // path without base
  const pathWithoutBase = removeBaseToUrl(initialPath, base);

  for (let route of routes) {
    log && logg("> route", route);
    // get current routePath
    const routePath = route.path?.[lang] || route.path;

    // check if path without base match with one of path lang
    const pathWithoutBaseMatchWithOnePathLang =
      typeof route.path === "object" &&
      Object.keys(route.path).some((l) => route.path?.[l] === pathWithoutBase);

    // prettier-ignore
    log && logg({ "route.path": route.path, base, storePaths, routePath, pathWithoutBaseMatchWithOnePathLang, pathWithoutBase });

    if (routePath === pathWithoutBase || pathWithoutBaseMatchWithOnePathLang) {
      // pousser dans la tableau
      storePaths.push(routePath);
      log && logg("> FINAL return: ", joinPaths(storePaths));
      // retourner le path final
      return joinPaths(storePaths);
    }
    // si ca match pas mais qu'il y a des children
    else if (route.children?.length > 0) {
      log && logg("children > has children");

      // translate current base
      // prettier-ignore
      const translateBase = base ? getLangPathByPath({ path: base, lang, routes, log:false }) : base;
      log && logg("translateBase", translateBase);

      // prettier-ignore
      const match = getLangPathByPath({ path, base, lang, basePath: translateBase, routes: route.children });
      log && logg("match >", match);

      if (match) {
        // keep path in local array
        log && logg("children match, return it");
        // prettier-ignore
        return match
      }
    }
  }
}
