import { LangService, TRoute } from "..";
import { joinPaths } from "../api/helpers";
import { selectLangPathByLang } from "./langHelpers";
const debug = require("debug")("router:LanguagesMiddleware");

/**
 * LanguagesMiddleware
 * Patch all routes with ":lang" param
 * @param pRoutes
 * @param enable
 */
export const langMiddleware = (
  pRoutes: TRoute[],
  enable = LangService.showLangInUrl()
): TRoute[] => {
  if (!enable) return pRoutes;

  debug("langMiddleware: current lang", LangService.currentLang);
  return pRoutes.map((route: TRoute) => {
    const path = selectLangPathByLang(route);
    return {
      ...route,
      path: joinPaths(["/:lang", path !== "/" ? path : ""]),
    };
  });
};
