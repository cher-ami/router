import { TRoute } from "../api/RouterInstance";

export const languagesMiddleware = (
  pRoutes: TRoute[],
  pCurrentRoute: TRoute,
  pLanguage
) => {
  // ajouter le param lang
  const routesWithLang = pRoutes.map((route: TRoute) => {
    const addLanguageParamInUrl = true;
    // this.showDefaultLanguageInUrl && !this.currentLangageIsDefaultLanguage();

    if (addLanguageParamInUrl) {
      return `/:lang${route.path}`;
    }
  });
  //debug("routesWithLang", routesWithLang);
  return routesWithLang;

  // retourne un tableau de routes
};
