import { RouterInstance } from "./RouterInstance";
import { BrowserHistory, createBrowserHistory } from "history";

export type TRoutersConfig = {
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
   */
  navigationHistory: any[];
};

export const ROUTERS: TRoutersConfig = {
  instances: [],
  history: createBrowserHistory(),
  navigationHistory: [],
};
