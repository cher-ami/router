import { Path } from "path-parser";
import { TRoute } from "./RouterInstance";
import LanguagesService from "../languages/LanguagesService";
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
 */
export function joinPaths(paths: string[]): string {
  return paths
    ?.filter((e) => e)
    .join("")
    .replace("//", "/");
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
  path: string,
  basePath: string = null
): string {
  // prepare local path
  let localPath: string[] = [basePath];

  for (let i in routes) {
    const route = routes[i];

    // if path match on first level
    if (route.path === path) {
      // keep path in local array
      localPath.push(route.path);
      // return it
      return joinPaths(localPath);
    }

    // if not matching but as children, return it
    else if (route?.children?.length > 0) {
      // no match, recall recursively on children
      const matchChildrenPath = getUrlByPath(route.children, path, joinPaths(localPath));

      debug("getUrlByPath > match children path", matchChildrenPath);
      // return recursive Fn only if match, else continue to next iteration
      if (matchChildrenPath) {
        // keep path in local array
        localPath.push(route.path);
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
    for (let i in routes) {
      const route = routes[i];

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
        debug("getUrlByRouteName > urlByPath", urlByPath);

        // build URL with param and return
        const url = buildUrl(urlByPath, params.params);
        debug("getUrlByRouteName > url", url);
        return url;
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
 */
export const addLangToUrl = (
  url: string,
  lang: string = LanguagesService.currentLanguage?.key
): string => {
  if (!lang) return url;
  url = `/${lang}${url === "/" ? "" : url}`;
  debug("url w/ lang", url);
  return url;
};

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
export const addBaseToUrl = (url: string, base = useRootRouter().base): string => {
  url = joinPaths([base === "/" ? "" : base, url]);
  debug("url w/ base", url);
  return url;
};

/**
 * Format URL allow to prepare URL string before history push
 * add base and lang to string URL
 *
 * ex
 * before: "/foo"
 * after:  "/{base}/{lang}/foo"
 *
 * @param url
 */
export const formatUrl = (url: string): string => {
  // add language to URL (if language service is set)
  url = addLangToUrl(url);
  // add base to URL
  url = addBaseToUrl(url);
  return url;
};
