import { ROUTERS } from "../api/routers";
import {
  buildUrl,
  extractPathFromBase,
  joinPaths,
  removeLastCharFromString,
} from "../api/helpers";
import { useRootRouter } from "../hooks/useRouter";
const debug = require("debug")(`router:LangService`);

export type TLanguage = {
  key: string;
  name?: string;
  default?: boolean;
};

class LangService {
  /**
   * Check if singleton is init
   */
  public isInit: boolean = false;

  /**
   * contains available languages
   */
  public languages: TLanguage[];

  /**
   * Current language object
   */
  public currentLang: TLanguage;

  /**
   * Default language object
   */
  public defaultLang: TLanguage;

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
  public init(languages: TLanguage[], showDefaultLangInUrl = true, base = "/"): void {
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
   * set current language object
   * Push new URL in history
   * @param toLang
   * @param forcePageReload
   */
  public setLang(toLang: TLanguage, forcePageReload = true): void {
    if (!this.isInit) {
      console.warn("setLang: LangService is not init, exit.");
      return;
    }
    if (toLang.key === this.currentLang.key) {
      debug("setLang: This is the same language, exit.");
      return;
    }
    if (!this.langIsAvailable(toLang)) {
      debug(`setLang: lang ${toLang.key} is not available in languages list, exit.`);
      return;
    }
    if (!useRootRouter()) {
      debug("setLang: useRootRouter is not available before his initialisation, exit.");
      return;
    }

    const rootRouter = useRootRouter();
    const currentRoute = rootRouter.currentRoute;
    debug("ROUTERS.instances", ROUTERS.instances);
    const lastInstance = ROUTERS.instances?.[ROUTERS.instances?.length - 1];
    debug("ROUTERS.instances -1", lastInstance);
    let fullPath = lastInstance?.currentRoute?.fullPath || "/:lang";
    let path = lastInstance?.currentRoute?.path;

    // if default language should be visible in URL, use history push
    if (this.showDefaultLangInUrl) {
      // default language should be always visible in URL, set new /:lang
      fullPath = removeLastCharFromString(fullPath, "/", true);

      debug("fullPath", fullPath, currentRoute);
      // /master/:lang/blog/:id

      const getPathFromFullPath = fullPath.replace(`${currentRoute.base}/:lang`, "");
      debug("formatFullPath", getPathFromFullPath);

      // replace:  blog/:id ----> blog-fr/:id
      // get current path with current lang
      // replace by path[toLang.key]

      const newUrl = buildUrl(fullPath, {
        ...currentRoute?.props?.params,
        lang: toLang.key,
      });

      // register current langage (usefull only if we don't reload the app.)
      this.currentLang = toLang;

      return;
      // reload application
      this.reloadOrRefresh(newUrl, forcePageReload);
    }

    // if other, case default language need to be hidden from URL
    // process window open on the current URL without language
    let newPath: string;

    // if toLang is default lang, need to hidden lang from URL
    if (this.isDefaultLangKey(toLang.key)) {
      newPath = fullPath.split("/:lang").join("");
      newPath = newPath === "" ? "/" : newPath;

      // if curent lang is default lang, add /:lang param after base
    } else if (this.isDefaultLangKey(this.currentLang.key)) {
      const path = extractPathFromBase(fullPath, this.base);
      newPath = joinPaths([this.base, "/:lang/", path]);

      // if we are on url with lang and switch to another lang visible in URL
    } else {
      newPath = fullPath;
    }

    // remove last "/" if exist
    newPath = removeLastCharFromString(newPath, "/", true);
    debug("setLang: newPath", { newPath });

    // build new URL
    const newUrl = buildUrl(newPath, {
      ...currentRoute.props?.params,
      lang: toLang.key,
    });

    // register current langage (not usefull if we reload the app...)
    this.currentLang = toLang;

    // reload application for regenerate route path with LangMiddleware
    this.reloadOrRefresh(newUrl, true);
  }

  /**
   * Redirect to default language if no language is set
   */
  public redirect(forcePageReload: boolean = true): void {
    if (!this.isInit) {
      console.warn("redirect: LangService is not init, exit.");
      return;
    }
    if (!this.showDefaultLangInUrl) {
      debug("redirect: URLs have a lang param or language is valid, don't redirect.");
      return;
    }
    if (this.langIsAvailable(this.getLangFromUrl())) {
      debug("redirect: lang from URL is valid, don't redirect");
      return;
    }

    if (
      location.pathname === this.base ||
      removeLastCharFromString(location.pathname, "/", true) === this.base
    ) {
      // prepare path
      const path = joinPaths([this.base, "/:lang"]);

      // build new URL
      let newUrl = buildUrl(path, { lang: this.defaultLang.key });

      debug("redirect: to >", { newUrl });
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

  // --------------------------------------------------------------------------- LOCAL

  /**
   * Returns default language of the list
   * If no default language exist, it returns the first language object of the languages array
   * @param languages
   */
  protected getDefaultLang(languages: TLanguage[]): TLanguage {
    return languages.find((el) => el?.default) ?? languages[0];
  }

  /**
   * Get current language from URL
   * @param pathname
   */
  protected getLangFromUrl(pathname = window.location.pathname): TLanguage {
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
    langObject: TLanguage,
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
    forcePageReload ? window.open(newUrl, "_self") : ROUTERS.history.push(newUrl);
  }
}

export default new LangService();
