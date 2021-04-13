import { Path } from "path-parser";
import React from "react";
import { EventEmitter } from "events";
import { buildUrl, joinPaths } from "./helpers";
import { ROUTERS } from "./routers";
import {
  createBrowserHistory,
  createHashHistory,
  createMemoryHistory,
  BrowserHistory,
  HashHistory,
  MemoryHistory,
} from "history";

const debug = require("debug")("router:CreateRouter");

export type TRoute = {
  path: any;
  //| { [x: string]: string };
  component: React.ComponentType<any>;
  name?: string;
  parser?: Path;
  props?: {
    params?: { [x: string]: any };
    [x: string]: any;
  };
  children?: TRoute[]; // local match URL with params (needed by nested router)
  url?: string; // full URL who not depend of current instance
  fullUrl?: string; // full Path /base/:lang/foo/second-foo
  fullPath?: string;
  base?: string;
};

export enum EHistoryMode {
  BROWSER = "browser",
  HASH = "hash",
  MEMORY = "memory",
}

export enum ERouterEvent {
  PREVIOUS_ROUTE_CHANGE = "previous-route-change",
  CURRENT_ROUTE_CHANGE = "current-route-change",
  STACK_IS_ANIMATING = "stack-is-animating",
}

/**
 * RouterInstance
 */
export class CreateRouter {
  // base URL
  public base: string;
  // routes list
  public preMiddlewareRoutes: TRoute[] = [];
  public routes: TRoute[] = [];

  // middlewares list to exectute in specific order
  public middlewares: any[];

  // create event emitter
  public events: EventEmitter = new EventEmitter();

  // current / previous route object
  public currentRoute: TRoute;
  public previousRoute: TRoute;

  // history mode choice used by history library›
  public historyMode: EHistoryMode;

  // store history listener
  protected unlistenHistory;

  // router instance ID, useful for debug if there is multiple router instance
  public id: number | string;

  constructor({
    routes,
    middlewares,
    base = "/",
    id = 1,
    historyMode = EHistoryMode.BROWSER,
  }: {
    base?: string;
    routes: TRoute[];
    middlewares?: any[];
    id?: number | string;
    historyMode?: EHistoryMode;
  }) {
    this.base = base;
    this.id = id;
    this.middlewares = middlewares;
    this.historyMode = historyMode;

    if (!routes) {
      throw new Error(`Router id ${id} > no routes array is set.`);
    }

    if (!ROUTERS.history) {
      // create new history
      ROUTERS.history = this.getHistory(this.historyMode);
      // push first location history object in global locationsHistory
      ROUTERS.locationsHistory.push(ROUTERS.history.location);
    }

    // patch: create root route object with path '/' if doesn't exist
    const rootPathExist = routes.some((route) => route.path === "/");
    if (!rootPathExist) {
      routes.push({ path: "/", component: null });
    }

    // format routes
    this.preMiddlewareRoutes = routes;
    debug(this.id, "this.preMiddlewareRoutes", this.preMiddlewareRoutes);

    this.routes =
      this.middlewares?.reduce(
        (routes, middleware) => middleware(routes),
        this.preMiddlewareRoutes
      ) || this.preMiddlewareRoutes;
    debug(this.id, "this.routes", this.routes);

    this.updateRoute();
    this.initEvents();
  }

  /**
   * Initialise event
   */
  public initEvents() {
    this.unlistenHistory = ROUTERS.history.listen(({ location, action }) => {
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
   * Select History mode
   * doc: https://github.com/ReactTraining/history/blob/master/docs/getting-started.md
   * @param historyMode
   */
  protected getHistory(
    historyMode: EHistoryMode
  ): HashHistory | MemoryHistory | BrowserHistory {
    if (historyMode === EHistoryMode.BROWSER) {
      return createBrowserHistory();
    }
    if (historyMode === EHistoryMode.HASH) {
      return createHashHistory();
    }
    if (historyMode === EHistoryMode.MEMORY) {
      return createMemoryHistory();
    }
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
  protected updateRoute(
    url: string = ROUTERS.history.location.pathname
  ): { currentRoute: TRoute; previousRoute: TRoute } {
    // get matching route depending of current URL
    const matchingRoute: TRoute = this.getRouteFromUrl({ pUrl: url });

    // get not found route
    const notFoundRoute: TRoute = this.preMiddlewareRoutes.find(
      (el) => el.path === "/:rest" || el.component?.displayName === "NotFoundPage"
    );

    if (!matchingRoute && !notFoundRoute) {
      debug(this.id, "updateRoute: NO MATCHING ROUTE & NO NOTFOUND ROUTE. RETURN.");
      return;
    }

    if (this.currentRoute?.url != null && this.currentRoute?.url === matchingRoute?.url) {
      debug(this.id, "updateRoute: THIS IS THE SAME URL, RETURN.");
      return;
    }

    this.previousRoute = this.currentRoute;
    this.currentRoute = matchingRoute || notFoundRoute;

    this.events.emit(ERouterEvent.PREVIOUS_ROUTE_CHANGE, this.previousRoute);
    this.events.emit(ERouterEvent.CURRENT_ROUTE_CHANGE, this.currentRoute);

    return {
      currentRoute: this.currentRoute,
      previousRoute: this.previousRoute,
    };
  }

  /**
   * Get current route from URL using path-parser
   * @doc https://www.npmjs.com/package/path-parser
   */
  protected getRouteFromUrl({
    pUrl,
    pRoutes = this.routes,
    pBase = this.base,
    pCurrentRoute = null,
    pPathParser = null,
    pMatch = null,
  }: {
    pUrl: string;
    pRoutes?: TRoute[];
    pBase?: string;
    pCurrentRoute?: TRoute;
    pPathParser?: any;
    pMatch?: any;
  }): TRoute {
    if (!pRoutes || pRoutes?.length === 0) return;
    let match;

    // test each routes
    for (let i in pRoutes) {
      let currentRoute = pRoutes[i];
      // create parser & matcher
      const currentRoutePath = joinPaths([pBase, currentRoute.path]);
      // prepare parser
      const pathParser: Path = new Path(currentRoutePath);
      // prettier-ignore
      debug(this.id, `getRouteFromUrl: currentUrl "${pUrl}" match with "${currentRoutePath}"?`, !!pathParser.test(pUrl));
      // set new matcher
      match = pathParser.test(pUrl);
      // if current route path match with the param url
      if (match) {
        // prepare route obj
        const route = pCurrentRoute || currentRoute;
        const params = pMatch || match;
        const routeObj = {
          fullPath: currentRoutePath,
          path: route?.path,
          fullUrl: pUrl,
          url: buildUrl(route.path, params),
          base: pBase,
          component: route?.component,
          children: route?.children,
          parser: pPathParser || pathParser,
          name: route?.name || route?.component?.displayName,
          props: {
            params,
            ...(route?.props || {}),
          },
        };

        debug(this.id, "getRouteFromUrl: MATCH routeObj", routeObj);
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
          pPathParser: pathParser,
          pMatch: match,
        });

        debug(this.id, "matchingChildren", matchingChildren);

        // only if matching, return this match, else continue to next iteration
        if (matchingChildren) return matchingChildren;
      }
    }
  }
}
