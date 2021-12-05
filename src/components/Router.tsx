import debug from "@wbe/debug";
import {
  BrowserHistory,
  createBrowserHistory,
  HashHistory,
  MemoryHistory,
} from "history";
import { Match } from "path-to-regexp";
import React from "react";
import { applyMiddlewares, joinPaths, patchMissingRootRoute } from "../api/helpers";
import { getNotFoundRoute, getRouteFromUrl } from "../api/matcher";
import { Routers } from "../api/Routers";
import { useRouter } from "../hooks/useRouter";
import { getLangPathByPath } from "../lang/langHelpers";
import LangService from "../lang/LangService";

export type TRoute = {
  path: string;
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

Router.defaultProps = {
  base: "/",
  history: createBrowserHistory(),
  id: 1,
};

function Router(props: {
  children: React.ReactNode;
  routes: TRoute[];
  base: string;
  history?: BrowserHistory | HashHistory | MemoryHistory;
  middlewares?: ((routes: TRoute[]) => TRoute[])[];
  id?: number;
}): JSX.Element {
  // 1. routes
  const routes = React.useMemo(() => {
    Routers.preMiddlewareRoutes = patchMissingRootRoute(props.routes);
    Routers.routes = applyMiddlewares(Routers.preMiddlewareRoutes, props.middlewares);
    log(props.id, "finalRoutes", Routers.routes);
    return Routers.routes;
  }, [props.routes]);

  // 2. base
  // const parentRouter = useRouter();
  // const base = React.useMemo(() => {
  //   const showLang = LangService.showLangInUrl();
  //   const parentBase: string = parentRouter?.base;
  //   const addLang: boolean = props.id !== 1 && showLang;
  //   const selectedBase: string = addLang
  //     ? getLangPathByPath({ path: props.base })
  //     : props.base;
  //   const final = joinPaths([
  //     parentBase, // ex: /master-base
  //     addLang && "/:lang",
  //     selectedBase, // ex: "/about
  //   ]);
  //   return final;
  // }, [props.base]);

  // only for first instance
  if (!Routers.base) Routers.base = props.base;
  if (!Routers.history) Routers.history = props.history;

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

  const currentRouteRef = React.useRef<TRoute>();
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

    if (
      currentRouteRef.current?.url != null &&
      currentRouteRef.current?.url === matchingRoute.url
    ) {
      log(props.id, "this is the same route 'url', return.");
      return;
    }

    const newRoute: TRoute = matchingRoute || notFoundRoute;
    if (newRoute) {
      dispatch({ type: "update-current-route", value: newRoute });
      currentRouteRef.current = newRoute;
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
        routes,
        base: props.base,
        history: Routers.history,
        currentRoute: reducerState.currentRoute,
        previousRoute: reducerState.previousRoute,
        routeIndex: reducerState.routeIndex,
        previousPageIsMount: reducerState.previousPageIsMount,
        unmountPreviousPage: () => dispatch({ type: "unmount-previous-page" }),
      }}
      children={props.children}
    />
  );
}

Router.displayName = componentName;
const MemoizedRouter = React.memo(Router);
export { MemoizedRouter as Router };
