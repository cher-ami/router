import { Routers } from "./Routers";
import {
  compileUrl,
  joinPaths,
  prepareFullUrl,
  removeLastCharFromString,
} from "./helpers";
import debug from "@wbe/debug";
import { TRoute } from "../components/Router";
import { getLangPathByLang } from "./helpers";

const log = debug(`router:LangService`);

export type TLanguage<T = any> = {
  key: T | string;
  name?: string;
  default?: boolean;
};

class LangService<TLang = any> {
  /**
   * Check if singleton is init
   */
  public isInit: boolean = false;

  /**
   * contains available languages
   */
  public languages: TLanguage<TLang>[];

  /**
   * Current language object
   */
  public currentLang: TLanguage<TLang>;

  /**
   * Default language object
   */
  public defaultLang: TLanguage<TLang>;

  /**
   * Show default language in URL
   */
  public showDefaultLangInUrl: boolean;

  /**
   * Base URL of the app
   */
  public base: string;

  /**
   * Init languages service
   * @param languages
   * @param showDefaultLangInUrl
   * @param base
   */
  public constructor({
    languages,
    showDefaultLangInUrl = true,
    base = "/",
  }: {
    languages: TLanguage<TLang>[];
    showDefaultLangInUrl?: boolean;
    base?: string;
  }) {
    if (languages?.length === 0) {
      throw new Error("ERROR, no language is set.");
    }
    this.languages = languages;
    // remove extract / at the end, if exist
    this.base = removeLastCharFromString(base, "/", true);
    this.defaultLang = this.getDefaultLang(languages);
    this.currentLang = this.getLangFromUrl() || this.defaultLang;
    this.showDefaultLangInUrl = showDefaultLangInUrl;
    this.isInit = true;
  }

  /**
   * Set new lang to URL
   * Use fullUrl of last router instance (and not path), to manage lang as needed
   *
   *    ex:
   *      -> /base/lang/path     (with lang)
   *      -> /base/new-lang/path (with new lang)
   *      -> /base/path          (without lang)
   *
   *
   * Push new URL in history
   * @param toLang
   * @param forcePageReload
   */
  public setLang(toLang: TLanguage<TLang>, forcePageReload = true): void {
    if (!this.isInit) {
      console.warn("setLang: LangService is not init, exit.");
      return;
    }
    if (toLang.key === this.currentLang.key) {
      log("setLang: This is the same language, exit.");
      return;
    }
    if (!this.langIsAvailable(toLang)) {
      log(`setLang: lang ${toLang.key} is not available in languages list, exit.`);
      return;
    }

    // get fullUrl property from the last router url ex: /base/lang/first-level/second-level
    const preparedNewUrl = prepareFullUrl(toLang);
    // create newUrl variable to set in each condition
    let newUrl: string;
    // choose force page reload in condition below
    let chooseForcePageReload = forcePageReload;

    // 1. if default language should be always visible in URL
    if (this.showDefaultLangInUrl) {
      newUrl = preparedNewUrl;
    }

    // 2. if toLang is default lang, need to hidden lang from URL
    else if (this.isDefaultLangKey(toLang.key)) {
      const urlPartToRemove = `${this.base}/${toLang.key}`;
      const newUrlWithoutBaseAndLang = preparedNewUrl.substr(
        urlPartToRemove.length,
        preparedNewUrl.length
      );
      newUrl = joinPaths([this.base, newUrlWithoutBaseAndLang]);
      chooseForcePageReload = true;
    }

    // 3. if curent lang is default lang, add /currentLang.key after base
    else if (this.isDefaultLangKey(this.currentLang.key)) {
      const newUrlWithoutBase = preparedNewUrl.substr(
        this.base.length,
        preparedNewUrl.length
      );
      newUrl = joinPaths([this.base, "/", toLang.key as string, "/", newUrlWithoutBase]);
    }

    // 4. other cases
    else {
      newUrl = preparedNewUrl;
    }

    if (!newUrl) {
      log("newUrl is no set, do not reload or refresh, return.", newUrl);
      return;
    }
    // register current langage (not usefull if we reload the app.)
    this.currentLang = toLang;
    // remove last / if exist and if he is not alone
    newUrl = removeLastCharFromString(newUrl, "/", true);
    // reload or refresh with new URL
    this.reloadOrRefresh(newUrl, chooseForcePageReload);
  }

  /**
   * Redirect to default language if no language is set
   * @param forcePageReload
   */
  public redirect(forcePageReload: boolean = true): void {
    if (!this.isInit) {
      console.warn("redirect: LangService is not init, exit.");
      return;
    }
    if (!this.showDefaultLangInUrl) {
      log("redirect: URLs have a lang param or language is valid, don't redirect.");
      return;
    }
    if (this.langIsAvailable(this.getLangFromUrl())) {
      log("redirect: lang from URL is valid, don't redirect");
      return;
    }

    if (
      location.pathname === this.base ||
      removeLastCharFromString(location.pathname, "/", true) === this.base
    ) {
      // prepare path
      const path = joinPaths([this.base, "/:lang"]);

      // build new URL
      let newUrl = compileUrl(path, { lang: this.defaultLang.key });

      log("redirect: to >", { newUrl });
      // reload or refresh all application
      this.reloadOrRefresh(newUrl, forcePageReload);
    }
  }

  /**
   * Current lang is default lang
   */
  public isDefaultLangKey(langKey = this.currentLang.key): boolean {
    return langKey === this.defaultLang.key;
  }

  /**
   * Determine when we need to show current lang in URL
   */
  public showLangInUrl(): boolean {
    if (this.showDefaultLangInUrl) {
      return this.isInit;
    } else {
      return this.isInit && !this.isDefaultLangKey();
    }
  }

  /**
   * Add Langs to Routes
   * Patch all first level routes with ":lang" param
   * {
   *    path: "/foo",
   * }
   * become
   *
   * * {
   *    path: "/:lang/foo",
   * }
   * @param routes
   * @param showLangInUrl
   */
  public addLangParamToRoutes(
    routes: TRoute[],
    showLangInUrl = this.showLangInUrl()
  ): TRoute[] {
    if (!this.isInit) return routes;

    /**
     * Add :lang param on path
     * @param pPath
     * @param pShowLang
     */
    const patchLangParam = (pPath: string, pShowLang): string =>
      removeLastCharFromString(
        joinPaths([pShowLang && "/:lang", pPath !== "/" ? pPath : "/"]),
        "/"
      );

    /**
   * Patch routes
   *  - Add "/:lang" param on each 1st level route
   *  - format path recurcively (on children if exist)
   * ex:
   *     {
   *      path: { en: "/home", fr: "/accueil" }
   *     },
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
          langPath: Object.entries(langPath).length !== 0 ? langPath : null,
          ...(hasChildren ? { children: patchRoutes(route.children, true) } : {}),
        };
      });
    };
    return patchRoutes(routes);
  }

  // --------------------------------------------------------------------------- LOCAL

  /**
   * Returns default language of the list
   * If no default language exist, it returns the first language object of the languages array
   * @param languages
   */
  protected getDefaultLang(languages: TLanguage<TLang>[]): TLanguage<TLang> {
    return languages.find((el) => el?.default) ?? languages[0];
  }

  /**
   * Get current language from URL
   * @param pathname
   */
  protected getLangFromUrl(pathname = window.location.pathname): TLanguage<TLang> {
    let pathnameWithoutBase = pathname.replace(this.base, "/");
    const firstPart = joinPaths([pathnameWithoutBase]).split("/")[1];

    return this.languages.find((language) => {
      return firstPart === language.key;
    });
  }

  /**
   * Check if language is available in language list
   * @protected
   */
  protected langIsAvailable(
    langObject: TLanguage<TLang>,
    languesList = this.languages
  ): boolean {
    return languesList.some((lang) => lang.key === langObject?.key);
  }

  /**
   * Reload full page or refresh with router push
   * @param newUrl
   * @param forcePageReload
   * @protected
   */
  protected reloadOrRefresh(newUrl: string, forcePageReload = true): void {
    forcePageReload ? window.open(newUrl, "_self") : Routers.history.push(newUrl);
  }
}

export default LangService;
