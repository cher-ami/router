import { ROUTERS } from "../api/routers";
import { buildUrl } from "../api/helpers";

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
   * Get previous language object
   */
  public previousLanguage: TLanguage;

  /**
   * Default language object
   */
  public defaultLanguage: TLanguage;

  /**
   * Get current language object
   */
  protected _currentLanguage: TLanguage;
  public get currentLanguage(): TLanguage {
    return this._currentLanguage;
  }

  /**
   * Set current language object
   * Push new URL in history
   * @param pCurrentLanguage
   */
  public set currenLanguage(pCurrentLanguage: TLanguage) {
    if (this.currentLanguage === pCurrentLanguage) return;
    this._currentLanguage = pCurrentLanguage;

    // get current route of first instance (language service performs only for root instance)
    const currentRoute = ROUTERS.instances?.[0].currentRoute;

    // prepare new URL with new lang param
    const newUrl = buildUrl(currentRoute.path, {
      ...currentRoute.props?.params,
      lang: pCurrentLanguage.key,
    });

    // push new URL result in history
    ROUTERS.history.push(newUrl);
  }

  /**
   * Init languages service
   * @param languages
   */
  public init(languages: TLanguage[]): void {
    if (languages?.length === 0) {
      throw new Error("ERROR, no language is set.");
    }
    this.languages = languages;
    this.defaultLanguage = this.selectDefaultLanguage(languages);
    this.previousLanguage = this.currentLanguage;
    this._currentLanguage = this.getLanguageFromUrl();
  }

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
      pathname.startsWith(`/${language.key}`)
    );
    debug("getLanguageFromUrl > currentLanguageObj", currentLanguageObj);
    return currentLanguageObj || this.defaultLanguage;
  }
}

export default new LanguagesService();
