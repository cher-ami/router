import { LangService, TRoute } from "..";
import { ROUTERS } from "../api/routers";
const debug = require("debug")("router:langHelpers");

/**
 * Select current lang path by Lang
 * @param route
 * @param lang
 */
export function selectLangPathByLang(
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
 * Select lang path by alternate path
 * @param path: current path
 * @param lang: Lang key we want to get the alternate path
 * @param routes: Route liste
 */
export function selectLangAlternatePathByPath(
  path: string,
  lang = LangService.currentLang?.key,
  routes = ROUTERS?.routes
): string {
  if (!routes || !lang) return;

  for (let i in routes) {
    const route = routes[i];
    // if route path is route.path, no alernate path, just return it.
    if (typeof route.path === "string") {
      if (path === route.path) return route.path;
    }

    // if route path is an object with different paths by lang
    else if (typeof route.path === "object") {
      Object.keys(route.path as { [x: string]: string }).forEach((langKey: string) => {
        if (route.path?.[langKey] === path) {
          debug("param path", path);
          debug("route.path?.[lang]", route.path?.[lang]);
          return route.path?.[lang];
        }
      });
    }
  }
}
