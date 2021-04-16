import { RouterInstance, TRoute } from "./RouterInstance";
import { BrowserHistory, HashHistory, MemoryHistory } from "history";
export declare type TRoutersConfig = {
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
export declare const ROUTERS: TRoutersConfig;
