import { Routers } from "./Routers"
import { compileUrl, createUrl } from "./core"
import { isSSR, joinPaths, removeLastCharFromString } from "./helpers"
import { TRoute } from "../components/Router"
import debug from "@wbe/debug"

const log = debug(`router:LangService`)

export type TLanguage<T = any> = {
  key: T | string
  name?: string
  default?: boolean
}

class LangService<TLang = any> {
  /**
   * contains available languages
   */
  public languages: TLanguage<TLang>[]

  /**
   * Current language object
   */
  public currentLang: TLanguage<TLang>

  /**
   * Default language object
   */
  public defaultLang: TLanguage<TLang>

  /**
   * Browser language
   */
  public browserLang: TLanguage<TLang>

  /**
   * Show default language in URL
   */
  public showDefaultLangInUrl: boolean

  /**
   * Base URL of the app
   */
  public base: string

  /**
   * Static Location used for SSR context
   */
  public staticLocation: string

  /**
   * Init languages service
   * @param languages
   * @param showDefaultLangInUrl
   * @param base
   * @param staticLocation
   */
  public constructor({
    languages,
    showDefaultLangInUrl = true,
    base = "/",
    staticLocation,
  }: {
    languages: TLanguage<TLang>[]
    showDefaultLangInUrl?: boolean
    base?: string
    staticLocation?: string
  }) {
    if (languages?.length === 0) {
      throw new Error("ERROR, no language is set.")
    }
    this.languages = languages
    // remove extract / at the end, if exist
    this.base = removeLastCharFromString(base, "/", true)
    this.staticLocation = staticLocation
    this.defaultLang = this.getDefaultLang(languages)
    this.currentLang = this.getLangFromString() || this.defaultLang
    this.browserLang = this.getBrowserLang(languages)
    this.showDefaultLangInUrl = showDefaultLangInUrl
  }

  /**
   * Set new lang to URL
   * Use _fullUrl of last router instance (and not path), to manage lang as needed
   *
   *    ex:
   *      -> /base/lang/path     (with lang)
   *      -> /base/new-lang/path (with new lang)
   *      -> /base/path          (without lang)
   *
   *
   * Push new URL in history
   * @param toLang
   * @param forcePageReload
   * @param currentRoute
   */
  public setLang(
    toLang: TLanguage<TLang>,
    forcePageReload = true,
    currentRoute: TRoute = Routers.currentRoute,
  ): void {
    if (toLang.key === this.currentLang.key) {
      log("setLang: This is the same language, exit.")
      return
    }
    if (!this.langIsAvailable(toLang)) {
      log(`setLang: lang ${toLang.key} is not available in languages list, exit.`)
      return
    }

    // Translate currentRoute URL to new lang URL
    // ex: /base/fr/path-fr/ -> /base/en/path-en/
    const preparedNewUrl = createUrl({
      name: currentRoute?.name,
      params: {
        ...(currentRoute.props?.params || {}),
        lang: toLang.key,
      },
    })
    log("preparedNewUrl", preparedNewUrl)

    // create newUrl variable to set in each condition
    let newUrl: string
    // choose force page reload in condition below
    let chooseForcePageReload = forcePageReload

    // 1. if default language should be always visible in URL
    if (this.showDefaultLangInUrl) {
      newUrl = preparedNewUrl
    }

    // 2. if toLang is default lang, need to REMOVE lang from URL
    else if (!this.showDefaultLangInUrl && this.isDefaultLangKey(toLang.key)) {
      const urlPartToRemove = `${this.base}/${toLang.key}`
      const newUrlWithoutBaseAndLang = preparedNewUrl.substring(
        urlPartToRemove.length,
        preparedNewUrl.length,
      )
      newUrl = joinPaths([this.base, newUrlWithoutBaseAndLang])
      chooseForcePageReload = true
      log("2. after remove lang from URL", newUrl)
    }

    // 3. if current lang is default lang, add /currentLang.key after base
    else if (!this.showDefaultLangInUrl && this.isDefaultLangKey(this.currentLang.key)) {
      const newUrlWithoutBase = preparedNewUrl.substring(
        this.base.length,
        preparedNewUrl.length,
      )
      newUrl = joinPaths([this.base, "/", toLang.key as string, "/", newUrlWithoutBase])
      log("3. after add lang in URL", newUrl)
    }

    // 4. other cases
    else {
      newUrl = preparedNewUrl
      log("4, other case")
    }

    if (!newUrl) {
      log("newUrl is no set, do not reload or refresh, return.", newUrl)
      return
    }
    // register current language (not useful if we reload the app.)
    this.currentLang = toLang
    // remove last / if exist and if he is not alone
    newUrl = removeLastCharFromString(newUrl, "/", true)
    // reload or refresh with new URL
    this.reloadOrRefresh(newUrl, chooseForcePageReload)
  }

  public redirectToBrowserLang(forcePageReload: boolean = true) {
    log("browserLang object", this.browserLang)
    // If browser language doesn't match, redirect to default lang
    if (!this.browserLang) {
      log("browserLang is not set, redirect to defaultLang")
      this.redirectToDefaultLang(forcePageReload)
      return
    }
    // We want to redirect only in case user is on / or /base/
    if (
      location.pathname === this.base ||
      removeLastCharFromString(location.pathname, "/", true) === this.base
    ) {
      // prepare path and build URL
      const newUrl = compileUrl(joinPaths([this.base, "/:lang"]), {
        lang: this.browserLang.key,
      })
      log("redirect: to browser language >", { newUrl })
      // reload or refresh all application
      this.reloadOrRefresh(newUrl, forcePageReload)
    }
  }

  /**
   * Redirect to default language if no language is set
   * @param forcePageReload
   */
  public redirectToDefaultLang(forcePageReload: boolean = true): void {
    if (isSSR()) return

    if (!this.showDefaultLangInUrl) {
      log("redirect: URLs have a lang param or language is valid, don't redirect.")
      return
    }
    if (this.langIsAvailable(this.getLangFromString())) {
      log("redirect: lang from URL is valid, don't redirect")
      return
    }
    // We want to redirect only in case user is on / or /base/
    if (
      location.pathname === this.base ||
      removeLastCharFromString(location.pathname, "/", true) === this.base
    ) {
      // prepare path & build new URL
      const newUrl = compileUrl(joinPaths([this.base, "/:lang"]), {
        lang: this.defaultLang.key,
      })
      log("redirect to default lang >", { newUrl })
      // reload or refresh all application
      this.reloadOrRefresh(newUrl, forcePageReload)
    }
  }

  /**
   * Current lang is default lang
   */
  public isDefaultLangKey(langKey = this.currentLang.key): boolean {
    return langKey === this.defaultLang.key
  }

  /**
   * Determine when we need to show current lang in URL
   */
  public showLangInUrl(): boolean {
    // if option is true, always display lang in URL
    if (this.showDefaultLangInUrl) {
      return true
      // if this option is false
    } else {
      // show in URL only if whe are not on the default lang
      return !this.isDefaultLangKey(this.currentLang.key)
    }
  }

  /**
   * Add Lang to Routes
   * Patch all first level routes with ":lang" param
   * {
   *    path: "/foo",
   * }
   * become
   *
   * * {
   *    path: "/:lang/foo",
   * }
   * @param routes
   * @param showLangInUrl
   */
  public addLangParamToRoutes(
    routes: TRoute[],
    showLangInUrl = this.showLangInUrl(),
  ): TRoute[] {
    if (routes?.some((el) => !!el._langPath)) {
      return routes
    }

    /**
     * Add :lang param on path
     * @param pPath
     * @param pShowLang
     */
    const patchLangParam = (pPath: string, pShowLang): string =>
      removeLastCharFromString(
        joinPaths([pShowLang && "/:lang", pPath !== "/" ? pPath : "/"]),
        "/",
      )

    /**
     * Patch routes
     *  - Add "/:lang" param on each 1st level route
     *  - format path recursively (on children if exist)
     * ex:
     *     {
     *      path: { en: "/home", fr: "/accueil" }
     *     },
     *  return:
     *    {
     *      path: "/:lang/home",
     *      _langPath: { en: "/:lang/home", fr: "/:lang/accueil" },
     *    }
     *
     */
    const patchRoutes = (pRoutes, children = false) => {
      return pRoutes.map((route: TRoute) => {
        const path = this.getLangPathByLang(route)
        const hasChildren = route.children?.length > 0
        const showLang = !children && showLangInUrl

        let langPath = {}
        if (typeof route.path === "object") {
          Object.keys(route.path).forEach((lang) => {
            langPath[lang] = patchLangParam(route.path[lang], showLang)
          })
        }

        // even if route.path is not an object, add his value to route.langPath object property
        else if (typeof route.path === "string") {
          this.languages
            .map((el) => el.key)
            .forEach((key: string) => {
              langPath[key] = patchLangParam(route.path as string, showLang)
            })
        }

        return {
          ...route,
          path: patchLangParam(path, showLang),
          _langPath: Object.entries(langPath).length !== 0 ? langPath : null,
          ...(hasChildren ? { children: patchRoutes(route.children, true) } : {}),
        }
      })
    }
    return patchRoutes(routes)
  }

  // --------------------------------------------------------------------------- LOCAL

  /**
   * Get current lang path by Lang
   * ex:
   * const route = {
   *     component: ...,
   *     path: { en: "/about", fr: "/a-propos", de: "uber", name: "about" },
   * }
   *
   * selectLangPathByLang(route, "fr") // will return  "/a-propos"
   *
   * @param route
   * @param lang
   */
  protected getLangPathByLang(
    route: TRoute,
    lang = this.getLangFromString(this.staticLocation || window.location.pathname)?.key ||
      this.defaultLang.key,
  ): string {
    let selectedPath: string
    if (typeof route.path === "string") {
      selectedPath = route.path
    } else if (typeof route.path === "object") {
      Object.keys(route.path).find((el) => {
        if (el === lang) selectedPath = route.path?.[el]
      })
    }
    return selectedPath
  }

  /**
   * Returns default language of the list
   * If no default language exist, it returns the first language object of the languages array
   * @param languages
   */
  protected getDefaultLang(languages: TLanguage<TLang>[]): TLanguage<TLang> {
    return languages.find((el) => el?.default) ?? languages[0]
  }

  /**
   * Get Browser language
   * @protected
   */
  protected getBrowserLang(languages: TLanguage[]): TLanguage<TLang> {
    if (typeof navigator === "undefined") return

    const browserLanguage = navigator.language
    log("Browser language detected", browserLanguage)

    return languages.find((lang) =>
      lang.key.includes("-")
        ? (lang.key as string) === browserLanguage.toLowerCase()
        : (lang.key as string) === browserLanguage.toLowerCase().split("-")[0],
    )
  }

  /**
   * Get current language from URL
   * @param pathname
   */
  public getLangFromString(
    pathname = this.staticLocation || window.location.pathname,
  ): TLanguage<TLang> {
    let pathnameWithoutBase = pathname.replace(this.base, "/")
    const firstPart = joinPaths([pathnameWithoutBase]).split("/")[1]
    return this.languages.find((language) => {
      return firstPart === language.key
    })
  }

  /**
   * Check if language is available in language list
   * @protected
   */
  protected langIsAvailable(
    langObject: TLanguage<TLang>,
    languesList = this.languages,
  ): boolean {
    return languesList.some((lang) => lang.key === langObject?.key)
  }

  /**
   * Reload full page or refresh with router push
   * @param newUrl
   * @param forcePageReload
   * @protected
   */
  protected reloadOrRefresh(newUrl: string, forcePageReload = true): void {
    if (isSSR()) return
    forcePageReload ? window?.open(newUrl, "_self") : Routers.history.push(newUrl)
  }
}

export default LangService
