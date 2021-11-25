import React from "react";
import { compileUrl, joinPaths } from "./helpers";
import { Routers } from "./routers";
import debug from "@wbe/debug";
import { Match, match } from "path-to-regexp";

import {
  BrowserHistory,
  createBrowserHistory,
  HashHistory,
  MemoryHistory,
} from "history";

const componentName: string = "CreateRouter";
const log = debug(`router:${componentName}`);

export type TParams = {
  [x: string]: any;
};

export type TProps = {
  params?: TParams;
  [x: string]: any;
};

export type TPathLangObject = { [x: string]: string };

export type TRoute = {
  path: string | TPathLangObject;
  component?: React.ComponentType<any>;
  base?: string;
  name?: string;
  parser?: Match;
  props?: TProps;
  children?: TRoute[];
  url?: string;
  fullUrl?: string; // full URL who not depend of current instance
  fullPath?: string; // full Path /base/:lang/foo/second-foo
  langPath?: { [x: string]: string } | null;
};

/**
 * RouterInstance
 */
export class CreateRouter {
  // base URL
  public base: string;
  // before execute middleware routes list
  public preMiddlewareRoutes: TRoute[] = [];
  // routes list
  public routes: TRoute[] = [];
  // middlewares list to exectute in specific order
  public middlewares: any[];
  // previous route object
  public previousRoute: TRoute;
  // history mode choice used by history library›
  public history: BrowserHistory | HashHistory | MemoryHistory;
  // current route object
  public currentRoute: TRoute;
  // store history listener
  protected unlistenHistory;
  // router instance ID, useful for debug if there is multiple router instance
  public id: number | string;
  // dispatch new current route function
  protected setNewCurrentRoute: (newCurrentRoute: TRoute) => void;

  constructor({
    routes,
    middlewares,
    base = "/",
    id = 1,
    history,
    setNewCurrentRoute,
  }: {
    base?: string;
    routes: TRoute[];
    middlewares?: any[];
    id?: number | string;
    history?: BrowserHistory | HashHistory | MemoryHistory;
    setNewCurrentRoute?: (newRoute) => void;
  }) {
    this.base = base;
    this.id = id;
    this.middlewares = middlewares;
    this.history = history || createBrowserHistory();
    this.setNewCurrentRoute = setNewCurrentRoute;

    if (!routes) {
      throw new Error(`Router id ${id} > no routes array is set.`);
    }

    if (!Routers.history) {
      Routers.history = this.history;
      // push first location history object in global locationsHistory
      Routers.locationsHistory.push(Routers.history.location);
    }

    // add missing "/" route to routes list if doesn't exist
    this.preMiddlewareRoutes = this.patchMissingRootRoute(routes);
    log(this.id, "this.preMiddlewareRoutes", this.preMiddlewareRoutes);

    this.routes =
      this.middlewares?.reduce(
        (routes, middleware) => middleware(routes),
        this.preMiddlewareRoutes
      ) || this.preMiddlewareRoutes;
    log(this.id, "this.routes", this.routes);

    this.updateRoute();
    this.initEvents();
  }

  /**
   * Patch missing root route
   * add missing "/" route to routes list if doesn't exist
   * @param routes
   */
  protected patchMissingRootRoute(routes: TRoute[]): TRoute[] {
    const rootPathExist = routes.some(
      (route) =>
        (typeof route.path === "object" &&
          Object.keys(route.path).some((el) => route.path[el] === "/")) ||
        route.path === "/"
    );
    if (!rootPathExist) {
      routes.unshift({ path: "/", component: null });
    }
    return routes;
  }

  /**
   * Initialise event
   */
  public initEvents() {
    this.unlistenHistory = Routers.history.listen(({ location, action }) => {
      this.handleHistory(location.pathname);
    });
  }

  /**
   * Destroy events
   */
  public destroyEvents(): void {
    // To stop listening, call the function returned from listen().
    this.unlistenHistory();
  }

  /**
   * Handle history
   * Call each time new event is fired by history
   */
  protected handleHistory = (param: string): void => {
    this.updateRoute(param);
  };

  /**
   * Update route
   * - get route object matching with current URL
   * - emit selected route object on route-change event (listen by Stack)
   */
  protected updateRoute(url: string = Routers.history.location.pathname): {
    currentRoute: TRoute;
    previousRoute: TRoute;
  } {
    // get matching route depending of current URL
    const matchingRoute: TRoute = this.getRouteFromUrl({ pUrl: url });

    // get not found route
    const notFoundRoute: TRoute = this.preMiddlewareRoutes.find(
      (el) => el.path === "/:rest" || el.component?.displayName === "NotFoundPage"
    );

    if (!matchingRoute && !notFoundRoute) {
      log(this.id, "updateRoute: NO MATCHING ROUTE & NO NOTFOUND ROUTE. RETURN.");
      return;
    }

    if (this.currentRoute?.url != null && this.currentRoute?.url === matchingRoute?.url) {
      log(this.id, "updateRoute: THIS IS THE SAME URL, RETURN.");
      return;
    }

    this.previousRoute = this.currentRoute;
    this.currentRoute = matchingRoute || notFoundRoute;

    // dispatch current Route
    this.setNewCurrentRoute?.(matchingRoute || notFoundRoute);

    // only for test
    return {
      currentRoute: this.currentRoute,
      previousRoute: this.previousRoute,
    };
  }

  /**
   * Get current route from URL using path-to-regex
   * @doc https://github.com/pillarjs/path-to-regexp
   */
  protected getRouteFromUrl({
    pUrl,
    pRoutes = this.routes,
    pBase = this.base,
    pCurrentRoute = null,
    pMatcher = null,
  }: {
    pUrl: string;
    pRoutes?: TRoute[];
    pBase?: string;
    pCurrentRoute?: TRoute;
    pMatcher?: any;
  }): TRoute {
    if (!pRoutes || pRoutes?.length === 0) return;
    let matcher;

    // test each routes
    for (let currentRoute of pRoutes) {
      // create parser & matcher
      const currentRoutePath = joinPaths([pBase, currentRoute.path as string]);
      // prepare parser
      matcher = match(currentRoutePath)(pUrl);
      // prettier-ignore
      log(this.id, `"${pUrl}" match with "${currentRoutePath}"?`, !!matcher);
      // if current route path match with the param url
      if (matcher) {
        // prepare route obj
        const route = pCurrentRoute || currentRoute;
        const params = pMatcher?.params || matcher?.params;
        const routeObj = {
          fullPath: currentRoutePath,
          path: route?.path,
          fullUrl: pUrl,
          url: compileUrl(route.path as string, params),
          base: pBase,
          component: route?.component,
          children: route?.children,
          parser: pMatcher || matcher,
          langPath: route.langPath,
          name: route?.name || route?.component?.displayName,
          props: {
            params,
            ...(route?.props || {}),
          },
        };

        log(this.id, "getRouteFromUrl: MATCH routeObj", routeObj);
        return routeObj;
      }

      // if not match
      else if (currentRoute?.children) {
        // else, call recursively this same method with new params
        const matchingChildren = this.getRouteFromUrl({
          pUrl: pUrl,
          pRoutes: currentRoute?.children,
          pBase: currentRoutePath, // parent base
          pCurrentRoute: currentRoute,
          pMatcher: matcher,
        });

        log(this.id, "matchingChildren", matchingChildren);

        // only if matching, return this match, else continue to next iteration
        if (matchingChildren) return matchingChildren;
      }
    }
  }
}
