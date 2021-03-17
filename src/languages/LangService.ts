import { ROUTERS } from "../api/routers";
import {
  buildUrl,
  extractPathFromBase,
  joinPaths,
  removeLastCaracterFromString,
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
   * Previous language object
   */
  public previousLanguage: TLanguage;

  /**
   * Current language object
   */
  public currentLanguage: TLanguage;

  /**
   * Default language object
   */
  public defaultLanguage: TLanguage;

  /**
   * Show default language in URL
   */
  public showDefaultLanguageInUrl: boolean;

  /**
   * Base URL of the app
   */
  public base: string;

  /**
   * Init languages service
   * @param languages
   * @param showDefaultLanguageInUrl
   * @param base
   */
  public init(languages: TLanguage[], showDefaultLanguageInUrl = true, base = "/"): void {
    if (languages?.length === 0) {
      throw new Error("ERROR, no language is set.");
    }
    this.languages = languages;
    this.base = base;
    this.defaultLanguage = this.getDefaultLang(languages);
    this.previousLanguage = this.currentLanguage;
    this.currentLanguage = this.getLangFromUrl() || this.defaultLanguage;
    this.showDefaultLanguageInUrl = showDefaultLanguageInUrl;
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
    if (toLang.key === this.currentLanguage.key) {
      debug("setLang: This is the same language, exit.");
      return;
    }
    if (!this.langIsAvailable(toLang)) {
      debug(`setLang: lang ${toLang.key} is not available in languages list, exit.`);
      return;
    }
    // prettier-ignore
    if (!useRootRouter()) {
      debug("setLang: useRootRouter() is not available before his initialisation, exit.");
      return;
    }

    const rootRouter = useRootRouter();
    const currentRoute = rootRouter.currentRoute;
    const instances = ROUTERS.instances;
    const fullPath = instances?.[instances?.length - 1].currentRoute.fullPath;

    // if default language should be visible in URL, use history push
    if (this.showDefaultLanguageInUrl) {
      debug("setLang: default language should be always visible in URL, show /:lang");
      const newUrl = buildUrl(fullPath, {
        ...currentRoute.props?.params,
        lang: toLang.key,
      });

      // register current langage (not usefull if we reload the app...)
      this.currentLanguage = toLang;

      // reload application
      this.reloadOrRefresh(newUrl, forcePageReload);

      // stop process here
      return;
    }

    // if other, case default language need to be hidden from URL
    // process window open on the current URL without language
    let newPath: string;
    debug("setLang: show default lang in URL is false...");

    // if toLang is default lang
    if (this.isDefaultLangKey(toLang.key)) {
      debug("setLang: go to default lang, need to hidden lang from URL");
      newPath = fullPath.split("/:lang").join("");
      newPath = newPath === "" ? "/" : newPath;

      // if curent lang is default lang
    } else if (this.isDefaultLangKey(this.currentLanguage.key)) {
      debug("setLang: we are on default lang, add /:lang param after base");
      const path = extractPathFromBase(fullPath, this.base);
      newPath = joinPaths([this.base, "/:lang/", path]);

      // if we are on url with lang and switch to another lang visible in URL
    } else {
      debug("setLang: switch to another lang, keep /:lang param");
      newPath = fullPath;
    }

    // remove last "/" if exist
    if (newPath !== "/") newPath = removeLastCaracterFromString(newPath, "/");
    debug("setLang: newPath", { newPath });

    // build new URL
    const newUrl = buildUrl(newPath, {
      ...currentRoute.props?.params,
      lang: toLang.key,
    });

    debug("setLang: newUrl", { newUrl });

    // register current langage (not usefull if we reload the app...)
    this.currentLanguage = toLang;

    // reload application for regenerate route path with LangMiddleware
    this.reloadOrRefresh(newUrl, true);
  }

  /**
   * On first load
   * redirect to default language if no language is set
   * FIXME si l'URL possède la base mais n'a pas de local, on redirige vers /base/local par default
   * FIXME par contre, si on a /base/{bad-lang}/path on ne redirige pas -> 404
   *
   */
  public redirect(forcePageReload: boolean = true) {
    if (!this.isInit) {
      console.warn("redirect: LangService is not init, exit.");
      return;
    }
    if (!this.showDefaultLanguageInUrl) {
      debug("redirect: URLs have a lang param or language is valid, don't redirect.");
      return;
    }
    if (this.langIsAvailable(this.getLangFromUrl())) {
      debug("redirect: lang from URL is valid, don't redirect");
      return;
    }

    // prepare path for case who currentRoute doesn't exist
    const path = joinPaths([this.base, "/:lang"]);

    if (
      // FIXME peut rediriger  vers /base/ ou /base
      location.pathname === this.base
    ) {
      debug("redirect: currentRoute.path === this base");

      // build new URL
      let newUrl = buildUrl(path, { lang: this.defaultLanguage.key });

      debug("redirect: ", { newUrl });

      // reload or refresh all application
      this.reloadOrRefresh(newUrl, forcePageReload);
    }
  }

  /**
   * Current lang is default lang
   */
  public isDefaultLangKey(langKey = this.currentLanguage.key): boolean {
    return langKey === this.defaultLanguage.key;
  }

  /**
   * Determine when we need to show current lang in URL
   */
  public showLangInUrl(): boolean {
    if (this.showDefaultLanguageInUrl) {
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
    debug("this.base", this.base);

    // format and get only second part (lang)
    const firstPart = joinPaths([pathnameWithoutBase]).split("/")[1];

    const currentLanguageObj = this.languages.find((language) => {
      return firstPart === language.key;
    });

    debug("getLangFromUrl > currentLanguageObj", currentLanguageObj);
    return currentLanguageObj;
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
