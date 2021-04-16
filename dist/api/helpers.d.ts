import { TRoute } from "./RouterInstance";
export declare type TParams = {
    [x: string]: any;
};
export declare type TOpenRouteParams = {
    name: string;
    params?: TParams;
};
export declare function joinPaths(paths: string[]): string;
/**
 * Build an URL with path and params
 */
export declare function buildUrl(path: string, params?: TParams): string;
/**
 * Get URL by path
 *  if path "/foo" is a children of path "/bar", his full url is "/bar/foo"
 *  With "/foo" this function will return "/bar/foo"
 * @returns string
 */
export declare function getUrlByPath(routes: TRoute[], path: string, basePath?: string): string;
/**
 * Get URL by route name and params
 * @returns string
 */
export declare function getUrlByRouteName(pRoutes: TRoute[], pParams: TOpenRouteParams): string;
