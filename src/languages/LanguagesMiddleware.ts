import { TRoute } from "../api/RouterInstance";
const debug = require("debug")(`router:languagesMiddleware`);

/**
 * LanguagesMiddleware
 * Patch all routes with ":lang" param
 * @param pRoutes
 */
export const languagesMiddleware = (pRoutes: TRoute[]): TRoute[] => {
  return pRoutes.map((route: TRoute) => ({
    ...route,
    path: `/:lang${route.path !== "/" ? route.path : ""}`,
  }));
};
