import { ROUTERS } from "../api/routers";
import { buildUrl, extractPathFromBase, joinPaths } from "../api/helpers";
import { useRootRouter } from "../hooks/useRouter";
const debug = require("debug")(`router:LanguagesService`);

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
   */
  public setLang(toLang: TLanguage): void {
    if (!this.isInit) {
      console.warn("LangService is not init, exit.");
      return;
    }

    if (toLang.key === this.currentLanguage.key) {
      debug("setLanguage > This is the same language, exit.");
      return;
    }
    if (!this.langIsAvailable(toLang)) {
      debug(`lang ${toLang.key} is not available in languages list, exit.`);
      return;
    }
    // prettier-ignore
    if (!useRootRouter()) {
      debug("setLanguage > useRootRouter() is not available before his initialisation, exit.");
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

      window.open(newUrl, "_self");

      // if other, case default language need to be hidden from URL
      // process window open on the current URL without language
    } else {
      let newPath: string;
      debug("show default lang in URL is FALSE", { fullPath });

      if (this.isDefaultLangKey(toLang.key)) {
        debug("setLanguage > go to default lang, HIDDEN :lang from URL");
        newPath = fullPath.split("/:lang").join("");
      } else if (this.isDefaultLangKey(this.currentLanguage.key)) {
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
   * On first load
   * redirect to default language if no language is set
   *
   * FIXME si l'URL possède la base mais n'a pas de local, on redirige vers /base/local par default
   * FIXME par contre, si on a /base/{bad-lang}/path -> 404
   *
   */
  public redirect(forcePageReload: boolean = true) {
    if (!this.isInit) {
      console.warn("LangService is not init, exit.");
      return;
    }

    const langFromUrl = this.getLangFromUrl();
    const langIsValid = this.langIsAvailable(langFromUrl);
    const currentRoute = ROUTERS.instances?.[ROUTERS.instances?.length - 1].currentRoute;
    debug("redirect vars", { langFromUrl, langIsValid, currentRoute });

    // If all URLs have a lang param or language is valid, do not redirect
    if (!this.showDefaultLanguageInUrl || langIsValid) return;

    // prepare path if currentRoute doesn't exist
    const path = joinPaths([this.base, "/:lang"]);

    // build new URL
    let newUrl = buildUrl(currentRoute?.fullPath || path, {
      ...(currentRoute?.props?.params || {}),
      lang: this.defaultLanguage.key,
    });

    forcePageReload ? window.open(newUrl, "_self") : ROUTERS.history.push(newUrl);
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
}

export default new LangService();
