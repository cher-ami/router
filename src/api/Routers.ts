import { RouterManager, TRoute } from "./RouterManager";
import { Location, BrowserHistory, HashHistory, MemoryHistory } from "history";
import { createUrl, openRoute, TOpenRouteParams } from "./helpers";

export type TRoutersConfig = {
  /**
   * Base URL
   */
  base: string;
  /**
   * Routes givent to the router
   */
  preMiddlewareRoutes: TRoute[];
  /**
   * Global routes list
   */
  routes: TRoute[];
  /**
   * Routers instances list
   */
  instances: RouterManager[];
  /**
   * Global browser history
   */
  history: HashHistory | MemoryHistory | BrowserHistory;
  /**
   * GLobal navigation history list
   */
  locationsHistory: Location[];
  /**
   * Global route counter increment on each history push
   */
  routeCounter: number;
  /**
   * Global is first route state
   * Is first route is true if routerCounter === 1
   */
  isFirstRoute: boolean;
  /**
   * build URL method
   */
  createUrl: (args: string | TOpenRouteParams, availablesRoutes?: TRoute[]) => string;
  /**
   * Open route method
   */
  openRoute: (args: string | TOpenRouteParams, availablesRoutes?: TRoute[]) => void;
};

/**
 * ROUTERS object allows to keep safe globales values between Routers instances
 * This object values do not depend of one single router
 */
export const Routers: TRoutersConfig = {
  preMiddlewareRoutes: null,
  routes: null,
  instances: [],
  history: null,
  locationsHistory: [],
  routeCounter: 1,
  isFirstRoute: true,
  base: "/",
  createUrl,
  openRoute,
};

/**
 * Returns root router instance
 */
export const rootRouterInstance = (): RouterManager => Routers.instances?.[0];
