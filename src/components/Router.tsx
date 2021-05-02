import { useHistory, useRouter } from "..";
import React, { createContext, memo, ReactElement, useEffect, useReducer } from "react";
import {
  BrowserHistory,
  createBrowserHistory,
  HashHistory,
  MemoryHistory,
} from "history";
import { buildUrl, joinPaths } from "../api/helpers";
import { Path } from "path-parser";

export type TRoute = any;

interface IProps {
  base: string;
  routes?: TRoute[];
  middlewares?: any;
  history?: BrowserHistory | HashHistory | MemoryHistory;
  children: ReactElement;
}

const componentName = "Router";
const debug = require("debug")(`router:${componentName}`);

const ROUTER = {
  history: null,
};

/**
 * Context store
 *
 *
 */
// Router instance will be keep on this context
// Big thing is you can access this context from the closest provider in the tree.
// This allow to manage easily nested stack instances.
const defaultRouterContext = {
  history: createBrowserHistory(),
  currentRoute: null,
  previousRoute: null,
  routeIndex: 0,
  unmountPreviousPage: () => {},
  previousPageIsMount: false,
};

export const RouterContext = createContext(defaultRouterContext);
RouterContext.displayName = componentName;

/**
 * Routes Reducer
 *
 *
 *
 */
export type TRouteReducerState = {
  currentRoute: TRoute;
  previousRoute: TRoute;
  previousPageIsMount: boolean;
  index: number;
};
const initialState: TRouteReducerState = {
  currentRoute: null,
  previousRoute: null,
  previousPageIsMount: true,
  index: 0,
};

export type TRouteReducerActionType = "update-current-route" | "unmount-previous-page";
const reducer = (
  state: TRouteReducerState,
  action: { type: TRouteReducerActionType; value: TRoute }
) => {
  switch (action.type) {
    case "update-current-route":
      return {
        previousRoute: state.currentRoute,
        currentRoute: action.value,
        index: state.index + 1,
        previousPageIsMount: true,
      };
    case "unmount-previous-page":
      return { ...state, previousPageIsMount: !action.value };
  }
};

/**
 * Router
 *
 *
 * Main Router component
 * Wrap Stack and Link Component
 *
 */

// const defaultProps = {
//   base: "/",
//   history: createBrowserHistory(),
//   children: null,
// };

const Router = (props: IProps) => {
  const parentrouter = useRouter();
  const [routesState, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    debug("parent router history", parentrouter.history);
  }, [parentrouter]);

  // init first route listenning
  useEffect(() => {
    updateRoute(parentrouter.history.location.pathname);
  }, []);

  useHistory(
    (event) => {
      updateRoute(event.location.pathname);
      debug("use hISTORY ---------- ", event);
    },
    [routesState]
  );

  const unmountPreviousPage = (): void => {
    dispatch({ type: "unmount-previous-page", value: true });
  };

  const getNotFoundRoute = (routes = props.routes): TRoute =>
    routes.find(
      (el) => el.path === "/:rest" || el.component?.displayName === "NotFoundPage"
    );

  /**
   * Update Route
   */
  const updateRoute = (
    url = defaultRouterContext.history.location.pathname,
    matchingRoute = getRouteFromUrl({ url }),
    notFoundRoute = getNotFoundRoute()
  ) => {
    if (!matchingRoute && !notFoundRoute) {
      debug("updateRoute: NO MATCHING ROUTE & NO NOTFOUND ROUTE. RETURN.");
      return;
    }
    if (
      routesState.currentRoute?.matchUrl != null &&
      routesState.currentRoute?.matchUrl === matchingRoute?.matchUrl
    ) {
      debug("updateRoute: THIS IS THE SAME URL, RETURN.");
      return;
    }
    if (matchingRoute) {
      dispatch({ type: "update-current-route", value: matchingRoute });
    }
  };

  /**
   * Get route from URL
   */
  const getRouteFromUrl = ({
    url,
    routes = props.routes,
    base = props.base,
    pRoute = null,
    pPathParser = null,
    pMatch = null,
  }) => {
    let match;
    for (let route of routes) {
      const currentRoutePath = joinPaths([base, route.path]);
      const pathParser: Path = new Path(currentRoutePath);
      // debug(
      //   `getRouteFromUrl: url "${url}" match with "${currentRoutePath}"?`,
      //   !!pathParser.test(url)
      // );
      match = pathParser.test(url);

      if (match) {
        const current = pRoute || route;
        const params = pMatch || match;
        const routeObj = {
          fullUrl: url,
          fullPath: currentRoutePath,
          matchUrl: buildUrl(current.path, params),
          path: current?.path,
          component: current?.component,
          children: current?.children,
          parser: pPathParser || pathParser,
          name: current?.name || current?.component?.displayName,
          props: {
            params,
            ...(current?.props || {}),
          },
        };
        debug("getRouteFromUrl: MATCH routeObj", routeObj);
        return routeObj;
      }

      // if not match
      else if (route?.children) {
        // else, call recursively this same method with new params
        const matchingChildren = getRouteFromUrl({
          url,
          routes: route.children,
          base: currentRoutePath,
          pRoute: route,
          pPathParser: pathParser,
          pMatch: match,
        });

        debug("matchingChildren", matchingChildren);
        // only if matching, return this match, else continue to next iteration
        if (matchingChildren) return matchingChildren;
      }
    }
  };

  return (
    <RouterContext.Provider
      children={props.children}
      value={{
        ...defaultRouterContext,
        history: parentrouter.history || props.history,
        currentRoute: routesState.currentRoute,
        previousRoute: routesState.previousRoute,
        routeIndex: routesState.index,
        unmountPreviousPage,
        previousPageIsMount: routesState.previousPageIsMount,
      }}
    />
  );
};

Router.displayName = componentName;
export { Router };
