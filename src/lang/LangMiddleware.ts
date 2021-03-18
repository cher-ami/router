import { TRoute } from "../api/RouterInstance";
import { joinPaths } from "../api/helpers";
import LanguagesService from "./LangService";
const debug = require("debug")(`router:languagesMiddleware`);

/**
 * LanguagesMiddleware
 * Patch all routes with ":lang" param
 * @param pRoutes
 * @param enable
 */
export const langMiddleware = (
  pRoutes: TRoute[],
  enable = LanguagesService.showLangInUrl()
): TRoute[] => {
  if (!enable) return pRoutes;
  return pRoutes.map((route: TRoute) => ({
    ...route,
    path: joinPaths(["/:lang", route.path !== "/" ? route.path : ""]),
  }));
};
