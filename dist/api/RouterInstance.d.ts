/// <reference types="node" />
import { Path } from "path-parser";
import React from "react";
import { EventEmitter } from "events";
import { BrowserHistory, HashHistory, MemoryHistory } from "history";
export declare type TRoute = {
    path: string;
    component: React.ComponentType<any>;
    name?: string;
    parser?: Path;
    props?: {
        [x: string]: any;
    };
    children?: TRoute[];
    matchUrl?: string;
    fullUrl?: string;
};
export declare enum EHistoryMode {
    BROWSER = "browser",
    HASH = "hash",
    MEMORY = "memory"
}
export declare enum ERouterEvent {
    PREVIOUS_ROUTE_CHANGE = "previous-route-change",
    CURRENT_ROUTE_CHANGE = "current-route-change",
    STACK_IS_ANIMATING = "stack-is-animating"
}
/**
 * RouterInstance
 */
export declare class RouterInstance {
    base: string;
    routes: TRoute[];
    middlewares: (e: any) => void[];
    events: EventEmitter;
    currentRoute: TRoute;
    previousRoute: TRoute;
    historyMode: EHistoryMode;
    protected unlistenHistory: any;
    id: number | string;
    constructor({ base, routes, middlewares, id, historyMode, }: {
        base?: string;
        routes?: TRoute[];
        middlewares?: (e: any) => void[];
        id?: number | string;
        historyMode: EHistoryMode;
    });
    /**
     * Initialise event
     */
    initEvents(): void;
    /**
     * Destroy events
     */
    destroyEvents(): void;
    /**
     * Select History mode
     * doc: https://github.com/ReactTraining/history/blob/master/docs/getting-started.md
     * @param historyMode
     */
    protected getHistory(historyMode: EHistoryMode): HashHistory | MemoryHistory | BrowserHistory;
    /**
     * Handle history
     * Call each time new event is fired by history
     */
    protected handleHistory: (param: string) => void;
    /**
     * Add new route object to routes array
     */
    protected addRoute(route: TRoute): void;
    /**
     * Update route
     * - get route object matching with current URL
     * - emit selected route object on route-change event (listen by Stack)
     */
    protected updateRoute(url?: string): void;
    /**
     * Get current route from URL using path-parser
     * @doc https://www.npmjs.com/package/path-parser
     */
    protected getRouteFromUrl({ pUrl, pRoutes, pBase, pCurrentRoute, pPathParser, pMatch, }: {
        pUrl: string;
        pRoutes?: TRoute[];
        pBase?: string;
        pCurrentRoute?: TRoute;
        pPathParser?: any;
        pMatch?: any;
    }): TRoute;
}
