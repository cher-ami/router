import { LangService, TRoute } from "..";
import { ROUTERS } from "../api/routers";

const debug = require("debug")("router:langHelpers");

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
 *     path: { en: "/about", fr: "/a-propos", de: "uber", name: "about" },
 *
 * with "/about", we need "fr" path  "/a-propos"
 * selectLangPathByPath("/about", "fr", routes) // will return "/a-propos"
 *
 *
 * ex 2
 * Path can be an object with all available related lang path string too:
 *
 *  const pathsObj = path: { en: "/about", fr: "/a-propos", de: "uber", name: "about" };
 *  * selectLangPathByPath(pathsObj, "fr", routes) // will return "/a-propos"
 *
 * @param path: current path
 * @param lang: Lang key we want to get the alternate path
 * @param routes: Route liste
 */
export function getLangPathByPath(
  path: string | { [x: string]: string },
  lang = LangService.currentLang?.key,
  routes = ROUTERS?.routes
): string {
  if (!routes || !lang) return;

  // selected path depend of what we recieve
  const sPath = path?.[lang] || path;

  for (let i in routes) {
    const route = routes[i];

    // if route path is route.path, no alernate path, just return it.
    if (typeof route.path === "string") {
      if (sPath === route.path) {
        return route.path;
      }
    }
    // if route path is an object with different paths by lang
    else if (typeof route.path === "object") {
      const matchingPathLang = Object.keys(route.path as { [x: string]: string }).find(
        (langKey: string) => route.path?.[langKey] === sPath
      );
      if (!matchingPathLang) continue;
      return route.path?.[lang];
    }
  }
}
