import { CreateRouter, TRoute, useRouter, langMiddleware } from "..";
import React, {
  createContext,
  memo,
  ReactElement,
  useEffect,
  useMemo,
  useState,
} from "react";
import { joinPaths } from "../api/helpers";
import { ROUTERS } from "../api/routers";
import { LangService } from "..";
import { getLangPathByPath } from "../lang/langHelpers";
import {
  BrowserHistory,
  createBrowserHistory,
  HashHistory,
  MemoryHistory,
} from "history";

const componentName = "Router";
const debug = require("debug")(`router:${componentName}`);

interface IProps {
  base: string;
  history?: BrowserHistory | HashHistory | MemoryHistory;
  children: ReactElement;
  // routes array is required for 1st instance only
  routes?: TRoute[];
  middlewares?: any[];
}

// Router instance will be keep on this context
// Big thing is you can access this context from the closest provider in the tree.
// This allow to manage easily nested stack instances.
export const RouterContext = createContext<CreateRouter>(null);
RouterContext.displayName = componentName;

/**
 * Router
 * This component returns children wrapped by provider who contains router instance
 */
export const Router = memo((props: IProps) => {
  // deduce a router ID
  const id = ROUTERS.instances?.length > 0 ? ROUTERS.instances.length + 1 : 1;
  // get parent router instance if exist, in case we are one sub router
  const parentRouter = useRouter();
  // get routes list by props first
  // if there is no props.routes, we deduce that we are on a subrouter
  const routes = useMemo(() => {
    let currentRoutesList: TRoute[];
    if (props.routes) {
      ROUTERS.routes = props.routes;
      currentRoutesList = props.routes;
    } else {
      currentRoutesList = ROUTERS.routes?.find((el) => {
        return (
          getLangPathByPath({ path: el.path }) === getLangPathByPath({ path: props.base })
        );
      })?.children;
      if (LangService.isInit) {
        // If sub router, need to selected appropriate route path by lang
        currentRoutesList = langMiddleware(currentRoutesList, false);
      }
    }
    return currentRoutesList;
  }, [props.routes, props.base]);

  const showLang = LangService.showLangInUrl();
  // join each parent router base
  const base = useMemo(() => {
    const parentBase: string = parentRouter?.base;
    const addLang: boolean = id !== 1 && showLang;
    const base: string = addLang ? getLangPathByPath({ path: props.base }) : props.base;
    return joinPaths([
      parentBase, // ex: /master-base
      addLang && "/:lang",
      base, // ex: "/about
    ]);
  }, [props.base]);

  // keep router instance in state
  const [routerState] = useState<CreateRouter>(() => {
    const newRouter = new CreateRouter({
      base,
      routes,
      id,
      middlewares: props.middlewares,
      history: props.history || createBrowserHistory(),
    });

    // keep new router in global constant
    ROUTERS.instances.push(newRouter);
    // return it as state
    return newRouter;
  });

  // on destroy, we need to remove this current router instance from ROUTERS.instances array
  // remove 1 element from specific index
  useEffect(() => {
    return () => {
      ROUTERS.instances.splice(
        ROUTERS.instances.findIndex((el) => el.id === routerState.id),
        1
      );
      routerState.destroyEvents();
    };
  }, [routerState]);

  return <RouterContext.Provider value={routerState} children={props.children} />;
});

Router.displayName = componentName;
