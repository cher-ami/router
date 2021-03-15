import { ROUTERS } from "../api/routers";
import { buildUrl, joinPaths } from "../api/helpers";
import { useRootRouter } from "../hooks/useRouter";
const debug = require("debug")(`router:LanguagesServices`);

export type TLanguage = {
  key: string;
  name?: string;
  default?: boolean;
};

class LanguagesService {
  /**
   * contains available languages
   */
  public languages: TLanguage[];

  /**
   * Previous language object
   */
  public previousLanguage: TLanguage;

  /**
   * Get current language object
   */
  protected _currentLanguage: TLanguage;
  public get currentLanguage(): TLanguage {
    return this._currentLanguage;
  }

  /**
   * Default language object
   */
  public defaultLanguage: TLanguage;

  /**
   * Show default language in URL
   */
  public showDefaultLanguageInUrl: boolean;

  /**
   * Init languages service
   * @param languages
   * @param showDefaultLanguageIsUrl
   */
  public init(languages: TLanguage[], showDefaultLanguageIsUrl: boolean = true): void {
    if (languages?.length === 0) {
      throw new Error("ERROR, no language is set.");
    }
    this.languages = languages;
    this.defaultLanguage = this.selectDefaultLanguage(languages);
    this.previousLanguage = this.currentLanguage;

    this._currentLanguage = this.showDefaultLanguageInUrl
      ? this.getLanguageFromUrl()
      : this.defaultLanguage;

    debug("this._currentLanguage", this._currentLanguage);

    this.showDefaultLanguageInUrl = showDefaultLanguageIsUrl;
  }

  /**
   * set current language object
   * Push new URL in history
   * @param pCurrentLanguage
   */
  public setLanguage(pCurrentLanguage: TLanguage): void {
    if (this.currentLanguage.key === pCurrentLanguage.key) return;
    this._currentLanguage = pCurrentLanguage;

    // get current route of first instance (language service performs only for root instance)
    const rootRouter = useRootRouter();
    const base = rootRouter.base;
    const currentRoute = rootRouter.currentRoute;
    const fullPath = rootRouter.currentRoute.fullPath;

    debug("fullPath", fullPath);

    // if  default language is visible in URL
    if (this.showDefaultLanguageInUrl) {
      // build new URL with param
      const newUrl = buildUrl(fullPath, {
        ...currentRoute.props?.params,
        lang: pCurrentLanguage.key,
      });

      // push in history
      ROUTERS.history.push(newUrl);

      // if default language need to be hidden from URL
      // process window open on the current URL without language
    } else {
      //
      let pathWithoutLangParam;

      pathWithoutLangParam = fullPath.split("/:lang").join("");
      const splitArray = fullPath.split(base);
      splitArray[0] = `/${pCurrentLanguage.key}`;
      splitArray.unshift(base);
      pathWithoutLangParam = splitArray.join("");

      window.open(pathWithoutLangParam, "_self");
    }
  }

  /**
   * Current lang is default lang
   */
  public currentLangageIsDefaultLanguage(): boolean {
    return this.currentLanguage.key === this.defaultLanguage.key;
  }

  public redirectToDefaultLanguageIfNoLanguageIsSet() {}

  // --------------------------------------------------------------------------- LOCAL

  /**
   * Returns default language of the list
   * If no default language exist, it returns the first language object of the languages array
   * @param languages
   */
  protected selectDefaultLanguage(languages: TLanguage[]): TLanguage {
    return languages.find((el) => el?.default) ?? languages[0];
  }

  /**
   * Get current language from URL
   * @param pathname
   */
  protected getLanguageFromUrl(pathname = window.location.pathname): TLanguage {
    const currentLanguageObj = this.languages.find((language) =>
      // TODO match pas assez précis
      pathname.startsWith(joinPaths([`${useRootRouter().base}/${language.key}`]))
    );
    debug("getLanguageFromUrl > currentLanguageObj", currentLanguageObj);
    return currentLanguageObj || this.defaultLanguage;
  }
}

export default new LanguagesService();
