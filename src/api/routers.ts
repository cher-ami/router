import { RouterInstance, TRoute } from "./RouterInstance";
import { BrowserHistory, createBrowserHistory } from "history";

export type TRoutersConfig = {
  /**
   * Keep global routes array
   */
  routes: TRoute[];
  /**
   * Keep routers instances in array
   */
  instances: RouterInstance[];
  /**
   * Create global browser history
   * doc: https://github.com/ReactTraining/history/blob/master/docs/getting-started.md
   */
  history: BrowserHistory;
  /**
   * keep navigation history array
   * TODO continue in use history
   */
  locationsHistory: any[];
  /**
   * Router counter increment in each history push
   * TODO continue in useRouteCounter
   */
  routeCounter: number;
  /**
   * Is first route is true if routerCounter === 1
   * TODO continue in useRouteCounter
   */
  isFirstRoute: boolean;
};

const browserHistory: BrowserHistory = createBrowserHistory();

export const ROUTERS: TRoutersConfig = {
  routes: null,
  instances: [],
  history: browserHistory,
  locationsHistory: [browserHistory.location],
  routeCounter: 1,
  isFirstRoute: true,
};
