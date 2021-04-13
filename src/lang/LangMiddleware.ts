import { LangService, TRoute } from "..";
import { joinPaths } from "../api/helpers";
import { getLangPathByLang } from "./langHelpers";
const debug = require("debug")("router:LanguagesMiddleware");

/**
 * LanguagesMiddleware
 * Patch all routes with ":lang" param
 * @param routes
 * @param enable
 */
export const langMiddleware = (
  routes: TRoute[],
  enable = LangService.showLangInUrl()
): TRoute[] => {
  if (!enable) return routes;

  /**
   * format path recurcively (on chidren if exist)
   * ex:
   *   [
   *     { path: { en: "/", fr: "/" } },
   *     { path: { en: "/news", fr: "/actu" } }
   *   ]
   *
   *   return:
   *
   *     { path: en: "/" },
   *     { path: en: "/news" },
   *
   *
   * @param routes
   */
  const recursiveFormatPath = (routes: TRoute[]) => {
    for (let route of routes) {
      if (route.path) route.path = getLangPathByLang(route);
      if (route.children?.length > 0) {
        recursiveFormatPath(route.children);
      }
    }
  };
  recursiveFormatPath(routes);

  /**
   * Add "/:lang" param on each 1st level route
   */
  const patchLangParam = (routes) =>
    routes.map((route: TRoute) => ({
      ...route,
      path: joinPaths(["/:lang", route.path !== "/" ? route.path : ""]),
    }));

  // return formated routes
  return patchLangParam(routes);
};
