import { RouterManager, TRoute } from "./RouterManager";
import { LangService, Routers } from "..";
import debug from "@wbe/debug";
import { compile } from "path-to-regexp";
import { rootRouterInstance } from "./Routers";

const componentName: string = "helpers";
const log = debug(`router:${componentName}`);

export type TParams = { [x: string]: any };

export type TOpenRouteParams = {
  name: string;
  params?: TParams;
};

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
 * Get URL by path part
 *  if path "/foo" is a children of path "/bar", his full url is "/bar/foo"
 *  With the second URL part "/foo", this function will returns "/bar/foo"
 * @returns string
 */
export function getUrlByPathPart(
  routes: TRoute[],
  path: string | { [x: string]: string },
  lang: string = LangService.currentLang?.key || undefined,
  basePath: string = null
): string {
  let localPath: string[] = [basePath];

  for (let route of routes) {
    const langPath = route.langPath?.[lang];
    const routePath = route.path as string;
    const pathMatch = langPath === path || routePath === path;

    // if path match on first level, keep path in local array and return it, stop here.
    if (pathMatch) {
      localPath.push(langPath || routePath);
      return joinPaths(localPath);
    }

    // if not matching but as children, return it
    else if (route?.children?.length > 0) {
      // no match, recall recursively on children
      const matchChildrenPath = getUrlByPathPart(
        route.children,
        path,
        lang,
        joinPaths(localPath)
      );
      // return recursive Fn only if match, else continue to next iteration
      if (matchChildrenPath) {
        // keep path in local array
        localPath.push(langPath || routePath);
        // Return the function after localPath push
        return getUrlByPathPart(route.children, path, lang, joinPaths(localPath));
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
  const recursiveFn = (routes: TRoute[], params: TOpenRouteParams): string => {
    for (let route of routes) {
      const match =
        route?.name === params.name || route.component?.displayName === params.name;
      if (match) {
        if (!route?.path) {
          log("getUrlByRouteName > There is no route with this name, exit", params.name);
          return;
        }
        // get full URL
        const urlByPath = getUrlByPathPart(pRoutes, route.path, pParams?.params?.lang);
        // build URL with param and return
        return compileUrl(urlByPath, params.params);
      }

      // if route has children
      else if (route.children?.length > 0) {
        // getUrlByRouteName > no match, recall recursively on children
        const match = recursiveFn(route.children, params);
        // return recursive Fn only if match, else, continue to next iteration
        if (match) return match;
      }
    }
  };

  return recursiveFn(pRoutes, pParams);
}

/**
 * createUrl URL for setlocation
 * (Get URL to push in history)
 *
 * @param args can be string or TOpenRouteParams object
 * @param availablesRoutes
 */
export function createUrl(
  args: string | TOpenRouteParams,
  availablesRoutes = Routers?.routes,
  base: string = Routers?.base
): string {
  if (!availablesRoutes) return;
  let urlToPush: string;

  // in case we recieve a string
  if (typeof args === "string") {
    urlToPush = args as string;
    urlToPush = addLangToUrl(urlToPush);

    // in case we recieve an object
  } else if (typeof args === "object" && args?.name) {
    if (LangService.isInit && !args.params?.lang) {
      args.params = {
        ...args.params,
        ...{ lang: LangService.currentLang.key },
      };
    }
    // Get URL by the route name
    urlToPush = getUrlByRouteName(availablesRoutes, args);

    // in other case return.
  } else {
    console.warn("setLocation param isn't valid. return.", args);
    return;
  }

  // in each case, add base URL
  urlToPush = addBaseToUrl(urlToPush, base);
  return urlToPush;
}

/**
 * openRoute push a route in history
 *  the Stack component will render the new route
 * @param args can be string or TOpenRouteParams object
 * @param availablesRoutes
 */
export function openRoute(args: string | TOpenRouteParams, availablesRoutes?: TRoute[]) {
  const url = typeof args === "string" ? args : createUrl(args, availablesRoutes);
  if (Routers.history) {
    Routers.history.push(url);
  }
}

/**
 * Prepare set location **FULL** URL
 * Result URL of each Routers
 *
 * ex:
 *   "/base/en/foo-en-path/sub-en-path"
 * should become:
 *   "/base/fr/foo-fr-path/sub-fr-path"
 *
 */
export function prepareSetLocationFullUrl(
  toLang,
  instances: RouterManager[] = Routers.instances
): string {
  let pathToGenerate = [];

  for (let instance of instances) {
    if (instance?.currentRoute) {
      const newUrl = createUrl({
        name: instance.currentRoute.name,
        params: {
          ...(instance.currentRoute.props?.params || {}),
          lang: toLang.key,
        },
      });
      pathToGenerate.push(newUrl);
    }
  }
  // get last item of array
  return pathToGenerate.filter((v) => v).slice(-1)[0];
}

// ----------------------------------------------------------------------------- UTILS

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
  if (!str || str === "") {
    log("str ", str);
  }
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
  lang: string = LangService.currentLang?.key,
  enable = LangService.showLangInUrl()
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
export function addBaseToUrl(url: string, base = Routers?.base): string {
  log("base", base);
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
