import { LangService, TRoute } from "..";
import { joinPaths } from "../api/helpers";
import { getLangPathByLang } from "./langHelpers";
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
  return pRoutes.map((route: TRoute) => {
    const path = getLangPathByLang(route);
    return {
      ...route,
      path: joinPaths(["/:lang", path !== "/" ? path : ""]),
    };
  });
};
