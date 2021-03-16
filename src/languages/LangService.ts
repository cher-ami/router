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
   * @param showDefaultLanguageIsUrl
   * @param base
   */
  public init(languages: TLanguage[], showDefaultLanguageIsUrl = true, base = "/"): void {
    if (languages?.length === 0) {
      throw new Error("ERROR, no language is set.");
    }
    this.languages = languages;
    this.base = base;
    this.defaultLanguage = this.getDefaultLang(languages);
    this.previousLanguage = this.currentLanguage;
    this.currentLanguage = this.getLangFromUrl() || this.defaultLanguage;
    this.showDefaultLanguageInUrl = showDefaultLanguageIsUrl;
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
      ROUTERS.history.push(newUrl);

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
   * On first load,
   * redirect to default language if no language is set
   *
   * case 1: language param is always visible in URL
   * case 2: language param is not visible in URL for default language
   */
  public redirect() {
    if (!this.isInit) {
      console.warn("LangService is not init, exit.");
      return;
    }

    const langFromUrl = this.getLangFromUrl();
    const langIsValid = this.langIsAvailable(langFromUrl);
    const currentRoute = ROUTERS.instances?.[ROUTERS.instances?.length - 1].currentRoute;
    debug("redirect vars", { langFromUrl, langIsValid, currentRoute });

    let newUrl: string;

    // If all URLs have a lang param
    if (this.showDefaultLanguageInUrl) {
      if (langIsValid) return;

      // prepare path if currentRoute doesn't exist
      const path = joinPaths([this.base, "/:lang"]);

      newUrl = buildUrl(currentRoute?.fullPath || path, {
        ...(currentRoute?.props?.params || {}),
        lang: this.defaultLanguage.key,
      });

      //ROUTERS.history.push(newUrl);
      window.open(newUrl, "_self");

      // FIXME donesn't work for now
      // If all URLs do not have a lang param (pas de langue pour la default lang)
    } else {
      // 1 la langue n'existe pas, et la route match on est sur la default lang, return
      // TODO pour savoir si c'est vraiment une langue après la base, ou le debut du path,
      // TODO on a besoin de transformer l'URL en path

      if (!langFromUrl) {
        debug("Lang doesnt exist, we are on default lang, return");
        return;
      }

      // 2 la langue existe mais n'est pas bonne -> go to default sans lang dans l'URL
      if (!langIsValid) {
        // debug("isValideLanguage", langIsValid);
        //
        // // la langue de l'URL n'est pas valide, reconstruire l'URL
        // if (!currentRoute?.fullPath) return;
        //
        // newUrl = buildUrl(currentRoute?.fullPath, {
        //   ...currentRoute.props?.params,
        //   lang: this.defaultLanguage.key,
        // });
        // debug("new", newUrl);
        // window.open(newUrl, "_self");
      }
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
}

export default new LangService();
