import { CreateRouter, TRoute, useRouter, langMiddleware } from "..";
import React, {
  createContext,
  memo,
  ReactElement,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from "react";
import { joinPaths } from "../api/helpers";
import { ROUTERS } from "../api/routers";
import { LangService } from "..";
import { getLangPathByPath } from "../lang/langHelpers";
import { BrowserHistory, HashHistory, MemoryHistory } from "history";

const componentName = "Router";

interface IProps {
  base: string;
  children: ReactElement;
  // routes array is required for 1st instance only
  routes?: TRoute[];
  middlewares?: any[];
  history?: BrowserHistory | HashHistory | MemoryHistory;
}

export interface IRouterContextStackStates {
  unmountPreviousPage?: () => void;
  previousPageIsMount?: boolean;
}

export interface IRouterContext extends IRouterContextStackStates {
  currentRoute: TRoute;
  previousRoute: TRoute;
  routeIndex: number;
  base: string;
}

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
};
export const RouterContext = createContext<IRouterContext>(defaultRouterContext);
RouterContext.displayName = componentName;

// /**
//  * Stack Context
//  * Dispatch informations for used on Stack
//  */
// const defaultStackContext = {
//   unmountPreviousPage: () => {},
//   previousPageIsMount: false,
// };
// export const StackContext = createContext<IStackContext>(defaultStackContext);
// StackContext.displayName = "Stack";

/**
 * Routes Reducer
 * Allows to dispatch routes states to components three
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
export const Router = memo((props: IProps) => {
  //
  const [reducerState, dispatch] = useReducer(reducer, initialState);
  // get parent router instance if exist, in case we are one sub router
  const parentRouter = useRouter();
  // deduce a router ID
  const id = ROUTERS.instances?.length > 0 ? ROUTERS.instances.length + 1 : 1;
  // get routes list by props first
  // if there is no props.routes, we deduce that we are on a subrouter
  const routes = useMemo(() => {
    let currentRoutesList: TRoute[];
    if (props.routes) {
      ROUTERS.routes = props.routes;
      currentRoutesList = props.routes;
    } else {
      currentRoutesList = ROUTERS.routes?.find((el) => {
        return (
          getLangPathByPath({ path: el.path }) === getLangPathByPath({ path: props.base })
        );
      })?.children;
      if (LangService.isInit) {
        // If sub router, need to selected appropriate route path by lang
        currentRoutesList = langMiddleware(currentRoutesList, false);
      }
    }
    return currentRoutesList;
  }, [props.routes, props.base]);

  // join each parent router base
  const base = useMemo(() => {
    const parentBase: string = parentRouter?.base;
    const addLang: boolean = id !== 1 && LangService.showLangInUrl();
    const base: string = addLang ? getLangPathByPath({ path: props.base }) : props.base;
    return joinPaths([
      parentBase, // ex: /master-base
      addLang && "/:lang",
      base, // ex: "/about
    ]);
  }, [props.base]);

  // keep router instance in state
  const [routerState] = useState<CreateRouter>(() => {
    const newRouter = new CreateRouter({
      base,
      routes,
      id,
      middlewares: props.middlewares,
      history: props.history,
      setNewCurrentRoute: (newCurrentRoute) =>
        dispatch({ type: "update-current-route", value: newCurrentRoute }),
    });
    // keep new router in global constant
    ROUTERS.instances.push(newRouter);
    // return it as state
    return newRouter;
  });

  // on destroy, we need to remove this current router instance from ROUTERS.instances array
  // remove 1 element from specific index
  useEffect(() => {
    return () => {
      ROUTERS.instances.splice(
        ROUTERS.instances.findIndex((el) => el.id === routerState.id),
        1
      );
      routerState.destroyEvents();
    };
  }, [routerState]);

  return (
    <RouterContext.Provider
      children={props.children}
      value={{
        ...defaultRouterContext,
        base,
        currentRoute: reducerState.currentRoute,
        previousRoute: reducerState.previousRoute,
        routeIndex: reducerState.index,
        previousPageIsMount: reducerState.previousPageIsMount,
        unmountPreviousPage: () =>
          dispatch({
            type: "unmount-previous-page",
            value: true,
          }),
      }}
    />
  );
});

Router.displayName = componentName;
