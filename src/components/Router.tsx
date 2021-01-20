import { RouterInstance, TRoute, useRouter } from "..";
import React, {
  createContext,
  memo,
  ReactElement,
  useEffect,
  useLayoutEffect,
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
  id?: number | string;
}

// Router instance will be keep on this context
// Big thing is you can access this context from the closest provider in the tree.
// This allow to manage easily nested stack instances.
export const RouterContext = createContext<RouterInstance>(null);
RouterContext.displayName = componentName;

// keep root router instance needed for some cases
export const rootRouter: { root: RouterInstance } = { root: undefined };

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

  // if there is no props "routes", we deduce that we are on a subrouter
  const routes = useMemo(
    () =>
      props.routes ||
      rootRouter?.root?.routes?.find((el) => el.path === props.base).children,
    [props.routes, props.base]
  );

  // keep routerManager instance
  const [routerManager] = useState<RouterInstance>(() => {
    const router = new RouterInstance({
      base,
      routes,
      id: props.id,
      middlewares: props.middlewares,
    });

    // keep root rooter instance reference in singleton
    if (rootRouter.root === undefined) {
      rootRouter.root = router;
    }
    return router;
  });

  useEffect(() => {
    return () => routerManager.destroyEvents();
  }, [routerManager]);

  return (
    <RouterContext.Provider value={routerManager}>
      {props.children}
    </RouterContext.Provider>
  );
});

Router.displayName = componentName;
