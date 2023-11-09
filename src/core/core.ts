import { Routers } from "./Routers"
import debug from "@cher-ami/debug"
import { compile, match } from "path-to-regexp"
import { TRoute } from "../components/Router"
import LangService from "./LangService"
import { joinPaths, removeLastCharFromString } from "./helpers"

const componentName: string = "core"
const log = debug(`router:${componentName}`)

export type TParams = { [x: string]: any }
export type TQueryParams = { [x: string]: string }

export type TOpenRouteParams = {
  name: string
  params?: TParams
  queryParams?: TQueryParams
  hash?: string
}

// ----------------------------------------------------------------------------- PUBLIC

/**
 * createUrl URL for setLocation
 * (Get URL to push in history)
 *
 * @param openRouteParams can be string or TOpenRouteParams object
 * @param base
 * @param allRoutes
 * @param langService
 */
export function createUrl(
  openRouteParams: string | TOpenRouteParams,
  base: string = Routers.base,
  allRoutes: TRoute[] = Routers.routes,
  langService = Routers.langService,
): string {
  if (!allRoutes) return
  let urlToPush: string

  // STRING param
  if (typeof openRouteParams === "string") {
    urlToPush = openRouteParams as string
    if (!!langService) {
      urlToPush = addLangToUrl(urlToPush)
    }
    urlToPush = joinPaths([base === "/" ? "" : base, urlToPush])
    return urlToPush
  }

  // OBJECT param, add lang to params if no exist
  else if (typeof openRouteParams === "object" && openRouteParams?.name) {
    if (langService && !openRouteParams.params?.lang) {
      openRouteParams.params = {
        ...openRouteParams.params,
        lang: langService.currentLang.key,
      }
    }

    // add params to URL if exist
    let queryParams = ""
    if (openRouteParams?.queryParams) {
      queryParams = "?"
      queryParams += Object.keys(openRouteParams.queryParams)
        .map((key) => `${key}=${openRouteParams?.queryParams[key]}`)
        .join("&")
    }
    // add hash to URL if exist
    let hash = ""
    if (openRouteParams?.hash) {
      hash = "#" + openRouteParams.hash
    }

    function getUrlByRouteName(
      allRoutes: TRoute[],
      args: TOpenRouteParams,
      base = Routers.base || "/",
      langService = Routers.langService,
    ): string {
      const next = (routes, args, curBase): string => {
        for (let route of routes) {
          const lang = args.params?.lang || langService?.currentLang.key
          const langPath = route._langPath?.[lang]
          const routePath = route.path
          // console.log("---------",{ lang, langPath, routePath })
          if (route?.name === args.name || route.component?.displayName === args.name) {
            // prettier-ignore
            return (curBase + compile(langPath || routePath)(args.params)).replace(/(\/)+/g, "/")
          } else if (route.children?.length > 0) {
            const match = next(
              route.children,
              args,
              curBase + compile(langPath || routePath)(args.params),
            )
            if (match) return match
          }
        }
      }
      return next(allRoutes, args, base)
    }

    const url = getUrlByRouteName(allRoutes, openRouteParams, base)
    if (url) return url + queryParams + hash

    // in other case return
  } else {
    console.warn("createUrl param isn't valid. to use createUrl return.", openRouteParams)
    return
  }
}

/**
 * Get sub router base URL
 * @param path
 * @param base
 * @param addLangToUrl:
 *  if true, base will be /base/:lang/path/subPath
 *  if false, base will be /base/path/subPath
 * @returns
 */
export function getSubRouterBase(
  path: string | { [x: string]: string },
  base: string,
  addLangToUrl: boolean = true,
): string {
  // case langService is init, and we don't want to show default lang in URL, and we are on default lang.
  // /:lang is return as path, but we want to get no lang in returned base string
  const addLang = Routers.langService?.showLangInUrl() && addLangToUrl ? "/:lang" : ""
  const pathAfterLang = path === "/:lang" ? getLangPath("/") : getLangPath(path)
  return joinPaths([base, addLang, pathAfterLang])
}

/**
 * Get sub router routes
 * @param path
 * @param routes
 * @returns
 */
export function getSubRouterRoutes(
  path: string | { [x: string]: string },
  routes: TRoute[],
): TRoute[] {
  // case langService is init, and we don't want to show default lang in URL, and we are on default lang.
  // /:lang is return as path, but we want to search path with "/" instead
  const formattedPath =
    !Routers.langService?.showLangInUrl() && path === "/:lang" ? "/" : path

  return routes.find((route) => {
    return getLangPath(route.path) === getLangPath(formattedPath)
  })?.children
}

/**
 * Get current route path by route name. (or component name)
 * (ex: "foo/bla" => if page is BlaPage, return "/bla")
 * This is just path of the route, not "fullPath" /foo/bla
 * @param routes
 * @param name
 * @returns
 */
export function getPathByRouteName(
  routes: TRoute[],
  name: string,
): string | { [x: string]: string } {
  for (let route of routes) {
    if (route.name === name || route?.component?.displayName === name) {
      // specific case, we want to retrieve path of route with "/" route and langService is used,
      // we need to patch it with lang param
      if (route.path === "/" && Routers.langService) {
        return "/:lang"
      } else {
        return route.path
      }
    } else {
      if (route.children) {
        const next = getPathByRouteName(route.children, name)
        if (next) {
          return next
        }
      }
    }
  }
}

/**
 * openRoute push a route in history
 *  the Stack component will render the new route
 * @param args can be string or TOpenRouteParams object
 * @param history
 */
export function openRoute(args: string | TOpenRouteParams, history = Routers?.history) {
  const url = typeof args === "string" ? args : createUrl(args)
  history?.push(url)
}

/**
 * Request static props route
 * - find current route by URL
 * - await the promise from getStaticProps of current route
 * - return result
 */
export async function requestStaticPropsFromRoute({
  url,
  base,
  routes,
  langService,
  middlewares,
  id,
}: {
  url: string
  base: string
  routes: TRoute[]
  langService?: LangService
  middlewares?: ((routes: TRoute[]) => TRoute[])[]
  id?: string | number
}): Promise<{ props: any; name: string; url: string }> {
  const currentRoute = getRouteFromUrl({
    pUrl: url,
    pBase: base,
    pRoutes: formatRoutes(routes, langService, middlewares, id),
    id,
  })

  const notFoundRoute = getNotFoundRoute(routes)

  if (!currentRoute && !notFoundRoute) {
    log(id, "currentRoute not found & 'notFoundRoute' not found, return.")
    return
  }

  // get out
  if (!currentRoute) {
    log("No currentRoute, return")
    return
  }

  // prepare returned obj
  const SSR_STATIC_PROPS = {
    props: null,
    name: currentRoute.name,
    url,
  }

  // await promise from getStaticProps
  if (currentRoute?.getStaticProps) {
    try {
      SSR_STATIC_PROPS.props = await currentRoute.getStaticProps(
        currentRoute.props,
        langService?.currentLang,
      )
    } catch (e) {
      log("fetch getStatic Props data error")
    }
  }
  return SSR_STATIC_PROPS
}

// ----------------------------------------------------------------------------- MATCHER

type TGetRouteFromUrl = {
  pUrl: string
  pRoutes?: TRoute[]
  pBase?: string
  pCurrentRoute?: TRoute
  pMatcher?: any
  pParent?: TRoute
  id?: number | string
  urlWithoutHashAndQuery?: string
}

/**
 * Get current route from URL, using path-to-regex
 * @doc https://github.com/pillarjs/path-to-regexp
 */
export function getRouteFromUrl({
  pUrl,
  pRoutes,
  pBase,
  pMatcher,
  id,
}: TGetRouteFromUrl): TRoute {
  if (!pRoutes || pRoutes?.length === 0) return
  // console.log(id,'getRouteFromUrl', pRoutes)

  // extract queryParams params and hash
  const { queryParams, hash, urlWithoutHashAndQuery } = extractQueryParamsAndHash(pUrl)

  function next({
    pUrl,
    urlWithoutHashAndQuery,
    pRoutes,
    pBase,
    pMatcher,
    pParent,
    id,
  }: TGetRouteFromUrl): TRoute {
    // test each routes
    for (let currentRoute of pRoutes) {
      // create parser & matcher
      const currentRoutePath = removeLastCharFromString(
        joinPaths([pBase, currentRoute.path as string]),
        "/",
      )
      const matcher = match(currentRoutePath)(urlWithoutHashAndQuery)
      // prettier-ignore
      log(id, `url "${urlWithoutHashAndQuery}" match path "${currentRoutePath}"?`,!!matcher);

      // if current route path match with the param url
      if (matcher) {
        const params = pMatcher?.params || matcher?.params

        const formatRouteObj = (route) => {
          if (!route) return
          return {
            path: route?.path,
            url: compile(route.path as string)(params),
            base: pBase,
            component: route?.component,
            children: route?.children,
            parser: pMatcher || matcher,
            name: route?.name || route?.component?.displayName,
            getStaticProps: route?.getStaticProps,
            params,
            queryParams,
            hash,
            props: {
              params,
              queryParams,
              hash,
              ...(route?.props || {}),
            },
            _fullPath: currentRoutePath,
            _fullUrl: pUrl,
            _langPath: route?._langPath,
          }
        }

        const formattedCurrentRoute = formatRouteObj(currentRoute)
        const routeObj = {
          ...formattedCurrentRoute,
          _context: pParent ? formatRouteObj(pParent) : formattedCurrentRoute,
        }

        log(id, "match", routeObj)
        return routeObj
      }

      // if not match
      else if (currentRoute?.children) {
        // else, call recursively this same method with new params
        const matchingChildren = next({
          pUrl,
          urlWithoutHashAndQuery,
          id,
          pRoutes: currentRoute?.children,
          pParent: pParent || currentRoute,
          pBase: currentRoutePath, // parent base
          pMatcher: matcher,
        })

        // only if matching, return this match, else continue to next iteration
        if (matchingChildren) {
          return matchingChildren
        }
      }
    }
  }

  return next({ pUrl, urlWithoutHashAndQuery, pRoutes, pBase, pMatcher, id })
}

/**
 * Get notFoundRoute
 * @param routes
 * @returns TRoute
 */
export function getNotFoundRoute(routes: TRoute[]): TRoute {
  return routes?.find(
    (el) => el.path === "/:rest" || el.component?.displayName === "NotFoundPage",
  )
}

export const extractQueryParamsAndHash = (
  url: string,
): {
  queryParams: { [x: string]: string }
  hash: string
  urlWithoutHashAndQuery: string
} => {
  let queryParams = {}
  let hash = null
  const queryIndex = url.indexOf("?")
  const hashIndex = url.indexOf("#")

  if (queryIndex === -1 && hashIndex === -1) {
    return { queryParams, hash, urlWithoutHashAndQuery: url }
  }

  // Extract hash
  if (hashIndex !== -1) {
    hash = url.slice(hashIndex + 1)
  }
  // Extract queryParams parameters
  if (queryIndex !== -1) {
    const queryString = url.slice(
      queryIndex + 1,
      hashIndex !== -1 ? hashIndex : undefined,
    )
    const searchParams = new URLSearchParams(queryString)
    searchParams.forEach((value, key) => (queryParams[key] = value))
  }
  // finally remove queryParams and hash from pathname
  for (let e of ["?", "#"]) {
    url = url.includes(e) ? url.split(e)[0] : url
  }
  return { queryParams, hash, urlWithoutHashAndQuery: url }
}

// ----------------------------------------------------------------------------- ROUTES

/**
 * Add missing route with "/" on children routes if doesn't exist.
 *
 * this is not a recursive function, "/" route will be insert only on first level.
 *
 * [
 *     { path: "/foo", component: FooPage },
 *     { path: "/bar", component: BarPage },
 * ]
 * become:
 *  [
 *     { path: "/", component: null },
 *     { path: "/foo", component: FooPage },
 *     { path: "/bar", component: BarPage },
 * ]
 * @param routes
 */
export function patchMissingRootRoute(routes: TRoute[] = Routers.routes): TRoute[] {
  if (!routes) {
    log("routes doesnt exist, return", routes)
    return
  }
  const rootPathExist = routes.some(
    (route) =>
      (typeof route.path === "object" &&
        Object.keys(route.path).some(
          (el) => route.path[el] === "/" || route.path[el] === "/:lang",
        )) ||
      route.path === "/" ||
      route.path === "/:lang",
  )
  if (!rootPathExist) {
    routes.unshift({
      path: "/",
      component: null,
      name: `auto-generate-slash-route-${Math.random()}`,
    })
  }
  return routes
}

/**
 * Apply middlewares to routes.
 * @param preMiddlewareRoutes
 * @param middlewares
 * @returns
 */
export function applyMiddlewaresToRoutes(
  preMiddlewareRoutes: TRoute[],
  middlewares: ((routes: TRoute[]) => TRoute[])[],
): TRoute[] {
  return (
    middlewares?.reduce(
      (routes, middleware) => middleware(routes),
      preMiddlewareRoutes,
    ) || preMiddlewareRoutes
  )
}

/**
 * Format and return routes list
 * If is the first Router instance, register routes in 'Routers' store.
 * In other case, return current props.routes
 */
export function formatRoutes(
  routes: TRoute[],
  langService?: LangService,
  middlewares?: ((routes: TRoute[]) => TRoute[])[],
  id?: number | string,
): TRoute[] {
  if (!routes) {
    console.error(id, "props.routes is missing or empty, return.")
    return
  }

  // For each instances
  let routesList = patchMissingRootRoute(routes)

  // subRouter instances shouldn't inquire middlewares and LangService
  if (middlewares) {
    routesList = applyMiddlewaresToRoutes(routesList, middlewares)
  }
  // Only for first instance
  if (langService) {
    routesList = langService.addLangParamToRoutes(routesList)
  }

  return routesList
}

// ----------------------------------------------------------------------------- URLS / PATH

/**
 * returns lang path
 * (a 'langPath' is '/about' or '/a-propos' in path: {en: "/about", fr: "/a-propos", de: "uber", name: "about"})
 * @param langPath
 * @param lang
 * @returns
 */
export function getLangPath(
  langPath: string | { [p: string]: string },
  lang: string = Routers.langService?.currentLang.key,
) {
  let path
  if (typeof langPath === "string") path = langPath
  else if (typeof langPath === "object") path = langPath?.[lang]

  const removeLangFromPath = (path: string): string => {
    if (path?.includes(`/:lang`)) {
      return path?.replace("/:lang", "")
    } else return path
  }

  return removeLangFromPath(path)
}

/**
 * if language service exist, set lang key to URL
 * and current language in URL
 *
 * ex
 * before: "/foo"
 * after:  "/en/foo"
 *
 * ex2
 * before: "/"
 * after:  "/en"
 *
 * @param url
 * @param lang
 * @param enable
 */
export function addLangToUrl(
  url: string,
  lang: string = Routers.langService?.currentLang.key,
  enable = Routers.langService?.showLangInUrl(),
): string {
  if (!enable) return url
  url = joinPaths([`/${lang}`, url === "/" ? "" : url])
  return url
}
