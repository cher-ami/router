import { Path } from "path-parser";
import { TRoute } from "./CreateRouter";
import { LangService } from "..";
import { useRootRouter } from "../hooks/useRouter";
const debug = require("debug")("router:helpers");

export type TParams = { [x: string]: any };

export type TOpenRouteParams = {
  name: string;
  params?: TParams;
};

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
 * Build an URL with path and params via PathParser
 */
export function buildUrl(path: string, params?: TParams): string {
  const newPath = new Path(path);
  return newPath.build(params);
}

/**
 * Get URL by path
 *  if path "/foo" is a children of path "/bar", his full url is "/bar/foo"
 *  With "/foo" this function will return "/bar/foo"
 * @returns string
 */
export function getUrlByPath(
  routes: TRoute[],
  path: string | { [x: string]: string },
  basePath: string = null
): string {
  // prepare local path
  let localPath: string[] = [basePath];

  for (let route of routes) {
    const routePath =
      route.langPath?.[LangService.currentLang?.key] ||
      route.path;

    const oneMatch = Object.keys(route.langPath).some(l => route.langPath[l] === path)
     if (oneMatch) {
       debug('route> true')
     }

    debug("route>", route, path)
    // if path match on first level
    if (oneMatch) {
      // keep path in local array
      localPath.push(routePath);
      // return it
      return joinPaths(localPath);
    }

    // if not matching but as children, return it
    else if (route?.children?.length > 0) {
      // no match, recall recursively on children
      const matchChildrenPath = getUrlByPath(route.children, path, joinPaths(localPath));
      // return recursive Fn only if match, else continue to next iteration
      if (matchChildrenPath) {
        // keep path in local array
        localPath.push(routePath);
        // Return the function after localPath push
        return getUrlByPath(route.children, path, joinPaths(localPath));
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
          debug(
            "getUrlByRouteName > There is no route with this name, exit",
            params.name
          );
          return;
        }
        // get full URL
        const urlByPath = getUrlByPath(pRoutes, route.path);
        // build URL with param and return
        return buildUrl(urlByPath, params.params);
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
export function addBaseToUrl(url: string, base = useRootRouter()?.base): string {
  url = joinPaths([base === "/" ? "" : base, url]);
  return url;
}

/**
 * Return path without his base
 * @param path
 * @param base
 */
export function extractPathFromBase(path: string, base: string): string {
  let baseStartIndex = path.indexOf(base);
  return baseStartIndex == 0 ? path.substr(base.length, path.length) : path;
}
