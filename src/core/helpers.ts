import { Routers } from "./Routers";
import debug from "@wbe/debug";
import { compile } from "path-to-regexp";
import { TRoute } from "../components/Router";

const componentName: string = "helpers";
const log = debug(`router:${componentName}`);

export type TParams = { [x: string]: any };

export type TOpenRouteParams = {
  name: string;
  params?: TParams;
};

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
export function patchMissingRootRoute(routes: TRoute[]): TRoute[] {
  const rootPathExist = routes.some(
    (route) =>
      (typeof route.path === "object" &&
        Object.keys(route.path).some((el) => route.path[el] === "/")) ||
      route.path === "/"
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
export function applyMiddlewares(
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
 * Get route path by route name. (or component name)
 * @param routes
 * @param name
 * @returns
 */
export function getRoutePathByRouteName(
  routes: TRoute[],
  name: string
): string | { [x: string]: string } {
  for (let route of routes) {
    if (route.name === name || route.component?.displayName === name) {
      return route.path;
    } else {
      if (route.children) {
        return getRoutePathByRouteName(route.children, name);
      }
    }
  }
}

/**
 * Get sub router base URL
 * @param path
 * @param base
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
 * openRoute push a route in history
 *  the Stack component will render the new route
 * @param args can be string or TOpenRouteParams object
 * @param availablesRoutes
 */
export function openRoute(args: string | TOpenRouteParams, history = Routers?.history) {
  const url = typeof args === "string" ? args : createUrl(args);
  history?.push(url);
}

// ----------------------------------------------------------------------------- URLS

/**
 * Compile an URL with path and params via path-to-regex
 * ex:
 *  compile("foo/:id")({id: example}) // "foo/example"
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
export function getFullPathByPath(
  routes: TRoute[],
  path: string | { [x: string]: string },
  routeName: string,
  lang: string = Routers.langService?.currentLang.key || undefined,
  basePath: string = null
): string {
  let localPath: string[] = [basePath];

  for (let route of routes) {
    const langPath = route.langPath?.[lang];
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
      const matchChildrenPath = getFullPathByPath(
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
        return getFullPathByPath(
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
 * Get URL by route name and params
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
        const fullPath = getFullPathByPath(
          pRoutes,
          path,
          route.name,
          pParams?.params?.lang
        );
        // build URL
        return compileUrl(fullPath, params.params);
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
 * createUrl URL for setlocation
 * (Get URL to push in history)
 *
 * @param args can be string or TOpenRouteParams object
 * @param allRoutes
 */
export function createUrl(
  args: string | TOpenRouteParams,
  base: string = Routers.base,
  allRoutes: TRoute[] = Routers.routes,
  langService = Routers.langService
): string {
  if (!allRoutes) return;
  let urlToPush: string;

  // in case we recieve a string
  if (typeof args === "string") {
    urlToPush = args as string;

    if (!!langService) {
      urlToPush = addLangToUrl(urlToPush);
    }

    // in case we recieve an object
  } else if (typeof args === "object" && args?.name) {
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

  // in each case, add base URL
  urlToPush = addBaseToUrl(
    urlToPush,
    // compile base if contains lang params
    compileUrl(base, { lang: Routers.langService?.currentLang.key })
  );
  return urlToPush;
}

// ----------------------------------------------------------------------------- PATHS

/**
 * Get current lang path by Lang
 *
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
export function getLangPathByLang(
  route: TRoute,
  lang = Routers.langService?.currentLang.key
): string {
  let selectedPath: string;
  if (typeof route.path === "string") {
    selectedPath = route.path;
  } else if (typeof route.path === "object") {
    Object.keys(route.path).find((el) => {
      if (el === lang) selectedPath = route.path?.[el];
    });
  }
  return selectedPath;
}

/**
 * Get lang path by Lang
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

// ----------------------------------------------------------------------------- PATHS

/**
 * Join string paths array
 * @param paths
 * @param join
 */
export function joinPaths(paths: string[], join: string = ""): string {
  const preparePath = paths?.filter((str) => str).join(join);
  return preventSlashes(preparePath);
}

/**
 * Prevent Multi Slashes
 * ex:
 *  - '///foo/' will return '/foo/'
 * @param str
 */
export function preventSlashes(str: string): string {
  return str.replace(/(https?:\/\/)|(\/)+/g, "$1$2");
}

/**
 * Remove last caracter from string
 * @param str
 * @param lastChar
 * @param exeptIfStringIsLastChar if str is "/" and lastChar to remove is "/" do nothing
 */
export function removeLastCharFromString(
  str: string,
  lastChar: string,
  exeptIfStringIsLastChar = true
): string {
  if (exeptIfStringIsLastChar && str === lastChar) return str;
  if (str.endsWith(lastChar)) str = str.slice(0, -1);
  return str;
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

/**
 * add base to URL
 *
 * ex
 * before: "/foo"
 * after:  "/custom-base/foo"
 *
 * ex with lang "en"
 * before: "/en/foo"
 * after:  "/custom-base/en/foo"
 *
 * @param url
 * @param base
 */
export function addBaseToUrl(url: string, base = Routers.base): string {
  url = joinPaths([base === "/" ? "" : base, url]);
  return url;
}

/**
 * get URL without his base
 *
 * before: "/custom-base/foo"
 * after:  "/foo"
 *
 * @param path
 * @param base
 */
export function removeBaseToUrl(path: string, base: string): string {
  let baseStartIndex = path.indexOf(base);
  return baseStartIndex == 0 ? path.substr(base.length, path.length) : path;
}
