import { TRoute } from "../api/RouterInstance";

const debug = require("debug")(`front:Languages`);

export type TLanguage = { key: string; default?: boolean };

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
   * Show default language in URL
   * ex: if default language is "en"
   * if true, URL with language is "my-url.com/en/rest"
   * if false,default language isn't shown in URL "my-url.com/rest"
   */
  public showDefaultLanguageInUrl: boolean;

  /**
   * Default language object
   */
  public defaultLanguage: TLanguage;

  /**
   * Set / Get current language object
   */
  protected _currentLanguage: TLanguage;
  public get currentLanguage(): TLanguage {
    return this._currentLanguage;
  }
  public set currenLanguage(pCurrentLanguage: TLanguage) {
    if (this.currentLanguage === pCurrentLanguage) return;
    this._currentLanguage = pCurrentLanguage;
  }

  /**
   * TODO
   * singleton / store
   * @param languages
   * @param showDefaultLanguageInUrl
   */
  public init(languages: TLanguage[], showDefaultLanguageInUrl: boolean = false) {
    if (languages?.length === 0) {
      throw new Error("ERROR, no language is set.");
    }
    this.languages = languages;
    this.showDefaultLanguageInUrl = showDefaultLanguageInUrl;
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
      pathname.startsWith(`/${language.key}`)
    );
    debug("getLanguageFromUrl > currentLanguageObj", currentLanguageObj);
    return currentLanguageObj || this.defaultLanguage;
  }

  /**
   * Check if current language is the default one
   */
  protected currentLangageIsDefaultLanguage(
    currentLanguage = this.currentLanguage,
    defaultLanguage = this.defaultLanguage
  ): boolean {
    return currentLanguage.key === defaultLanguage.key;
  }
}

export default new LanguagesService();
