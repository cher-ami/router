import { TRoute } from "../api/RouterInstance";
import { joinPaths } from "../api/helpers";
import LanguagesService from "./LanguagesService";
const debug = require("debug")(`router:languagesMiddleware`);

/**
 * LanguagesMiddleware
 * Patch all routes with ":lang" param
 * @param pRoutes
 */
export const languagesMiddleware = (pRoutes: TRoute[]): TRoute[] => {
  if (
    !LanguagesService.showDefaultLanguageInUrl &&
    LanguagesService.currentLangageIsDefaultLanguage()
  ) {
    return pRoutes;
  }

  return pRoutes.map((route: TRoute) => ({
    ...route,
    path: joinPaths(["/:lang", route.path !== "/" ? route.path : ""]),
  }));
};
