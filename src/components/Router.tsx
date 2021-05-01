import { useHistory } from "..";
import React, { createContext, memo, ReactElement, useEffect, useReducer } from "react";
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

/**
 * Context store
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
// prettier-ignore
export const Router = memo((props: IProps) => {

  const [routesState, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    updateRoute(defaultRouterContext.history.location.pathname);
  }, []);

  useHistory((event) => {
      updateRoute(event.location.pathname);
    }, [routesState]
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
    matchingRoute = getRouteFromUrl(url),
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
   * @param url
   */
  const getRouteFromUrl = (url:string) => {
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
            ...(route?.props || {})
          }
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
        currentRoute: routesState.currentRoute,
        previousRoute: routesState.previousRoute,
        routeIndex: routesState.index,
        unmountPreviousPage,
        previousPageIsMount: routesState.previousPageIsMount
      }}
    />
  );
});

Router.displayName = componentName;
