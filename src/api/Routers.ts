import { Location, BrowserHistory, HashHistory, MemoryHistory } from "history";
import { TRoute } from "../components/Router";
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
  instances: any[];
  /**
   * Global browser history
   */
  history: HashHistory | MemoryHistory | BrowserHistory;
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
  preMiddlewareRoutes: undefined,
  routes: undefined,
  instances: [],
  history: undefined,
  routeCounter: 1,
  isFirstRoute: true,
  base: undefined,
  createUrl,
  openRoute,
};
