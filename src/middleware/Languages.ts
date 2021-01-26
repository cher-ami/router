const debug = require("debug")(`front:Languages`);

export type TLanguage = { key: string; default?: boolean };

class Languages {
  /**
   * contains available languages
   */
  protected languages: TLanguage[];

  /**
   * Show default language in URL
   * ex: if default language is "en"
   * if true, URL with language is "my-url.com/en/rest"
   * if false,default language isn't shown in URL "my-url.com/rest"
   */
  protected showDefaultLanguageInUrl: boolean;

  /**
   * Default language object
   */
  protected defaultLanguage: TLanguage;

  /**
   * TODO
   * singleton / store
   * @param languages
   * @param showDefaultLanguageInUrl
   */
  public service(languages: TLanguage[], showDefaultLanguageInUrl: boolean = false) {
    if (languages?.length === 0) {
      throw new Error("ERROR, no language is set.");
    }
    this.languages = languages;
    this.showDefaultLanguageInUrl = showDefaultLanguageInUrl;
    this.defaultLanguage = this.selectDefaultLanguage(languages);
  }

  /**
   * TODO
   * permet de patcher les routes, on le passe cette fonction au router
   */
  public middleware() {
    return (routes, currentoute) => {
      //
    };
  }

  /**
   * Returns default language of the list
   * If no default language exist, it returns the first language object of the language array
   * @param languages
   */
  protected selectDefaultLanguage(languages: TLanguage[]) {
    return languages.find((el) => el?.default) ?? languages[0];
  }
}

export default new Languages();
