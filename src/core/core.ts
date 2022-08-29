import { Routers } from "./Routers";
import debug from "@wbe/debug";
import { compile, match } from "path-to-regexp";
import { TRoute } from "../components/Router";
import LangService from "./LangService";
import { joinPaths, removeLastCharFromString } from "./helpers";

const componentName: string = "core";
const log = debug(`router:${componentName}`);

export type TParams = { [x: string]: any };

export type TOpenRouteParams = {
  name: string;
  params?: TParams;
};

// ----------------------------------------------------------------------------- PUBLIC

/**
 * createUrl URL for setLocation
 * (Get URL to push in history)
 *
 * @param args can be string or TOpenRouteParams object
 * @param base
 * @param allRoutes
 * @param langService
 */
export function createUrl(
  args: string | TOpenRouteParams,
  base: string = Routers.base,
  allRoutes: TRoute[] = Routers.routes,
  langService = Routers.langService
): string {
  if (!allRoutes) return;
  let urlToPush: string;

  if (typeof args === "object" && !langService) {
    log(
      "route.path object is not supported without langService. Use should use route.path string instead."
    );
  }

  // in case we recieve a string
  if (typeof args === "string") {
    urlToPush = args as string;

    if (!!langService) {
      urlToPush = addLangToUrl(urlToPush);
    }
  }
  // in case we recieve an object
  else if (typeof args === "object" && args?.name) {
    // add lang to params if no exist
    if (langService && !args.params?.lang) {
      args.params = {
        ...args.params,
        ...{ lang: langService.currentLang.key },
      };
    }
    // Get URL by the route name
    urlToPush = getUrlByRouteName(allRoutes, args);

    // in other case return.
  } else {
    console.warn("createUrl param isn't valid. to use createUrl return.", args);
    return;
  }

  function addBaseToUrl(url: string, base = Routers.base): string {
    url = joinPaths([base === "/" ? "" : base, url]);
    return url;
  }

  // in each case, add base URL
  urlToPush = addBaseToUrl(
    urlToPush,
    // compile base if contains lang params
    compileUrl(base, { lang: Routers.langService?.currentLang.key })
  );
  return urlToPush;
}

/**
 * Get sub router base URL
 * @param path
 * @param base
 * @param addLangToUrl
 * @param showLangInUrl
 * @returns
 */
export function getSubRouterBase(
  path: string | { [x: string]: string },
  base: string,
  addLangToUrl: boolean = true,
  showLangInUrl: boolean = Routers.langService?.showLangInUrl()
): string {
  return joinPaths([
    base,
    showLangInUrl && addLangToUrl ? "/:lang" : "",
    getLangPath(path),
  ]);
}

/**
 * Get sub router routes
 * @param path
 * @param routes
 * @returns
 */
export function getSubRouterRoutes(
  path: string | { [x: string]: string },
  routes: TRoute[]
): TRoute[] {
  return routes.find((route) => {
    return getLangPath(route.path) === getLangPath(path);
  })?.children;
}

/**
 * Get current route path by route name. (or component name)
 * (ex: "foo/bla" => if page is BlaPage, return "/bla")
 * This is just path of the route, not "fullParh" /foo/bla
 * @param routes
 * @param name
 * @returns
 */
export function getPathByRouteName(
  routes: TRoute[],
  name: string
): string | { [x: string]: string } {
  for (let route of routes) {
    if (route.name === name || route.component?.displayName === name) {
      // specific case, we want to retrieve path of route with "/" route and langService is used,
      // we need to patch it with lang param
      if (route.path === "/" && Routers.langService) {
        return "/:lang";
      } else {
        return route.path;
      }
    } else {
      if (route.children) {
        const next = getPathByRouteName(route.children, name);
        if (next) {
          return next;
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
  const url = typeof args === "string" ? args : createUrl(args);
  history?.push(url);
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
  url: string;
  base: string;
  routes: TRoute[];
  langService?: LangService;
  middlewares?: ((routes: TRoute[]) => TRoute[])[];
  id?: string | number;
}): Promise<{ props: any; name: string }> {
  const currentRoute = getRouteFromUrl({
    pUrl: url,
    pBase: base,
    pRoutes: formatRoutes(routes, langService, middlewares, id),
    id,
  });

  const notFoundRoute = getNotFoundRoute(routes);

  if (!currentRoute && !notFoundRoute) {
    log(id, "currentRoute not found & 'notFoundRoute' not found, return.");
    return;
  }

  // get out
  if (!currentRoute) {
    console.error("No currentRoute, return");
    return;
  }

  // prepare returned obj
  const SSR_STATIC_PROPS = {
    props: null,
    name: currentRoute.name,
  };

  // await promise from getStaticProps
  if (currentRoute?.getStaticProps) {
    try {
      SSR_STATIC_PROPS.props = await currentRoute.getStaticProps(currentRoute.props);
    } catch (e) {
      console.error("fetch getStatic Props data error");
    }
  }
  return SSR_STATIC_PROPS;
}

// ----------------------------------------------------------------------------- MATCHER

type TGetRouteFromUrl = {
  pUrl: string;
  pRoutes?: TRoute[];
  pBase?: string;
  pCurrentRoute?: TRoute;
  pMatcher?: any;
  pParent?: TRoute;
  id?: number | string;
};

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
  if (!pRoutes || pRoutes?.length === 0) return;

  function next({
    pUrl,
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
        "/"
      );
      const matcher = match(currentRoutePath)(pUrl);
      log(id, `"${pUrl}" match with "${currentRoutePath}"?`, !!matcher);

      // if current route path match with the param url
      if (matcher) {
        const params = pMatcher?.params || matcher?.params;

        const formatRouteObj = (route) => ({
          path: route?.path,
          url: compile(route.path as string)(params),
          base: pBase,
          component: route?.component,
          children: route?.children,
          parser: pMatcher || matcher,
          name: route?.name || route?.component?.displayName,
          getStaticProps: route?.getStaticProps,
          props: {
            params,
            ...(route?.props || {}),
          },
          _fullPath: currentRoutePath,
          _fullUrl: pUrl,
          _langPath: route?._langPath,
        });

        const routeObj = {
          ...formatRouteObj(currentRoute),
          _context: formatRouteObj(pParent || currentRoute),
        };

        log(id, "getRouteFromUrl: MATCH routeObj", routeObj);
        return routeObj;
      }

      // if not match
      else if (currentRoute?.children) {
        // else, call recursively this same method with new params
        const matchingChildren = next({
          pUrl,
          id,
          pRoutes: currentRoute?.children,
          pParent: pParent || currentRoute,
          pBase: currentRoutePath, // parent base
          pMatcher: matcher,
        });

        // only if matching, return this match, else continue to next iteration
        if (matchingChildren) {
          return matchingChildren;
        }
      }
    }
  }

  return next({ pUrl, pRoutes, pBase, pMatcher, id });
}

/**
 * Get notFoundRoute
 * @param routes
 * @returns TRoute
 */
export function getNotFoundRoute(routes: TRoute[]): TRoute {
  return routes?.find(
    (el) => el.path === "/:rest" || el.component?.displayName === "NotFoundPage"
  );
}

// ----------------------------------------------------------------------------- ROUTES

/**
 * Add missing route with "/" on children routes if doesn't exist.
 *
 * children: [
 *     { path: "/foo", component: FooPage },
 *     { path: "/bar", component: BarPage },
 * ]
 * become:
 *  children: [
 *     { path: "/", component: null },
 *     { path: "/foo", component: FooPage },
 *     { path: "/bar", component: BarPage },
 * ]
 * @param routes
 */
export function patchMissingRootRoute(routes: TRoute[] = Routers.routes): TRoute[] {
  if (!routes) {
    log("routes doesnt exist, return", routes);
    return;
  }
  const rootPathExist = routes.some(
    (route) =>
      (typeof route.path === "object" &&
        Object.keys(route.path).some(
          (el) => route.path[el] === "/" || route.path[el] === "/:lang"
        )) ||
      route.path === "/" ||
      route.path === "/:lang"
  );
  if (!rootPathExist) {
    routes.unshift({
      path: "/",
      component: null,
      name: `1stLevelRoute-${Math.random()}`,
    });
  }
  return routes;
}

/**
 * Apply middlewares to routes.
 * @param preMiddlewareRoutes
 * @param middlewares
 * @returns
 */
export function applyMiddlewaresToRoutes(
  preMiddlewareRoutes: TRoute[],
  middlewares: ((routes: TRoute[]) => TRoute[])[]
): TRoute[] {
  return (
    middlewares?.reduce(
      (routes, middleware) => middleware(routes),
      preMiddlewareRoutes
    ) || preMiddlewareRoutes
  );
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
  id?: number | string
): TRoute[] {
  if (!routes) {
    console.error(id, "props.routes is missing or empty, return.");
    return;
  }

  // For each instances
  let routesList = patchMissingRootRoute(routes);

  // subRouter instances shouldn't inquired middlewares and LangService
  if (middlewares) {
    routesList = applyMiddlewaresToRoutes(routesList, middlewares);
  }
  // Only for first instance
  if (langService) {
    routesList = langService.addLangParamToRoutes(routesList);
  }

  return routesList;
}

// ----------------------------------------------------------------------------- URLS / PATH

/**
 * Compile an URL with path and params via path-to-regex
 * ex:
 *  compile("foo/:id")({id: example-client}) // "foo/example-client"
 */
export function compileUrl(path: string, params?: TParams): string {
  return compile(path)(params);
}

/**
 * Get full path by path
 *  if path "/foo" is a children of path "/bar", his full url is "/bar/foo"
 *  With the second URL part "/foo", this function will returns "/bar/foo"
 * @returns string
 */
export function get_fullPathByPath(
  routes: TRoute[],
  path: string | { [x: string]: string },
  routeName: string,
  lang: string = Routers.langService?.currentLang.key || undefined,
  basePath: string = null
): string {
  let localPath: string[] = [basePath];

  for (let route of routes) {
    const langPath = route._langPath?.[lang];
    const routePath = route.path as string;

    const pathMatch =
      (langPath === path || routePath === path) && route.name === routeName;

    // if path match on first level, keep path in local array and return it, stop here.
    if (pathMatch) {
      localPath.push(langPath || routePath);
      return joinPaths(localPath);
    }

    // if not matching but as children, return it
    else if (route?.children?.length > 0) {
      // no match, recall recursively on children
      const matchChildrenPath = get_fullPathByPath(
        route.children,
        path,
        routeName,
        lang,
        joinPaths(localPath)
      );
      // return recursive Fn only if match, else continue to next iteration
      if (matchChildrenPath) {
        // keep path in local array
        localPath.push(langPath || routePath);
        // Return the function after localPath push
        return get_fullPathByPath(
          route.children,
          path,
          routeName,
          lang,
          joinPaths(localPath)
        );
      }
    }
  }
}

/**
 * Get "full" URL by route name and params
 * @returns string
 */
export function getUrlByRouteName(pRoutes: TRoute[], pParams: TOpenRouteParams): string {
  // need to wrap the function to be able to access the preserved "pRoutes" param
  // in local scope after recursion
  const next = (routes: TRoute[], params: TOpenRouteParams): string => {
    for (let route of routes) {
      const match =
        route?.name === params.name || route.component?.displayName === params.name;
      if (match) {
        if (!route?.path) {
          log("getUrlByRouteName > There is no route with this name, exit", params.name);
          return;
        }

        let path =
          typeof route.path === "object"
            ? route.path[Object.keys(route.path)[0]]
            : route.path;

        // get full path
        const _fullPath = get_fullPathByPath(
          pRoutes,
          path,
          route.name,
          pParams?.params?.lang
        );
        // build URL
        // console.log("_fullPath", _fullPath, params);
        return compileUrl(_fullPath, params.params);
      }

      // if route has children
      else if (route.children?.length > 0) {
        // getUrlByRouteName > no match, recall recursively on children
        const match = next(route.children, params);
        // return recursive Fn only if match, else, continue to next iteration
        if (match) return match;
      }
    }
  };
  return next(pRoutes, pParams);
}

/**
 * returns lang path
 * (a 'langPath' is '/about' or '/a-propos' in path: {en: "/about", fr: "/a-propos", de: "uber", name: "about"})
 * @param langPath
 * @param lang
 * @returns
 */
export function getLangPath(
  langPath: string | { [p: string]: string },
  lang: string = Routers.langService?.currentLang.key
) {
  let path;
  if (typeof langPath === "string") {
    path = langPath;
  } else if (typeof langPath === "object") {
    path = langPath?.[lang];
  }

  const removeLangFromPath = (path: string): string => {
    if (path?.includes(`/:lang`)) {
      return path?.replace("/:lang", "");
    } else return path;
  };

  return removeLangFromPath(path);
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
  enable = Routers.langService?.showLangInUrl()
): string {
  if (!enable) return url;
  url = joinPaths([`/${lang}`, url === "/" ? "" : url]);
  return url;
}
