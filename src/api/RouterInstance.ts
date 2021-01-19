import { Path } from "path-parser";
import React from "react";
import { EventEmitter } from "events";
import { buildUrl } from "./helpers";
import { history } from "./history";

const debug = require("debug")("front:RouterInstance");

export type TRoute = {
  path: string;
  component: React.ComponentType<any>;
  name?: string;

  parser?: Path;
  props?: { [x: string]: any };
  children?: TRoute[];
  // local match URL with params (needed by nested router)
  matchUrl?: string;
  // full URL who not depend of current instance
  fullUrl?: string;
};

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
  public routes: TRoute[] = [];

  public middlewares: (e: any) => void[];

  // create event emitter
  public events: EventEmitter = new EventEmitter();

  // current / previous route object
  public currentRoute: TRoute;
  public previousRoute: TRoute;

  // store history listener
  protected unlistenHistory;

  // router instance ID, useful for debug if there is multiple router instance
  public id: number | string;

  constructor({
    base = "/",
    routes = null,
    middlewares,
    id = 1,
  }: {
    base?: string;
    routes?: TRoute[];
    middlewares?: (e: any) => void[];
    fakeMode?: boolean;
    id?: number | string;
  }) {
    this.base = base;
    this.id = id;
    this.middlewares = middlewares;

    // patch: create root path '/' if doesn't exist
    const rootPathExist = routes.some((route) => route.path === "/");
    if (!rootPathExist) {
      routes.push({ path: "/", component: null });
    }

    // format routes
    routes.forEach((el: TRoute) => this.addRoute(el));

    // start
    this.updateRoute();
    this.initEvents();
  }

  /**
   * Initialise event
   */
  public initEvents() {
    this.unlistenHistory = history.listen(({ location, action }) => {
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
   * Handle history
   * Call each time new event is fired by history
   */
  protected handleHistory = (param: string): void => {
    this.updateRoute(param);
  };

  /**
   * Add new route object to routes array
   */
  protected addRoute(route: TRoute): void {
    this.routes.push({ ...route, parser: new Path(route.path) });
  }

  /**
   * Update route
   * - get route object matching with current URL
   * - emit selected route object on route-change event (listen by Stack)
   */
  protected updateRoute(url: string = history.location.pathname): void {
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

      // TODO appeler tous les middlewares ici pour patcher les routes
      // ex: language service devrait pouvoir patcher les routes une a une
      // this.middlewares.foreach(middleware =>  middleware(currentRoute) ) ...

      // create parser & matcher
      const currentRoutePath = `${pBase}${currentRoute.path}`.replace("//", "/");
      // prepare parser
      const pathParser: Path = new Path(currentRoutePath);
      // prettier-ignore
      debug(this.id, `getRouteFromUrl: currentUrl "${pUrl}" match with "${currentRoutePath}"?`, !!pathParser.test(pUrl));
      // set new matcher
      match = pathParser.test(pUrl) || null;
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

        // if not match
      } else {
        const children = currentRoute?.children;
        // if there is no child, continue to next iteration
        if (!children) continue;
        // else, call recursively this same method with new params
        return this.getRouteFromUrl({
          pUrl: pUrl,
          pRoutes: children,
          pBase: currentRoutePath, // parent base
          pCurrentRoute: currentRoute,
          pPathParser: pathParser,
          pMatch: match,
        });
      }
    }
  }
}
