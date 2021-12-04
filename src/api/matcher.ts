import { compile, match } from "path-to-regexp";
import debug from "@wbe/debug";

import { joinPaths, removeLastCharFromString } from "./helpers";
import { TRoute } from "../components/Router";
const log = debug(`router:matcher`);

/**
 * Get notFoundRoute
 * @param routes
 * @returns TRoute
 */
export const getNotFoundRoute = (routes: TRoute[]): TRoute =>
  routes.find(
    (el) => el.path === "/:rest" || el.component?.displayName === "NotFoundPage"
  );

/**
 * Get current route from URL, using path-to-regex
 * @doc https://github.com/pillarjs/path-to-regexp
 */
export const getRouteFromUrl = ({
  pUrl,
  pRoutes,
  pBase,
  pCurrentRoute = null,
  pMatcher = null,
}: {
  pUrl: string;
  pRoutes?: TRoute[];
  pBase?: string;
  pCurrentRoute?: TRoute;
  pMatcher?: any;
}): TRoute => {
  if (!pRoutes || pRoutes?.length === 0) return;

  // test each routes
  for (let currentRoute of pRoutes) {
    // create parser & matcher
    const currentRoutePath = removeLastCharFromString(
      joinPaths([pBase, currentRoute.path as string]),
      "/"
    );
    const matcher = match(currentRoutePath)(pUrl);
    log(`"${pUrl}" match with "${currentRoutePath}"?`, !!matcher);

    // if current route path match with the param url
    if (matcher) {
      // prepare route obj
      const route = pCurrentRoute || currentRoute;
      const params = pMatcher?.params || matcher?.params;
      const routeObj = {
        fullPath: currentRoutePath,
        path: route?.path,
        fullUrl: pUrl,
        url: compile(route.path)(params),
        base: pBase,
        component: route?.component,
        children: route?.children,
        parser: pMatcher || matcher,
        langPath: route?.langPath,
        name: route?.name || route?.component?.displayName,
        props: {
          params,
          ...(route?.props || {}),
        },
      };

      log("getRouteFromUrl: MATCH routeObj", routeObj);
      return routeObj;
    }

    // if not match
    else if (currentRoute?.children) {
      // else, call recursively this same method with new params
      const matchingChildren = getRouteFromUrl({
        pUrl: pUrl,
        pRoutes: currentRoute?.children,
        pBase: currentRoutePath, // parent base
        pCurrentRoute: currentRoute,
        pMatcher: matcher,
      });

      log("matchingChildren", matchingChildren);

      // only if matching, return this match, else continue to next iteration
      if (matchingChildren) return matchingChildren;
    }
  }
};
