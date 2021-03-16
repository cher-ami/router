import { ROUTERS } from "../api/routers";
import { buildUrl, joinPaths, removeLastCaracterFromString } from "../api/helpers";
import { useRootRouter } from "../hooks/useRouter";
const debug = require("debug")(`router:LanguagesService`);

export type TLanguage = {
  key: string;
  name?: string;
  default?: boolean;
};

class LanguagesService {
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
   * @param showDefaultLanguageIsUrl
   * @param base
   */
  public init(languages: TLanguage[], showDefaultLanguageIsUrl = true, base = "/"): void {
    if (languages?.length === 0) {
      throw new Error("ERROR, no language is set.");
    }
    this.languages = languages;
    this.base = base;
    this.defaultLanguage = this.selectDefaultLanguage(languages);
    this.previousLanguage = this.currentLanguage;
    this.currentLanguage = this.getLanguageFromUrl();
    this.showDefaultLanguageInUrl = showDefaultLanguageIsUrl;
    this.isInit = true;

    debug("this.currentLanguage", this.currentLanguage);
    debug("this.currentLangageIsDefaultLanguage()", this.isDefaultLanguageKey());
  }

  /**
   * set current language object
   * Push new URL in history
   * @param toLang
   */
  public setLanguage(toLang: TLanguage): void {
    if (toLang.key === this.currentLanguage.key) {
      debug("setLanguage > This is the same language, return.", {
        "toLang.key": toLang.key,
        "this.currentLanguage.key": this.currentLanguage.key,
      });
      return;
    }
    if (!this.langIsAvailable(toLang)) {
      debug(`lang ${toLang.key} is not available in languages list, return`);
      return;
    }
    if (!useRootRouter()) {
      debug(
        "setLanguage > useRootRouter() is not available before his initialisation, return"
      );
      return;
    }

    const rootRouter = useRootRouter();
    const base = rootRouter.base;
    const currentRoute = rootRouter.currentRoute;
    // need the last instance fullPath in case of sub router
    const fullPath =
      ROUTERS.instances?.[ROUTERS.instances?.length - 1].currentRoute.fullPath;

    // if default language should be visible in URL
    // use history push
    if (this.showDefaultLanguageInUrl) {
      debug(
        "setLanguage > default language should be always visible in URL, show /:lang"
      );
      const newUrl = buildUrl(fullPath, {
        ...currentRoute.props?.params,
        lang: toLang.key,
      });
      ROUTERS.history.push(newUrl);

      // if other, case default language need to be hidden from URL
      // process window open on the current URL without language
    } else {
      let newPath: string;
      debug("show default lang in URL is FALSE", { fullPath });

      if (this.isDefaultLanguageKey(toLang.key)) {
        debug("setLanguage > go to default lang, HIDDEN :lang from URL");
        newPath = fullPath.split("/:lang").join("");
      } else if (this.isDefaultLanguageKey(this.currentLanguage.key)) {
        debug("setLanguage > we are on default lang, add /:lang param after base");
        if (base === "/") {
          newPath = joinPaths(["/:lang", fullPath]);
        } else {
          const pathWithoutBase = fullPath.split(base).join("");
          newPath = joinPaths([base, "/:lang", pathWithoutBase]);
        }
      } else {
        debug("setLanguage > switch to another lang, keep /:lang param");
        newPath = fullPath;
      }

      const newUrl = buildUrl(newPath, {
        ...currentRoute.props?.params,
        lang: toLang.key,
      });

      debug("setLanguage > infos", { newPath, newUrl });
      // reload application
      window.open(newUrl, "_self");
    }

    // register currentLangage
    this.currentLanguage = toLang;
  }

  /**
   * Current lang is default lang
   */
  public isDefaultLanguageKey(langKey = this.currentLanguage.key): boolean {
    return langKey === this.defaultLanguage.key;
  }

  /**
   * Determine when we need to show current lang in URL
   */
  public showLangInUrl(): boolean {
    if (this.showDefaultLanguageInUrl) {
      return this.isInit;
    } else {
      return this.isInit && !this.isDefaultLanguageKey();
    }
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
    const currentLanguageObj = this.languages.find((language) => {
      // TODO match pas assez précis
      return pathname.startsWith(joinPaths([`${this.base}/${language.key}`]));
    });
    debug("getLanguageFromUrl > currentLanguageObj", currentLanguageObj);
    return currentLanguageObj || this.defaultLanguage;
  }

  /**
   * Check if language is available in language list
   * @protected
   */
  protected langIsAvailable(langObject: TLanguage, languesList = this.languages) {
    return languesList.some((lang) => lang.key === langObject.key);
  }
}

export default new LanguagesService();
