import { LangService, TRoute } from "..";
import { ROUTERS } from "../api/routers";

const debug = require("debug")("router:langHelpers");

/**
 * Select current lang path by Lang
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
 * Select lang path by another lang path
 * ex:
 *     path: { en: "/about", fr: "/a-propos", de: "uber", name: "about" },
 *
 * with "/about", we need "fr" path  "/a-propos"
 * selectLangPathByPath("/about", "fr", routes) // will return "/a-propos"
 *
 * @param path: current path
 * @param lang: Lang key we want to get the alternate path
 * @param routes: Route liste
 */
export function selectLangPathByPath(
  path: string,
  lang = LangService.currentLang?.key,
  routes = ROUTERS?.routes
): string {
  if (!routes || !lang) return;

  for (let route of routes) {
    // if route path is route.path, no alernate path, just return it.
    if (typeof route.path === "string") {
      if (path === route.path) {
        return route.path;
      }
    }
    // if route path is an object with different paths by lang
    else if (typeof route.path === "object") {
      const matchingPathLang = Object.keys(route.path as { [x: string]: string }).find(
        (langKey: string) => route.path?.[langKey] === path
      );
      if (!matchingPathLang) continue;
      return route.path?.[lang];
    }
  }
}
