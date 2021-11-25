import { ROUTERS } from "../api/routers";
import {
  buildUrl,
  joinPaths,
  prepareSetLocationFullUrl,
  removeLastCharFromString,
} from "../api/helpers";
import debug from "@wbe/debug";

const log = debug(`router:LangService`);

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
   * Set new lang to URL
   * Use fullUrl of last router instance (and not path), to manage lang as needed
   *
   *    ex:
   *      -> /base/lang/path     (without lang)
   *      -> /base/new-lang/path (with new lang)
   *      -> /base/path          (without lang)
   *
   *
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
      log("setLang: This is the same language, exit.");
      return;
    }
    if (!this.langIsAvailable(toLang)) {
      log(`setLang: lang ${toLang.key} is not available in languages list, exit.`);
      return;
    }

    // get fullUrl property from the last router instance ex: /base/lang/first-level/second-level
    const preparedNewUrl = prepareSetLocationFullUrl(toLang);
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
      newUrl = joinPaths([this.base, "/", toLang.key, "/", newUrlWithoutBase]);
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
      let newUrl = buildUrl(path, { lang: this.defaultLang.key });

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
