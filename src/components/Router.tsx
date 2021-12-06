import debug from "@wbe/debug";
import {
  BrowserHistory,
  createBrowserHistory,
  HashHistory,
  MemoryHistory,
} from "history";
import { Match } from "path-to-regexp";
import React from "react";
import { useRouter } from "..";
import { applyMiddlewares, patchMissingRootRoute } from "../api/helpers";
import { getNotFoundRoute, getRouteFromUrl } from "../api/matcher";
import { Routers } from "../api/Routers";

export type TRoute = {
  path: string | { [x: string]: string };
  component?: React.ComponentType<any>;
  base?: string;
  name?: string;
  parser?: Match;
  props?: {
    params?: { [x: string]: any };
    [x: string]: any;
  };
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
RouterContext.displayName = "RouterContext";

Router.defaultProps = {
  base: "/",
  history: createBrowserHistory(),
  id: 1,
};

/**
 * Router
 * @param props
 * @returns JSX.Element
 */
function Router(props: {
  children: React.ReactNode;
  routes: TRoute[];
  base: string;
  history?: BrowserHistory | HashHistory | MemoryHistory;
  middlewares?: ((routes: TRoute[]) => TRoute[])[];
  id?: number;
}): JSX.Element {
  /**
   * 1. routes
   * Format and return routes list
   * If is the first Router instance, register routes in 'Routers' store
   * In other case, return current props.routes
   *
   *  const { routes } = useRouter();
   *  return current Router instance routes list, not all routes given to the first instance.
   */
  const routes = React.useMemo(() => {
    let routesList;
    routesList = patchMissingRootRoute(props.routes);
    if (!Routers.routes) {
      routesList = applyMiddlewares(routesList, props.middlewares);
      Routers.routes = routesList;
    }
    return routesList;
  }, [props.routes]);

  /**
   * 2. base
   * Format and return base URL
   * Register base in 'Routers' obj if is the first Router instance
   * In all case, return current props.base
   */
  const base = React.useMemo(() => {
    if (!Routers.base) Routers.base = props.base;
    return props.base;
  }, [props.base]);

  /**
   * 3. history
   * If is the first Router instance, register history in 'Routers' store
   * 'history' object need to be the same between each Router instance
   */
  if (!Routers.history) Routers.history = props.history;

  // -------------------------------------------------------------------------------- ROUTE CHANGE

  /**
   * States list muted when history change
   */
  const [reducerState, dispatch] = React.useReducer(
    (
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
    },
    {
      currentRoute: undefined,
      previousRoute: undefined,
      previousPageIsMount: false,
      routeIndex: 0,
    }
  );

  // keep as reference
  const currentRouteRef = React.useRef<TRoute>();

  /**
   * Handle history
   * Update routes when history change
   * Dispatch new routes via RouterContext
   */
  const handleHistory = (url: string = window.location.pathname): void => {
    const matchingRoute = getRouteFromUrl({
      pUrl: url,
      pRoutes: routes,
      pBase: props.base,
      id: props.id,
    });

    const notFoundRoute = getNotFoundRoute(props.routes);
    if (!matchingRoute && !notFoundRoute) {
      log(props.id, "matchingRoute not found & 'notFoundRoute' not found, return.");
      return;
    }

    const currentRouteUrl = currentRouteRef.current?.url;
    if (currentRouteUrl != null && currentRouteUrl === matchingRoute?.url) {
      log(props.id, "this is the same route 'url', return.");
      return;
    }

    const newRoute: TRoute = matchingRoute || notFoundRoute;
    if (newRoute) {
      dispatch({ type: "update-current-route", value: newRoute });
      currentRouteRef.current = newRoute;

      // Routers.currentRoutes[props.id - 1] = newRoute;
      // log(props.id, "-------------newRoute fullPath", newRoute.fullPath);
    }
  };

  /**
   * Here we go!
   * Listen history change.
   * If it change:
   * - Get matching route with current URL
   * - Dispatch new routes states from RouterContext
   */
  React.useEffect(() => {
    handleHistory();
    return Routers.history.listen(({ location }) => {
      handleHistory(location.pathname);
    });
  }, []);

  // React.useEffect(() => {
  //   return () => {
  //     Routers.currentRoutes[props.id - 1] = null;
  //     log(props.id, "Routers.currentRoutes after slice", Routers.currentRoutes);
  //   };
  // }, []);

  // -------------------------------------------------------------------------------- RENDER

  const { currentRoute, previousRoute, routeIndex, previousPageIsMount } = reducerState;
  const unmountPreviousPage = () => dispatch({ type: "unmount-previous-page" });

  return (
    <RouterContext.Provider
      children={props.children}
      value={{
        routes,
        base,
        currentRoute,
        previousRoute,
        routeIndex,
        previousPageIsMount,
        unmountPreviousPage,
        history: Routers.history,
      }}
    />
  );
}

Router.displayName = componentName;
const MemoizedRouter = React.memo(Router);
export { MemoizedRouter as Router };
