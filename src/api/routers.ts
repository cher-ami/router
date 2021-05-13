import { CreateRouter, TRoute } from "./CreateRouter";
import { BrowserHistory, HashHistory, MemoryHistory } from "history";

export type TRoutersConfig = {

  preMiddelwareRoutes: TRoute[]
  /**
   * Global routes list
   */
  routes: TRoute[];
  /**
   * Routers instances list
   */
  instances: CreateRouter[];
  /**
   * Global browser history
   */
  history: HashHistory | MemoryHistory | BrowserHistory;
  /**
   * GLobal navigation history list
   */
  locationsHistory: any[];
  /**
   * Global route counter increment on each history push
   */
  routeCounter: number;
  /**
   * Global is first route state
   * Is first route is true if routerCounter === 1
   */
  isFirstRoute: boolean;
};

/**
 * ROUTERS object allows to keep safe globales values between routers instances
 * This object values do not depend of one single router
 */
export const ROUTERS: TRoutersConfig = {
  preMiddelwareRoutes: null,
  routes: null,
  instances: [],
  history: null,
  locationsHistory: [],
  routeCounter: 1,
  isFirstRoute: true,
};
