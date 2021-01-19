import { Path } from "path-parser";
import { TRoute } from "./RouterInstance";
const debug = require("debug")("front:helpers");

export type TParams = { [x: string]: any };

export type TOpenRouteParams = {
  name: string;
  params?: TParams;
};

/**
 * Build an URL with path and params
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

  // join and format paths string array
  const formatPath = (paths: string[]): string => paths?.join("").replace("//", "/");

  for (let i in routes) {
    const route = routes[i];

    // if path match on first level
    if (route.path === path) {
      // keep path in local array
      localPath.push(route.path);
      // return it
      return formatPath(localPath);
    }

    // if not matching but as children, return it
    else if (route?.children?.length > 0) {
      // keep path in local array
      localPath.push(route.path);
      // no match, recall recursively on children
      return getUrlByPath(route.children, path, formatPath(localPath));
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
        // build URL with param and return
        return buildUrl(urlByPath, params.params);
      }

      // if route has children
      else if (route.children?.length > 0) {
        // getUrlByRouteName > no match, recall recursively on children
        return recursiveFn(route.children, params);
      }
    }
  };

  return recursiveFn(pRoutes, pParams);
}
