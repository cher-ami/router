import { RouterManager, TRoute } from "./RouterManager";
import { BrowserHistory, HashHistory, MemoryHistory } from "history";
import { buildUrl, TOpenRouteParams } from "./helpers";


/**
 * TODO transformer cet objet en class pour avoir des propriété getter / setter protégées
 */

export type TRoutersConfig = {
  preMiddelwareRoutes: TRoute[];
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
  /**
   * build URL method
   */
  buildUrl: (args: string | TOpenRouteParams, availablesRoutes?: TRoute[]) => string;
};

/**
 * ROUTERS object allows to keep safe globales values between routers instances
 * This object values do not depend of one single router
 */
export const Routers: TRoutersConfig = {
  preMiddelwareRoutes: null,
  routes: null,
  instances: [],
  history: null,
  locationsHistory: [],
  routeCounter: 1,
  isFirstRoute: true,
  buildUrl,
};

/**
 * Returns root router instance
 */
export const rootRouterInstance = (): RouterManager => Routers.instances?.[0];
