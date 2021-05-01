import { useHistory } from "..";
import React, {
  createContext,
  memo,
  ReactElement,
  useEffect,
  useReducer,
  useRef,
  useState,
} from "react";
import { createBrowserHistory } from "history";
import { buildUrl, joinPaths } from "../api/helpers";
import { Path } from "path-parser";

const componentName = "Router";
const debug = require("debug")(`router:${componentName}`);

export type TRoute = any;

interface IProps {
  base: string;
  routes?: TRoute[];
  middlewares?: any;
  children: ReactElement;
}

// Router instance will be keep on this context
// Big thing is you can access this context from the closest provider in the tree.
// This allow to manage easily nested stack instances.
const defaultRouterContext = {
  history: createBrowserHistory(),
  currentRoute: null,
  previousRoute: null,
  routeIndex: 0,
};

export const RouterContext = createContext(defaultRouterContext);
RouterContext.displayName = componentName;

/**
 * Router
 */
export const Router = memo((props: IProps) => {
  const [routeIndex, setRouteIndex] = useState<number>(0);
  const [currentRoute, setCurrentRoute] = useState(null);
  // FIXME, il y a un render de trop, la stack ne suit pas.
  // Mettre les deux states dans use Reducer ?
  const [previousRoute, setPreviousRoute] = useState(null);
  useEffect(() => {
    setRouteIndex(routeIndex + 1);
    setPreviousRoute(currentRoute);
  }, [currentRoute]);

  useEffect(() => {
    updateRoute();
  }, []);

  useHistory((e) => {
    updateRoute(e.location.pathname);
  });

  const updateRoute = (url = defaultRouterContext.history.location.pathname) => {
    const matchingRoute: TRoute = getRouteFromUrl(url);
    if (matchingRoute) {
      setCurrentRoute(matchingRoute);
    }
  };

  const getRouteFromUrl = (url) => {
    let match;
    for (let route of props.routes) {
      const currentRoutePath = joinPaths([props.base, route.path]);
      const pathParser: Path = new Path(currentRoutePath);
      // prettier-ignore
      debug(`getRouteFromUrl: url "${url}" match with "${currentRoutePath}"?`, !!pathParser.test(url));
      match = pathParser.test(url);
      if (match) {
        const params = match;
        const routeObj = {
          fullUrl: url,
          fullPath: currentRoutePath,
          matchUrl: buildUrl(route.path, params),
          path: route?.path,
          component: route?.component,
          children: route?.children,
          parser: pathParser,
          name: route?.name,
          props: {
            params,
            ...(route?.props || {}),
          },
        };
        debug("getRouteFromUrl: MATCH routeObj", routeObj);
        return routeObj;
      }
    }
  };

  return (
    <RouterContext.Provider
      children={props.children}
      value={{
        ...defaultRouterContext,
        currentRoute,
        previousRoute,
        routeIndex,
      }}
    />
  );
});

Router.displayName = componentName;
