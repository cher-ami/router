import { LangService, TRoute } from "..";
import { joinPaths } from "../api/helpers";
const debug = require("debug")(`router:languagesMiddleware`);

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
  return pRoutes.map((route: TRoute) => ({
    ...route,
    path: joinPaths(["/:lang", route.path !== "/" ? route.path : ""]),
  }));
};
