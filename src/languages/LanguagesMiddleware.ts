import { TRoute } from "../api/RouterInstance";
const componentName = "languagesMiddleware";
const debug = require("debug")(`front:${componentName}`);

export const languagesMiddleware = (
  pRoutes: TRoute[],
  pCurrentRoute: TRoute,
  pLanguage
) => {
  // ajouter le param lang
  const routesWithLang = pRoutes.map((route: TRoute) => {
    // TODO check
    const addLanguageParamInUrl = true;
    // this.showDefaultLanguageInUrl && !this.currentLangageIsDefaultLanguage();
    if (addLanguageParamInUrl) {
    }

    return {
      ...route,
      // add path after lang param only if is not "/"
      path: `/:lang${route.path !== "/" ? route.path : ""}`,
    };
  });
  debug("routesWithLang", routesWithLang);
  return routesWithLang;

  // retourne un tableau de routes
};
