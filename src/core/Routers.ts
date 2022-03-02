import LangService from "./LangService";
import { BrowserHistory, HashHistory, MemoryHistory } from "history";
import { TRoute } from "../components/Router";

export type TRouters = {
  /**
   * Base URL
   */
  base: string;
  /**
   * Global routes list
   */
  routes: TRoute[];
  /**
   * Global browser history
   */
  history: HashHistory | MemoryHistory | BrowserHistory;

  /**
   * Global static location
   */
  staticLocation: string;
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
   * Store current route
   * Allows to always know what is last currentRoute path (for LangSerivce)
   */
  currentRoute: TRoute;

  /**
   * LangService instance (stored in Router)
   */
  langService: LangService;
};

/**
 * ROUTERS object allows to keep safe globales values between Routers instances
 * This object values do not depend of one single router
 */
export const Routers: TRouters = {
  base: undefined,
  routes: undefined,
  history: undefined,
  staticLocation: undefined,
  routeCounter: 1,
  isFirstRoute: true,
  currentRoute: undefined,
  langService: undefined,
};
