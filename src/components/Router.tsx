import React from "react";
import {
  BrowserHistory,
  createBrowserHistory,
  HashHistory,
  MemoryHistory,
} from "history";
import debug from "@wbe/debug";
import { getNotFoundRoute, getRouteFromUrl } from "../api/matcher";
import { Match } from "path-to-regexp";
import { Routers } from "..";

export type TRoute = {
  path: string;
  component?: React.ComponentType<any>;
  base?: string;
  name?: string;
  parser?: Match;
  props?: { [x: string]: any };
  children?: TRoute[];
  url?: string;
  fullUrl?: string; // full URL who not depend of current instance
  fullPath?: string; // full Path /base/:lang/foo/second-foo
  langPath?: { [x: string]: string } | null;
};

export interface IRouterContextStackStates {
  unmountPreviousPage?: () => void;
  previousPageIsMount?: boolean;
}

export interface IRouterContext extends IRouterContextStackStates {
  base: string;
  routes: TRoute[];
  history: BrowserHistory | HashHistory | MemoryHistory;
  currentRoute: TRoute;
  previousRoute: TRoute;
  routeIndex: number;
  previousPageIsMount: boolean;
  unmountPreviousPage: () => void;
}

export type TRouteReducerState = {
  currentRoute: TRoute;
  previousRoute: TRoute;
  previousPageIsMount: boolean;
  index: number;
};

const componentName = "Router";
const log = debug(`router:${componentName}`);

/**
 * Router Context
 * Router instance will be keep on this context
 * Big thing is you can access this context from the closest provider in the tree.
 * This allow to manage easily nested stack instances.
 */
export const RouterContext = React.createContext({
  base: "/",
  routes: undefined,
  history: undefined,
  currentRoute: undefined,
  previousRoute: undefined,
  routeIndex: 0,
  previousPageIsMount: true,
  unmountPreviousPage: () => {},
});

const reducer = (
  state,
  action: { type: "update-current-route" | "unmount-previous-page"; value?: any }
) => {
  switch (action.type) {
    case "update-current-route":
      return {
        ...state,
        previousRoute: state.currentRoute,
        currentRoute: action.value,
        routeIndex: state.routeIndex + 1,
        previousPageIsMount: true,
      };
    case "unmount-previous-page":
      return { ...state, previousPageIsMount: false };
  }
};

/**
 * Router start
 */
function Router({
  children,
  routes,
  base = "/",
  history = createBrowserHistory(),
}: {
  children: React.ReactNode;
  routes: TRoute[];
  base: string;
  history?: BrowserHistory | HashHistory | MemoryHistory;
}): JSX.Element {
  if (!Routers.routes) Routers.routes = routes;
  if (!Routers.base) Routers.base = base;
  if (!Routers.history) Routers.history = history;

  const [reducerState, dispatch] = React.useReducer(reducer, {
    currentRoute: undefined,
    previousRoute: undefined,
    previousPageIsMount: false,
    routeIndex: 0,
  });

  /**
   * Handle history
   * Update routes when history change
   * Dispatch new routes via RouterContext
   */
  const prevUrlRef = React.useRef<string>(null);

  const handleHistory = (url: string = window.location.pathname): void => {
    if (prevUrlRef.current === url) {
      console.warn("It's the same URL, return.");
      return;
    }
    // register URL if is not the same than the previous one and continue.
    prevUrlRef.current = url;

    const matchingRoute = getRouteFromUrl({ pUrl: url, pRoutes: routes, pBase: base });
    const notFoundRoute = getNotFoundRoute(routes);
    if (!matchingRoute && !notFoundRoute) {
      console.warn("matchingRoute not found & 'notFoundRoute' not found, return.");
      return;
    }
    const newRoute: TRoute = matchingRoute || notFoundRoute;
    if (newRoute) {
      dispatch({ type: "update-current-route", value: newRoute });
    }
  };

  React.useEffect(() => {
    handleHistory();
    return Routers.history.listen(({ location }) => {
      handleHistory(location.pathname);
    });
  }, []);

  return (
    <RouterContext.Provider
      value={{
        base: Routers.base,
        routes,
        history: Routers.history,
        currentRoute: reducerState.currentRoute,
        previousRoute: reducerState.previousRoute,
        routeIndex: reducerState.routeIndex,
        previousPageIsMount: reducerState.previousPageIsMount,
        unmountPreviousPage: () => dispatch({ type: "unmount-previous-page" }),
      }}
      children={children}
    />
  );
}

Router.displayName = componentName;
const MemoizedRouter = React.memo(Router);
export { MemoizedRouter as Router };
