import { RouterInstance, TRoute } from "..";
import React, { ReactElement } from "react";
interface IProps {
    base: string;
    routes?: TRoute[];
    middlewares?: (e: any) => void[];
    children: ReactElement;
    environment?: ERouterEnvironment;
}
export declare enum ERouterEnvironment {
    BROWSER = "browser",
    HASH = "hash",
    MEMORY = "memory"
}
export declare const RouterContext: React.Context<RouterInstance>;
/**
 * Router
 * This component returns children wrapped by provider who contains router instance
 */
export declare const Router: React.MemoExoticComponent<(props: IProps) => JSX.Element>;
export {};
