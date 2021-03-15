import { Path } from "path-parser";
import React from "react";
import { EventEmitter } from "events";
import { buildUrl } from "./helpers";
import { ROUTERS } from "./routers";
import {
  createBrowserHistory,
  createHashHistory,
  createMemoryHistory,
  BrowserHistory,
  HashHistory,
  MemoryHistory,
} from "history";

const debug = require("debug")("router:RouterInstance");

export type TRoute = {
  path: string;
  component: React.ComponentType<any>;
  name?: string;
  parser?: Path;
  props?: {
    params?: { [x: string]: any };
    [x: string]: any;
  };
  children?: TRoute[];
  // local match URL with params (needed by nested router)
  matchUrl?: string;
  // full URL who not depend of current instance
  fullUrl?: string;
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
export class RouterInstance {
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
    base = "/",
    routes = null,
    middlewares,
    id = 1,
    historyMode,
  }: {
    base?: string;
    routes?: TRoute[];
    middlewares?: any[];
    id?: number | string;
    historyMode: EHistoryMode;
  }) {
    this.base = base;
    this.id = id;
    this.middlewares = middlewares;
    this.historyMode = historyMode;

    if (!routes) {
      throw new Error(`Router id ${id} > no routes array is set.`);
    }

    if (!ROUTERS.history) {
      debug("No ROUTERS.history exist, create a new one", this.historyMode);
      ROUTERS.history = this.getHistory(this.historyMode);

      // push first location history object in global locationsHistory
      ROUTERS.locationsHistory.push(ROUTERS.history.location);
    }

    // patch: create root path '/' if doesn't exist
    const rootPathExist = routes.some((route) => route.path === "/");
    if (!rootPathExist) {
      routes.push({ path: "/", component: null });
    }

    // format routes
    this.preMiddlewareRoutes = routes.map((route: TRoute) => ({
      ...route,
      parser: new Path(route.path),
    }));
    debug(this.id, "this.preMiddlewareRoutes", this.preMiddlewareRoutes);

    // ex: language service devrait pouvoir patcher les routes une a une
    // prettier-ignore
    this.routes =
      this.middlewares?.reduce((routes, middleware) => middleware(routes), this.preMiddlewareRoutes)
      || this.preMiddlewareRoutes;
    debug(this.id, "this.routes", this.routes);

    this.updateRoute();
    this.initEvents();
  }

  /**
   * Initialise event
   */
  public initEvents() {
    this.unlistenHistory = ROUTERS.history.listen(({ location, action }) => {
      debug(this.id, " initEvents > history", { location, action });
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
    if (historyMode === EHistoryMode.HASH) {
      return createHashHistory();
    }
    if (historyMode === EHistoryMode.MEMORY) {
      return createMemoryHistory();
    }
    if (historyMode === EHistoryMode.BROWSER) {
      return createBrowserHistory();
    }

    // in other case, return a browser history
    return createBrowserHistory();
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
  protected updateRoute(url: string = ROUTERS.history.location.pathname): void {
    // get matching route depending of current URL
    const matchingRoute: TRoute = this.getRouteFromUrl({ pUrl: url });

    if (!matchingRoute) {
      debug(this.id, "updateRoute: NO MATCHING ROUTE. RETURN.");
      return;
    }

    if (this.currentRoute?.matchUrl === matchingRoute?.matchUrl) {
      debug(this.id, "updateRoute > THIS IS THE SAME URL, RETURN.");
      return;
    }

    this.previousRoute = this.currentRoute;
    this.currentRoute = matchingRoute;

    this.events.emit(ERouterEvent.PREVIOUS_ROUTE_CHANGE, this.previousRoute);
    this.events.emit(ERouterEvent.CURRENT_ROUTE_CHANGE, this.currentRoute);
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
      const currentRoutePath = `${pBase}${currentRoute.path}`.replace("//", "/");
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
          fullUrl: pUrl,
          matchUrl: buildUrl(route.path, params),
          path: route?.path,
          component: route?.component,
          children: route?.children,
          parser: pPathParser || pathParser,
          props: {
            params,
            ...(route?.props || {}),
          },
        };

        debug(this.id, "getRouteFromUrl: > MATCH routeObj", routeObj);
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
