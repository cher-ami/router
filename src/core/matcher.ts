import { compile, match } from "path-to-regexp";
import { joinPaths, removeLastCharFromString } from "./helpers";
import { TRoute } from "../components/Router";
import debug from "@wbe/debug";
const log = debug(`router:matcher`);

/**
 * Get notFoundRoute
 * @param routes
 * @returns TRoute
 */
export const getNotFoundRoute = (routes: TRoute[]): TRoute =>
  routes?.find(
    (el) => el.path === "/:rest" || el.component?.displayName === "NotFoundPage"
  );

type TGetRouteFromUrl = {
  pUrl: string;
  pRoutes?: TRoute[];
  pBase?: string;
  pCurrentRoute?: TRoute;
  pMatcher?: any;
  id?: number | string;
};

/**
 * Get current route from URL, using path-to-regex
 * @doc https://github.com/pillarjs/path-to-regexp
 */
export const getRouteFromUrl = ({
  pUrl,
  pRoutes,
  pBase,
  pMatcher,
  id,
}: TGetRouteFromUrl): TRoute => {
  if (!pRoutes || pRoutes?.length === 0) return;

  // keep first level current route.
  // this route object is obj to return even if URL match
  let firstLevelCurrentRoute = undefined;

  function next({ pUrl, pRoutes, pBase, pMatcher, id }: TGetRouteFromUrl): TRoute {
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
        const route = firstLevelCurrentRoute || currentRoute;
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
          action: route?.action,
          getStaticProps: route?.getStaticProps,
          props: {
            params,
            ...(route?.props || {}),
          },
        };

        log(id, "getRouteFromUrl: MATCH routeObj", routeObj);
        return routeObj;
      }

      // if not match
      else if (currentRoute?.children) {
        if (!firstLevelCurrentRoute) {
          firstLevelCurrentRoute = currentRoute;
        }

        // else, call recursively this same method with new params
        const matchingChildren = next({
          pUrl,
          id,
          pRoutes: currentRoute?.children,
          pBase: currentRoutePath, // parent base
          pCurrentRoute: firstLevelCurrentRoute || currentRoute,
          pMatcher: matcher,
        });

        // only if matching, return this match, else continue to next iteration
        if (matchingChildren) {
          return matchingChildren;
        } else {
          firstLevelCurrentRoute = undefined;
        }
      }
    }
  }

  return next({ pUrl, pRoutes, pBase, pMatcher, id });
};

/**
 * Get current Route
 * Will get route from URL and return notFound if exist
 * @param url
 * @param routes
 * @param base
 * @param langService
 */
export function getCurrentRoute({
  url,
  routes,
  notFoundRoute,
  base,
}: {
  url: string;
  routes: TRoute[];
  notFoundRoute: TRoute;
  base: string;
}): TRoute {
  const matchingRoute = getRouteFromUrl({
    pUrl: url,
    pBase: base,
    pRoutes: routes,
  });

  if (!matchingRoute && !notFoundRoute) {
    log("matchingRoute not found & 'notFoundRoute' not found, return.");
    return;
  }

  return matchingRoute || notFoundRoute;
}
