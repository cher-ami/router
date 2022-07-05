import debug from "@wbe/debug";
import { BrowserHistory, HashHistory, MemoryHistory } from "history";
import { Match } from "path-to-regexp";
import React from "react";
import { formatRoutes } from "../core/helpers";
import { getNotFoundRoute, getRouteFromUrl } from "../core/matcher";
import { Routers } from "../core/Routers";
import LangService from "../core/LangService";

// -------------------------------------------------------------------------------- TYPES

export type TRoute = Partial<{
  path: string | { [x: string]: string };
  component: React.ComponentType<any>;
  base: string;
  name: string;
  parser: Match;
  props: {
    params?: { [x: string]: any };
    [x: string]: any;
  };
  children: TRoute[];
  url: string;
  fullUrl: string; // full URL who not depend of current instance
  fullPath: string; // full Path /base/:lang/foo/second-foo
  langPath: { [x: string]: string } | null;
  action?: () => any;
  getStaticProps?: () => Promise<any>;
}>;

export interface IRouterContextStackStates {
  unmountPreviousPage?: () => void;
  previousPageIsMount?: boolean;
}

export interface IRouterContext extends IRouterContextStackStates {
  base: string;
  routes: TRoute[];
  history: BrowserHistory | HashHistory | MemoryHistory | undefined;
  staticLocation: string;
  currentRoute: TRoute;
  previousRoute: TRoute;
  langService: LangService;
  routeIndex: number;
  previousPageIsMount: boolean;
  unmountPreviousPage: () => void;
  getPaused: () => boolean;
  setPaused: (value: boolean) => void;
}

export type TRouteReducerState = {
  currentRoute: TRoute;
  previousRoute: TRoute;
  previousPageIsMount: boolean;
  index: number;
};

// -------------------------------------------------------------------------------- PREPARE / CONTEXT

const componentName = "Router";
const log = debug(`router:${componentName}`);

/**
 * Router Context
 * Router instance will be keep on this context
 * Big thing is you can access this context from the closest provider in the tree.
 * This allow to manage easily nested stack instances.
 */
export const RouterContext = React.createContext<IRouterContext>({
  base: "/",
  routes: undefined,
  history: undefined,
  langService: undefined,
  currentRoute: undefined,
  previousRoute: undefined,
  routeIndex: 0,
  previousPageIsMount: true,
  staticLocation: undefined,
  unmountPreviousPage: () => {},
  getPaused: () => false,
  setPaused: (value: boolean) => {},
});
RouterContext.displayName = "RouterContext";

Router.defaultProps = {
  base: "/",
  id: 1,
};

// -------------------------------------------------------------------------------- COMPONENT

/**
 * Router
 * @param props
 * @returns JSX.Element
 */
function Router(props: {
  children: React.ReactNode;
  routes: TRoute[];
  base: string;
  history?: BrowserHistory | HashHistory | MemoryHistory | undefined;
  staticLocation?: string;
  middlewares?: ((routes: TRoute[]) => TRoute[])[];
  langService?: LangService;
  id?: number | string;
  staticProps?: { props: any; name: string };
}): JSX.Element {
  /**
   * 0. LangService
   * Check if langService props exist.
   * If props exist, store langService instance in Routers store.
   */
  if (!Routers.langService) Routers.langService = props.langService;
  const langService = Routers.langService;

  /**
   * 1. routes
   * Format and return routes list
   * If is the first Router instance, register routes in 'Routers' store.
   * In other case, return current props.routes
   *
   *  const { routes } = useRouter();
   *  return current Router instance routes list, not all routes given to the first instance.
   */
  const routes = React.useMemo(
    () => formatRoutes(props.routes, props.middlewares, langService, props.id),
    [props.routes, langService, props.middlewares, props.id]
  );

  /**
   * 2. base
   * Format and return base URL
   * Register base in 'Routers' obj if is the first Router instance
   * In all case, return current props.base
   */

  if (!Routers.base) {
    Routers.base = props.base;
  }
  const base = Routers.base;

  /**
   * 3. history
   * If is the first Router instance, register history in 'Routers' store
   * 'history' object need to be the same between each Router instance
   */

  if (props.history && !Routers.history) {
    Routers.history = props.history;
  }
  const history = Routers.history;

  /**
   * 4 static location
   * Is useful in SSR context
   */

  if (props.staticLocation) {
    Routers.staticLocation = props.staticLocation;
  }
  const staticLocation: string | undefined = Routers.staticLocation;

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

  /**
   * Enable paused on Router instance
   */
  const _waitingUrl = React.useRef(null);
  const _paused = React.useRef<boolean>(false);
  const getPaused = () => _paused.current;
  const setPaused = (value: boolean) => {
    _paused.current = value;
    if (!value && _waitingUrl.current) {
      handleHistory(_waitingUrl.current);
      _waitingUrl.current = null;
    }
  };

  const currentRouteRef = React.useRef<TRoute>();

  /**
   * Handle history
   * Update routes when history change
   * Dispatch new routes via RouterContext
   */

  const handleHistory = async (url: string = "", hash: string = ""): Promise<void> => {
    // because we can get #" in hash history context, we need define current URL
    // as the URL part after the "#"
    let exactUrl: string = url;
    if (hash?.length > 0) {
      exactUrl = hash.replace("#", "");
    }

    if (_paused.current) {
      _waitingUrl.current = exactUrl;
      return;
    }

    const matchingRoute = getRouteFromUrl({
      pUrl: exactUrl,
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
      // (server & client)
      const isFirstRoute = newRoute.name === props.staticProps.name;
      if (isFirstRoute) {
        Object.assign(newRoute.props, props.staticProps.props);
      } else {
        // if is client and not first route
        if (newRoute?.getStaticProps) {
          try {
            const requestStaticProps = await newRoute.getStaticProps();
            log("assign requestStaticProps to newRoute.props  ", requestStaticProps);
            Object.assign(newRoute.props, requestStaticProps);
          } catch (e) {
            console.error("requestStaticProps failed");
          }
        }
      }

      // Final process: update context currentRoute from dispatch method \o/ !
      dispatch({ type: "update-current-route", value: newRoute });

      // & register this new route as currentRoute in local and in Routers store
      currentRouteRef.current = newRoute;
      Routers.currentRoute = newRoute;
      Routers.isFirstRoute = false;
    }
  };

  /**
   * Here we go!
   * Listen history change.
   * If it changes:
   * - Get matching route with current URL
   * - Dispatch new routes states from RouterContext
   */
  const historyListener = React.useMemo(() => {
    if (!routes) return;

    const historyListener = () => {
      if (staticLocation && history) {
        console.error(`You can't set history and staticLocation props together, return.`);
        return;
      }
      // server
      if (staticLocation) {
        handleHistory(staticLocation);
        return;
        // client
      } else if (history) {
        handleHistory(window.location.pathname, window.location.hash);
        return history?.listen(({ location }) => {
          handleHistory(location.pathname, location.hash);
        });
        // log error
      } else {
        console.error(`An history or staticLocation props is required, return.`);
        return;
      }
    };
    return historyListener();
  }, [routes, history]);

  // remove listener
  React.useEffect(() => {
    return () => {
      log(props.id, "Stop to listen history.");
      historyListener();
    };
  }, [historyListener]);

  // -------------------------------------------------------------------------------- RENDER

  const { currentRoute, previousRoute, routeIndex, previousPageIsMount } = reducerState;
  const unmountPreviousPage = () => dispatch({ type: "unmount-previous-page" });

  return (
    <RouterContext.Provider
      children={props.children}
      value={{
        routes,
        base,
        langService,
        history,
        staticLocation,
        currentRoute,
        previousRoute,
        routeIndex,
        previousPageIsMount,
        unmountPreviousPage,
        getPaused,
        setPaused,
      }}
    />
  );
}

Router.displayName = componentName;
const MemoizedRouter = React.memo(Router);
export { MemoizedRouter as Router };
