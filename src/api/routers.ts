import { RouterInstance, TRoute } from "./RouterInstance";
import { BrowserHistory } from "history";
import { HISTORY } from "./history";

export type TRoutersConfig = {
  /**
   * Global routes list
   */
  routes: TRoute[];
  /**
   * Routers instances list
   */
  instances: RouterInstance[];
  /**
   * Global browser history
   */
  history: BrowserHistory;
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
  routes: null,
  instances: [],
  history: HISTORY,
  locationsHistory: [HISTORY.location],
  routeCounter: 1,
  isFirstRoute: true,
};
