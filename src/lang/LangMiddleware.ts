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
   * Add :lang param on path
   * @param pPath
   * @param pShowLang
   */
  const patchLangParam = (pPath: string, pShowLang): string =>
    joinPaths([pShowLang && "/:lang", pPath !== "/" ? pPath : ""]);

  /**
   * Patch routes
   *  - Add "/:lang" param on each 1st level route
   *  - format path recurcively (on chidren if exist)
   * ex:
   *     {
   *      path: { en: "/home", fr: "/accueil" }
   *     },
   *
   *  return:
   *    {
   *      path: "/:lang/home",
   *      langPath: { en: "/:lang/home", fr: "/:lang/accueil" },
   *    }

   *
   */
  const patchRoutes = (pRoutes, children = false) => {
    return pRoutes.map((route: TRoute) => {
      const path = getLangPathByLang(route);
      const hasChildren = route.children?.length > 0;
      const showLang = !children && showLangInUrl;

      let langPath = {};
      typeof route.path === "object" &&
        Object.keys(route.path).forEach((lang) => {
          langPath[lang] = patchLangParam(route.path[lang], showLang);
        });

      return {
        ...route,
        path: patchLangParam(path, showLang),
        langPath: Object.entries(langPath).length !== 0 && langPath,
        ...(hasChildren ? { children: patchRoutes(route.children, true) } : {}),
      };
    });
  };

  return patchRoutes(routes);
};
