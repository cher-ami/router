import { RouterInstance, TRoute } from "..";
import React, { createContext, memo, ReactElement, useEffect, useState } from "react";

const componentName = "Router";
const debug = require("debug")(`front:${componentName}`);

interface IProps {
  base: string;
  routes: TRoute[];
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
export const rootRouter = { root: undefined };

/**
 * Router
 * This component returns children wrapped by provider who contains router instance
 * (will wrap Link and Stack components)
 */
export const Router = memo((props: IProps) => {
  // keep routerManager instance
  const [routerManager] = useState<RouterInstance>(() => {
    const router = new RouterInstance({
      base: props.base,
      routes: props.routes,
      middlewares: props.middlewares,
      id: props.id,
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
