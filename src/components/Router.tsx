import { RouterInstance, TRoute, useRouter } from "..";
import React, {
  createContext,
  memo,
  ReactElement,
  useEffect,
  useMemo,
  useState,
} from "react";
import { joinPaths } from "../api/helpers";

const componentName = "Router";
const debug = require("debug")(`front:${componentName}`);

interface IProps {
  base: string;
  // routes array is required for 1st instance only
  routes?: TRoute[];
  middlewares?: (e: any) => void[];
  children: ReactElement;
}

// Router instance will be keep on this context
// Big thing is you can access this context from the closest provider in the tree.
// This allow to manage easily nested stack instances.
export const RouterContext = createContext<RouterInstance>(null);
RouterContext.displayName = componentName;

// keep router instance needed for some cases
export const ROUTERS: RouterInstance[] = [];

/**
 * Router
 * This component returns children wrapped by provider who contains router instance
 * (will wrap Link and Stack components)
 */
export const Router = memo((props: IProps) => {
  // get parent router instance if exist, in case we are one sub router
  const parentRouter = useRouter();

  // we need to join each parent router base
  const base = useMemo(() => joinPaths([parentRouter?.base, props.base]), [props.base]);

  // prepare routes list
  const routes = useMemo(() => {
    // get routes list by props first
    return (
      props.routes ||
      // if there is no props.routes, we deduce that we are on a subrouter
      ROUTERS?.[0]?.routes?.find((el) => el.path === props.base).children
    );
  }, [props.routes, props.base]);

  // deduce router ID
  const id = ROUTERS?.length > 0 ? ROUTERS.length + 1 : 1;

  // keep router instance in state
  const [routerState] = useState<RouterInstance>(() => {
    const newRouter = new RouterInstance({
      base,
      routes,
      id,
      middlewares: props.middlewares,
    });

    // keep new router in global constant
    ROUTERS.push(newRouter);

    // return it as state
    return newRouter;
  });

  useEffect(() => {
    debug(`${componentName} > routers array`, ROUTERS);

    // on destroy, we need to remove this current router instance from ROUTERS array
    return () => {
      // remove 1 element from specific index
      ROUTERS.splice(
        ROUTERS.findIndex((el) => el.id === routerState.id),
        1
      );
      debug(`${componentName} > routers array after splice`, ROUTERS);

      // stop to listen events
      routerState.destroyEvents();
    };
  }, [routerState]);

  return <RouterContext.Provider value={routerState} children={props.children} />;
});

Router.displayName = componentName;
