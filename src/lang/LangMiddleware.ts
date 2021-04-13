import { LangService, TRoute } from "..";
import { joinPaths } from "../api/helpers";
import { getLangPathByLang } from "./langHelpers";
const debug = require("debug")("router:LanguagesMiddleware");

/**
 * LanguagesMiddleware
 * Patch all routes with ":lang" param
 * @param routes
 * @param showLangInUrl
 */
export const langMiddleware = (
  routes: TRoute[],
  showLangInUrl = LangService.showLangInUrl()
): TRoute[] => {
  // return routes if langService is not init
  if (!LangService.isInit) return routes;

  /**
   *  - Add "/:lang" param on each 1st level route
   *  - format path recurcively (on chidren if exist)
   * ex:
   *   [
   *     { path: { en: "/", fr: "/" } },
   *     { path: { en: "/news", fr: "/actu" } }
   *   ]
   *
   *  return:
   *    { path: en: "/" },
   *    { path: en: "/news" },
   */

  const patchRoutes = (pRoutes, children = false) => {
    return pRoutes.map((route: TRoute) => {
      const path = getLangPathByLang(route);
      const hasChildren = route.children?.length > 0;
      const showLang = !children && showLangInUrl;
      return {
        ...route,
        path: joinPaths([showLang && "/:lang", path !== "/" ? path : ""]),
        ...(hasChildren ? { children: patchRoutes(route.children, true) } : {}),
      };
    });
  };

  return patchRoutes(routes);
};
