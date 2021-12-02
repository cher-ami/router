import { TRoute, useRouter, langMiddleware, useHistory } from "..";
import React, {
  createContext,
  ReactElement,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { compileUrl, joinPaths, removeLastCharFromString } from "../api/helpers";
import { Routers } from "../api/Routers";
import { LangService } from "..";
import { getLangPathByPath } from "../lang/langHelpers";
import {
  BrowserHistory,
  createBrowserHistory,
  HashHistory,
  MemoryHistory,
} from "history";
import debug from "@wbe/debug";
import { match } from "path-to-regexp";

export interface IRouterContextStackStates {
  unmountPreviousPage?: () => void;
  previousPageIsMount?: boolean;
}

export interface IRouterContext extends IRouterContextStackStates {
  currentRoute: TRoute;
  previousRoute: TRoute;
  routeIndex: number;
  base: string;
  history: BrowserHistory | HashHistory | MemoryHistory;
  routes: TRoute[];
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
const defaultRouterContext = {
  currentRoute: null,
  previousRoute: null,
  routeIndex: 0,
  base: "/",
  history: Routers.history,
  routes: undefined,
};
export const RouterContext = createContext<IRouterContext>(defaultRouterContext);
RouterContext.displayName = componentName;

/**
 * Routes Reducer
 * Allows to dispatch routes states to components three
 */
const initialState: TRouteReducerState = {
  currentRoute: null,
  previousRoute: null,
  previousPageIsMount: true,
  index: 0,
};

export type TRouteReducerActionType = "update-current-route" | "unmount-previous-page";
const reducer = (
  state: TRouteReducerState,
  action: { type: TRouteReducerActionType; value }
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
 * This component returns children wrapped by provider who contains router instance
 */
Router.defaultProps = {
  history: createBrowserHistory(),
};
function Router(props: {
  base: string;
  children: ReactElement;
  routes?: TRoute[]; // routes array is required for 1st instance only
  middlewares?: any[];
  history?: BrowserHistory | HashHistory | MemoryHistory;
}) {
  // --------------------------------------------------------------------------------------- PROPERTiES

  const [reducerState, dispatch] = useReducer(reducer, initialState);
  const parentRouter = useRouter();

  // deduce a router ID
  const id = Routers.instances?.length > 0 ? Routers.instances.length + 1 : 1;

  // register history
  useEffect(() => {
    if (id === 1) Routers.history = props.history;
  }, []);

  // join each parent router base
  // FIXME ne fonctionne pas avec un sous router
  const base = useMemo(() => {
    const parentBase: string = parentRouter?.base;
    const addLang: boolean = id !== 1 && LangService.showLangInUrl();
    const base: string = addLang ? getLangPathByPath({ path: props.base }) : props.base;
    const formatedBase = joinPaths([
      parentBase, // ex: /master-base
      addLang && "/:lang",
      base, // ex: "/about
    ]);
    return formatedBase;
  }, [props.base]);

  useEffect(() => {
    log("base", base);
    Routers.base = base;
  }, []);

  // get pathname
  const pathname = useMemo(
    () => parentRouter?.history?.location.pathname || props.history?.location.pathname,
    [parentRouter, props.history]

    // --------------------------------------------------------------------------------------- ROUTES
  );
  const [formatedRoutes, setFormatedRoutes] = useState<TRoute[]>(props.routes);

  useEffect(() => {
    let currentRoutesList: TRoute[];

    // Register routes in global object
    // If props.routes exist, we deduice we are on root Router
    // else, we are on subRouter, so we need to prepare props.base witch can be string of lang object
    if (props.routes) {
      Routers.routes = props.routes;
      currentRoutesList = props.routes;
    } else {
      // get sub route list
      currentRoutesList = Routers.routes?.find((el) => {
        return (
          getLangPathByPath({ path: el.path }) === getLangPathByPath({ path: props.base })
        );
      })?.children;

      // If sub router, need to selected appropriate route path by lang
      if (LangService.isInit) {
        currentRoutesList = langMiddleware(currentRoutesList, false);
      }
    }

    log("currentRouteList", currentRoutesList);

    // Patch missing route '/'
    const rootRoutePathExist = currentRoutesList.some((route) => route.path === "/");
    if (!rootRoutePathExist) currentRoutesList.unshift({ path: "/", component: null });

    // Apply middleweares functions
    const finalRoutes =
      props.middlewares?.reduce(
        (routes, middleware) => middleware(routes),
        currentRoutesList
      ) || currentRoutesList;

    setFormatedRoutes(finalRoutes);
    log("finalRoutes currentRoutesList", finalRoutes);
  }, [props.routes, props.middlewares]);

  useEffect(() => {
    if (!formatedRoutes) return;
    updateRoute(pathname);
  }, [formatedRoutes]);

  /**
   * Listen history
   */
  useHistory(
    (event) => {
      if (!formatedRoutes) return;
      updateRoute(event.location.pathname);
    },
    [reducerState, parentRouter, props.history, formatedRoutes],
    props.history
  );

  /**
   * Get not found Page
   * @param routes
   */
  const getNotFoundRoute = (routes = formatedRoutes): TRoute =>
    routes.find((el) => el.path === "/:rest");

  /**
   * Update Route
   */
  const updateRoute = (
    url = pathname,
    matchingRoute = getRouteFromUrl({ pUrl: url, pRoutes: formatedRoutes }),
    notFoundRoute = getNotFoundRoute()
  ) => {
    if (!url) {
      debug("URL params doesnt exist, return.");
      return;
    }

    if (!matchingRoute && !notFoundRoute) {
      log(id, "updateRoute: NO MATCHING ROUTE & NO NOTFOUND ROUTE. RETURN.");
      return;
    }

    if (
      reducerState.currentRoute?.url != null &&
      reducerState.currentRoute?.url === matchingRoute?.url
    ) {
      log(id, "updateRoute: THIS IS THE SAME URL, RETURN.");
      return;
    }

    if (matchingRoute) {
      dispatch({ type: "update-current-route", value: matchingRoute });
    }
  };

  /**
   * TODO externaliser as routeMatcher.ts
   * Get current route from URL using path-to-regex
   * @doc https://github.com/pillarjs/path-to-regexp
   */
  const getRouteFromUrl = ({
    pUrl,
    pRoutes = formatedRoutes,
    pBase = base,
    pCurrentRoute = null,
    pMatcher = null,
  }: {
    pUrl: string;
    pRoutes?: TRoute[];
    pBase?: string;
    pCurrentRoute?: TRoute;
    pMatcher?: any;
  }): TRoute => {
    if (!pRoutes || pRoutes?.length === 0) return;

    // test each routes
    for (let currentRoute of pRoutes) {
      // create parser & matcher
      const currentRoutePath = removeLastCharFromString(
        joinPaths([pBase, currentRoute.path as string]),
        "/"
      );

      const matcher = match(currentRoutePath)(pUrl);

      log(id, `"${pUrl}" match with "${currentRoutePath}"?`, !!matcher);

      // if current route path match with the param url
      if (matcher) {
        // prepare route obj
        const route = pCurrentRoute || currentRoute;
        const params = pMatcher?.params || matcher?.params;
        const routeObj = {
          fullPath: currentRoutePath,
          path: route?.path,
          fullUrl: pUrl,
          url: compileUrl(route.path as string, params),
          base: pBase,
          component: route?.component,
          children: route?.children,
          parser: pMatcher || matcher,
          langPath: route.langPath,
          name: route?.name || route?.component?.displayName,
          props: {
            params,
            ...(route?.props || {}),
          },
        };

        log(id, "getRouteFromUrl: MATCH routeObj", routeObj);
        return routeObj;
      }

      // if not match
      else if (currentRoute?.children) {
        // else, call recursively this same method with new params
        const matchingChildren = getRouteFromUrl({
          pUrl: pUrl,
          pRoutes: currentRoute?.children,
          pBase: currentRoutePath, // parent base
          pCurrentRoute: currentRoute,
          pMatcher: matcher,
        });

        log(id, "matchingChildren", matchingChildren);

        // only if matching, return this match, else continue to next iteration
        if (matchingChildren) return matchingChildren;
      }
    }
  };

  // --------------------------------------------------------------------------------------- INSTANCE

  // // keep router instance in state
  // const [routerState] = useState<RouterManager>(() => {
  //   const newRouter = new RouterManager({
  //     base,
  //     routes: formatedRoutes,
  //     id,
  //     middlewares: props.middlewares,
  //     history: props.history,
  //     setNewCurrentRoute: (newCurrentRoute) =>
  //       dispatch({ type: "update-current-route", value: newCurrentRoute }),
  //   });
  //   // keep new router in global constant
  //   Routers.instances.push(newRouter);
  //   // return it as state
  //   return newRouter;
  // });

  // // on destroy, we need to remove this current router instance from ROUTERS.instances array
  // // remove 1 element from specific index
  // useEffect(() => {
  //   return () => {
  //     Routers.instances.splice(
  //       Routers.instances.findIndex((el) => el.id === routerState.id),
  //       1
  //     );
  //     routerState.destroyEvents();
  //   };
  // }, [routerState]);

  /**
   * Unmount previous page dispatch function
   */
  const unmountPreviousPage = () =>
    dispatch({
      type: "unmount-previous-page",
      value: true,
    });

  // --------------------------------------------------------------------------------------- RENDER

  return (
    <RouterContext.Provider
      children={props.children}
      value={{
        ...defaultRouterContext,
        base,
        history: props.history,
        currentRoute: reducerState.currentRoute,
        previousRoute: reducerState.previousRoute,
        routeIndex: reducerState.index,
        previousPageIsMount: reducerState.previousPageIsMount,
        unmountPreviousPage,
        routes: formatedRoutes,
      }}
    />
  );
}

Router.displayName = componentName;
const MemoizedRouter = React.memo(Router);
export { MemoizedRouter as Router };
