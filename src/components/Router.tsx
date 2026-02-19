import debug from "@cher-ami/debug"
import { BrowserHistory, HashHistory, MemoryHistory } from "history"
import { Match } from "path-to-regexp"
import React, {
  createContext,
  memo,
  ReactNode,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react"
import { formatRoutes, TParams, TQueryParams } from "../core/core"
import { getNotFoundRoute, getRouteFromUrl } from "../core/core"
import { Routers } from "../core/Routers"
import LangService, { TLanguage } from "../core/LangService"
import { staticPropsCache } from "../core/staticPropsCache"
import { isSSR, removeLastCharFromString } from "../core/helpers"

// -------------------------------------------------------------------------------- TYPES

export type TRouteProps = {
  params?: TParams
  queryParams?: TQueryParams
  hash?: string
  [x: string]: any
}

export type TRoute = Partial<{
  path: string | { [x: string]: string }
  component: React.ComponentType<any>
  base: string
  name: string
  parser: Match
  props: TRouteProps
  children: TRoute[]
  url: string
  params?: TParams
  queryParams?: TQueryParams
  hash?: string
  getStaticProps: (props: TRouteProps, currentLang: TLanguage) => Promise<any>
  _fullUrl: string // full URL who not depends on current instance
  _fullPath: string // full Path /base/:lang/foo/second-foo
  _langPath: { [x: string]: string } | null
  _context: TRoute
}>

export interface IRouterContextStackStates {
  unmountPreviousPage?: () => void
  previousPageIsMount?: boolean
}

export interface IRouterContext extends IRouterContextStackStates {
  base: string
  routes: TRoute[]
  history: BrowserHistory | HashHistory | MemoryHistory | undefined
  isHashHistory: boolean
  staticLocation: string
  currentRoute: TRoute
  previousRoute: TRoute
  langService: LangService
  routeIndex: number
  previousPageIsMount: boolean
  unmountPreviousPage: () => void
  getPaused: () => boolean
  setPaused: (value: boolean) => void
}

// -------------------------------------------------------------------------------- PREPARE / CONTEXT

const componentName = "Router"
const log = debug(`router:${componentName}`)
const IS_SERVER = isSSR()
/**
 * Router Context
 * Router instance will be keep on this context
 * Big thing is you can access this context from the closest provider in the tree.
 * This allows to manage easily nested stack instances.
 */
export const RouterContext = createContext<IRouterContext>({
  base: "/",
  routes: undefined,
  history: undefined,
  langService: undefined,
  currentRoute: undefined,
  previousRoute: undefined,
  routeIndex: 0,
  isHashHistory: false,
  previousPageIsMount: true,
  staticLocation: undefined,
  unmountPreviousPage: () => {},
  getPaused: () => false,
  setPaused: (value: boolean) => {},
})
RouterContext.displayName = "RouterContext"

// -------------------------------------------------------------------------------- COMPONENT

/**
 * Router
 * @param props
 * @returns JSX.Element
 */
function Router(
  props: {
    children: ReactNode
    routes: TRoute[]
    base: string
    history?: BrowserHistory | HashHistory | MemoryHistory | undefined
    staticLocation?: string
    middlewares?: ((routes: TRoute[]) => TRoute[])[]
    isHashHistory?: boolean
    langService?: LangService
    id?: number | string
    initialStaticProps?: {
      props: any
      name: string
      url: string
      parentProps?: any
      parentName?: string
    }
  } = {
    base: "/",
    id: 1,
    children: "",
    routes: [],
  },
): JSX.Element {
  /**
   * Check if is the first router or a sub-router
   * If is the first router, reset Routers store
   */
  const IS_CLIENT_OR_SERVER_ROOT_ROUTER = useMemo(() => {
    // base on supposition that:
    // props.staticLocation exist on SERVER side
    // props.history exist on CLIENT side
    const isRootRouter = !!props.staticLocation || !!props.history
    log(props.id, "IS_CLIENT_OR_SERVER_ROOT_ROUTER", isRootRouter)

    // reset Routers store
    if (IS_SERVER && isRootRouter) {
      Routers.base = undefined
      Routers.routes = undefined
      Routers.history = undefined
      Routers.staticLocation = undefined
      Routers.isHashHistory = false
      Routers.routeCounter = 1
      Routers.isFirstRoute = true
      Routers.currentRoute = undefined
      Routers.langService = undefined
      Routers.staticPropsCache = {}
    }
    return isRootRouter
  }, [props.id, props.staticLocation, props.history])

  /**
   * 0. LangService
   * Check if langService props exist.
   * If props exist, store langService instance in Routers store.
   */
  const langService = useMemo(() => {
    if (IS_CLIENT_OR_SERVER_ROOT_ROUTER) {
      Routers.langService = props.langService
    }
    return Routers.langService
  }, [props.langService])

  /**
   * 1. routes
   * Format and return routes list
   * If is the first Router instance, register routes in 'Routers' store.
   * In other case, return current props.routes
   *
   *  const { routes } = useRouter();
   *  return current Router instance routes list, not all routes given to the first instance.
   */
  const routes = useMemo(() => {
    const routesList = formatRoutes(
      props.routes,
      langService,
      props.middlewares,
      props.id,
    )

    // register is Store if...
    if (!Routers.routes && props.routes) {
      Routers.routes = routesList
    }

    // return current instance routes list
    return routesList
  }, [props.routes, langService, props.middlewares, props.id])

  /**
   * 2. base
   * Format and return base URL
   * Register base in 'Routers' obj if is the first Router instance
   * In all case, return current props.base
   */
  if (!Routers.base) {
    Routers.base = props.base
  }
  const base = Routers.base

  /**
   * 3. history
   * If is the first Router instance, register history in 'Routers' store
   * 'history' object need to be the same between each Router instance
   */
  if (!Routers.history && props.history) {
    Routers.history = props.history
  }
  const history = Routers.history
  const isHashHistory = Routers.isHashHistory

  /**
   * 4 static location
   * Is useful in SSR context
   */
  if (props.staticLocation) {
    Routers.staticLocation = props.staticLocation
  }
  const staticLocation: string | undefined = Routers.staticLocation

  /**
   * 5. reset is fist route visited
   */
  if (IS_SERVER) {
    Routers.isFirstRoute = true
  }

  // -------------------------------------------------------------------------------- ROUTE CHANGE

  /**
   * States list muted when history change
   */
  const [reducerState, dispatch] = useReducer(
    (
      state,
      action: { type: "update-current-route" | "unmount-previous-page"; value?: any },
    ) => {
      switch (action.type) {
        case "update-current-route":
          return {
            ...state,
            previousRoute: state.currentRoute,
            currentRoute: action.value,
            routeIndex: state.routeIndex + 1,
            previousPageIsMount: true,
          }
        case "unmount-previous-page":
          return { ...state, previousPageIsMount: false }
      }
    },
    {
      currentRoute: undefined,
      previousRoute: undefined,
      previousPageIsMount: false,
      routeIndex: 0,
    },
  )

  const currentRouteRef = useRef<TRoute>()

  /**
   * Enable paused on Router instance
   */
  const _waitingUrl = useRef(null)
  const _paused = useRef<boolean>(false)
  const getPaused = () => _paused.current
  const setPaused = (value: boolean) => {
    _paused.current = value
    if (!value && _waitingUrl.current) {
      handleHistory(_waitingUrl.current)
      _waitingUrl.current = null
    }
  }
  /**
   * Handle history
   * Update routes when history change
   * Dispatch new routes via RouterContext
   */

  const handleHistory = async (url = ""): Promise<void> => {
    try {
      if (_paused.current) {
        _waitingUrl.current = url
        return
      }

      const matchingRoute = getRouteFromUrl({
        pUrl: url,
        pRoutes: routes,
        pBase: props.base,
        id: props.id,
        isHashHistory: props.isHashHistory,
      })

      const notFoundRoute = getNotFoundRoute(props.routes)
      if (!matchingRoute && !notFoundRoute) {
        log(props.id, "matchingRoute not found & 'notFoundRoute' not found, return.")
        return
      }
      const currentRouteUrl =
        currentRouteRef.current?._context?.url ?? currentRouteRef.current?.url
      const matchingRouteUrl = matchingRoute?._context?.url ?? matchingRoute?.url
      if (currentRouteUrl === matchingRouteUrl) {
        log(props.id, "this is the same route 'url', return.")
        return
      }

      // new route
      const newRoute: TRoute = !matchingRouteUrl
        ? notFoundRoute
        : matchingRoute || notFoundRoute
      if (!newRoute) return

      // DEBUG: Log pour comprendre la structure de la route
      console.log(`[Router ${props.id}] newRoute:`, {
        name: newRoute.name,
        _context: newRoute._context
          ? {
              name: newRoute._context.name,
              hasProps: !!newRoute._context.props,
              propsKeys: newRoute._context.props
                ? Object.keys(newRoute._context.props)
                : [],
            }
          : null,
        hasGetStaticProps: !!newRoute.getStaticProps,
        _contextHasGetStaticProps: newRoute._context
          ? !!newRoute._context.getStaticProps
          : false,
      })

      // prepare cache for new route data staticProps
      const cache = staticPropsCache()

      // check if new route data as been store in cache
      // the matcher will match even if the URL ends with a slash
      const fullUrl = removeLastCharFromString(newRoute._fullUrl, "/")
      const [urlWithoutHash] = fullUrl?.split("#")

      /**
       * Request static props and cache it
       * Also calls parent route's getStaticProps if exists
       * For sub-routers, tries to get parent props from parent router's currentRoute
       */
      const requestStaticPropsAndCacheIt = async () => {
        try {
          let mergedProps = {}

          console.log(`[Router ${props.id}] requestStaticPropsAndCacheIt called`, {
            isRootRouter: IS_CLIENT_OR_SERVER_ROOT_ROUTER,
            hasContext: !!newRoute._context,
            contextName: newRoute._context?.name,
            RoutersCurrentRoute: Routers.currentRoute?.name,
            RoutersCurrentRouteContext: Routers.currentRoute?._context?.name,
          })

          // Pour les sous-routeurs, utiliser Routers.currentRoute._context pour récupérer les props du parent
          if (
            !IS_CLIENT_OR_SERVER_ROOT_ROUTER &&
            Routers.currentRoute?._context &&
            Routers.currentRoute._context !== Routers.currentRoute
          ) {
            // C'est un sous-routeur, récupérer les props du parent depuis le routeur parent
            const parentRouteFromParentRouter = Routers.currentRoute._context
            console.log(
              `[Router ${props.id}] Sub-router: Using parent route from Routers.currentRoute._context:`,
              parentRouteFromParentRouter.name,
            )

            // Si le parent a déjà des props (depuis initialStaticProps), les utiliser directement
            const parentPropsFromParentRouter = parentRouteFromParentRouter.props
            if (parentPropsFromParentRouter) {
              const parentPropsKeys = Object.keys(parentPropsFromParentRouter)
              const realParentProps = {}
              parentPropsKeys.forEach((key) => {
                if (!["params", "queryParams", "hash"].includes(key)) {
                  realParentProps[key] = parentPropsFromParentRouter[key]
                }
              })
              if (Object.keys(realParentProps).length > 0) {
                mergedProps = { ...mergedProps, ...realParentProps }
                console.log(
                  `[Router ${props.id}] Sub-router: Got parent props from Routers.currentRoute._context.props:`,
                  realParentProps,
                )
              }
            }

            // Aussi appeler getStaticProps du parent si il existe (pour être sûr d'avoir les dernières données)
            if (parentRouteFromParentRouter.getStaticProps) {
              try {
                const parentProps = await parentRouteFromParentRouter.getStaticProps(
                  parentRouteFromParentRouter.props,
                  langService?.currentLang,
                )
                if (parentProps) {
                  mergedProps = { ...mergedProps, ...parentProps }
                  console.log(
                    `[Router ${props.id}] Sub-router: Got parent props from parent.getStaticProps:`,
                    parentProps,
                  )
                }
              } catch (e) {
                console.error(
                  `[Router ${props.id}] requestStaticProps failed for parent`,
                  e,
                )
              }
            }
          }
          // Pour le routeur principal, utiliser newRoute._context
          else if (
            newRoute._context &&
            newRoute._context !== newRoute &&
            newRoute._context.getStaticProps
          ) {
            try {
              const parentProps = await newRoute._context.getStaticProps(
                newRoute._context.props,
                langService?.currentLang,
              )
              if (parentProps) {
                mergedProps = { ...mergedProps, ...parentProps }
                Object.assign(newRoute._context.props || {}, parentProps)
                console.log(
                  `[Router ${props.id}] Got parent props from _context.getStaticProps:`,
                  parentProps,
                )
              }
            } catch (e) {
              console.error("requestStaticProps failed for parent", e)
            }
          }

          // Appeler getStaticProps de la route courante
          if (newRoute.getStaticProps) {
            const childProps = await newRoute.getStaticProps(
              newRoute.props,
              langService?.currentLang,
            )
            if (childProps) {
              mergedProps = { ...mergedProps, ...childProps }
              console.log(
                `[Router ${props.id}] Got child props from getStaticProps:`,
                childProps,
              )
            }
          }

          console.log(`[Router ${props.id}] Final mergedProps:`, mergedProps)
          Object.assign(newRoute.props || {}, mergedProps)
          cache.set(urlWithoutHash, mergedProps)
        } catch (e) {
          console.error("requestStaticProps failed", e)
        }
      }

      // SERVER (first route)
      // prettier-ignore
      if (IS_SERVER) {
        console.log(`[Router ${props.id}] SERVER - Checking conditions:`, {
          hasInitialStaticProps: !!props.initialStaticProps,
          isRootRouter: IS_CLIENT_OR_SERVER_ROOT_ROUTER,
          hasGetStaticProps: !!newRoute?.getStaticProps
        });
        if (props.initialStaticProps) {
          log("firstRoute > isServer > assign initialStaticProps to newRoute props & set cache");
          console.log(`[Router ${props.id}] SERVER - initialStaticProps:`, {
            name: props.initialStaticProps.name,
            hasParentProps: !!props.initialStaticProps.parentProps,
            parentName: props.initialStaticProps.parentName,
            newRouteName: newRoute.name,
            hasContext: !!newRoute._context,
            contextName: newRoute._context?.name
          });
          // Assigner les props fusionnées à la route courante
          Object.assign(newRoute?.props || {}, props?.initialStaticProps?.props ?? {});
          // Assigner les props du parent au parent si elles existent
          if (props.initialStaticProps?.parentProps && newRoute._context && newRoute._context !== newRoute) {
            Object.assign(newRoute._context.props || {}, props.initialStaticProps.parentProps);
            console.log(`[Router ${props.id}] SERVER - Assigned parent props to _context:`, newRoute._context.name, newRoute._context.props);
            log("firstRoute > isServer > assigned parent props to _context:", newRoute._context.name, props.initialStaticProps.parentProps);
          } else {
            console.log(`[Router ${props.id}] SERVER - Could not assign parent props:`, {
              hasParentProps: !!props.initialStaticProps?.parentProps,
              hasContext: !!newRoute._context,
              contextEqualsRoute: newRoute._context === newRoute,
              initialPropsName: props.initialStaticProps.name,
              newRouteName: newRoute.name,
              contextName: newRoute._context?.name
            });
          }
        }
        // Pour les sous-routeurs, appeler requestStaticPropsAndCacheIt même sans initialStaticProps
        else if (!IS_CLIENT_OR_SERVER_ROOT_ROUTER && newRoute?.getStaticProps) {
          console.log(`[Router ${props.id}] SERVER - Sub-router: calling requestStaticPropsAndCacheIt`);
          log(`[Router ${props.id}] SERVER - Sub-router: calling requestStaticPropsAndCacheIt`);
          await requestStaticPropsAndCacheIt()
        } else {
          console.log(`[Router ${props.id}] SERVER - Not calling requestStaticPropsAndCacheIt:`, {
            hasInitialStaticProps: !!props.initialStaticProps,
            isRootRouter: IS_CLIENT_OR_SERVER_ROOT_ROUTER,
            hasGetStaticProps: !!newRoute?.getStaticProps
          });
        }
      }
      // CLIENT
      else {
        // CLIENT > FIRST ROUTE
        if (Routers.isFirstRoute) {
          console.log(`[Router ${props.id}] CLIENT - Checking conditions:`, {
            hasInitialStaticProps: !!props?.initialStaticProps,
            isRootRouter: IS_CLIENT_OR_SERVER_ROOT_ROUTER,
            hasGetStaticProps: !!newRoute?.getStaticProps,
            isFirstRoute: Routers.isFirstRoute
          });
          if (props?.initialStaticProps) {
            log(props.id, "firstRoute > isClient > assign initialStaticProps to newRoute props & set cache");
            console.log(`[Router ${props.id}] CLIENT - initialStaticProps:`, {
              name: props.initialStaticProps.name,
              hasParentProps: !!props.initialStaticProps.parentProps,
              parentName: props.initialStaticProps.parentName,
              newRouteName: newRoute.name,
              hasContext: !!newRoute._context,
              contextName: newRoute._context?.name
            });
            // Assigner les props fusionnées à la route courante
            Object.assign(newRoute?.props ?? {}, props?.initialStaticProps?.props ?? {});
            // Assigner les props du parent au parent si elles existent
            if (props.initialStaticProps?.parentProps && newRoute._context && newRoute._context !== newRoute) {
              Object.assign(newRoute._context.props || {}, props.initialStaticProps.parentProps);
              console.log(`[Router ${props.id}] CLIENT - Assigned parent props to _context:`, newRoute._context.name, newRoute._context.props);
              log(props.id, "firstRoute > isClient > assigned parent props to _context:", newRoute._context.name, props.initialStaticProps.parentProps);
            } else {
              console.log(`[Router ${props.id}] CLIENT - Could not assign parent props:`, {
                hasParentProps: !!props.initialStaticProps?.parentProps,
                hasContext: !!newRoute._context,
                contextEqualsRoute: newRoute._context === newRoute
              });
            }
            cache.set(urlWithoutHash, newRoute?.props ?? {});
          }
          // Pour les sous-routeurs, appeler requestStaticPropsAndCacheIt même sans initialStaticProps
          else if (!IS_CLIENT_OR_SERVER_ROOT_ROUTER && newRoute?.getStaticProps) {
            console.log(`[Router ${props.id}] CLIENT - Sub-router: calling requestStaticPropsAndCacheIt`);
            log(`[Router ${props.id}] CLIENT - Sub-router: calling requestStaticPropsAndCacheIt`);
            await requestStaticPropsAndCacheIt()
          }
          else if (newRoute?.getStaticProps) {
            log(props.id, "firstRoute > isClient > request getStaticProps & set cache")
            await requestStaticPropsAndCacheIt()
          } else {
            console.log(`[Router ${props.id}] CLIENT - Not calling requestStaticPropsAndCacheIt:`, {
              hasInitialStaticProps: !!props?.initialStaticProps,
              isRootRouter: IS_CLIENT_OR_SERVER_ROOT_ROUTER,
              hasGetStaticProps: !!newRoute?.getStaticProps
            });
          }
        }
        // Pour les sous-routeurs qui ne sont pas dans isFirstRoute, appeler requestStaticPropsAndCacheIt aussi
        else if (!IS_CLIENT_OR_SERVER_ROOT_ROUTER && newRoute?.getStaticProps) {
          console.log(`[Router ${props.id}] CLIENT - Sub-router (not first route): calling requestStaticPropsAndCacheIt`);
          log(`[Router ${props.id}] CLIENT - Sub-router (not first route): calling requestStaticPropsAndCacheIt`);
          await requestStaticPropsAndCacheIt()
        }
        // CLIENT > NOT FIRST ROUTE
        else {
          const cacheData = cache.get(urlWithoutHash)
          if (cacheData) {
            log(props.id, "not firstRoute > isClient > assign dataFromCache to newRoute.props");
            Object.assign(newRoute?.props, cacheData);
          }
          else if (newRoute?.getStaticProps) {
            log(props.id, "not firstRoute > isClient > request getStaticProps");
            await requestStaticPropsAndCacheIt()
          }
        }
      }

      // DEBUG: Log avant dispatch pour voir l'état final
      console.log(`[Router ${props.id}] Before dispatch - newRoute:`, {
        name: newRoute.name,
        _contextName: newRoute._context?.name,
        _contextPropsKeys: newRoute._context?.props
          ? Object.keys(newRoute._context.props)
          : [],
        _contextHasTodo: newRoute._context?.props?.todo ? "YES" : "NO",
      })

      // Final process: update context currentRoute from dispatch method \o/ !
      dispatch({ type: "update-current-route", value: newRoute })

      // & register this new route as currentRoute in local and in Routers store
      currentRouteRef.current = newRoute
      Routers.currentRoute = newRoute
      Routers.isFirstRoute = false
    } catch (e) {
      console.error("handleHistory failed", e)
    }
  }

  /**
   * Here we go!
   * Listen history change.
   * If it changes:
   * - Get matching route with current URL
   * - Dispatch new routes states from RouterContext
   */
  const historyListener = useMemo(() => {
    if (!routes) return

    const historyListener = () => {
      if (staticLocation && history) {
        console.error(`You can't set history and staticLocation props together, return.`)
        return
      }
      // server
      if (staticLocation) {
        handleHistory(staticLocation)
        return
        // client
      } else if (history) {
        let url =
          history.location.pathname + history.location.search + history.location.hash
        if (props.isHashHistory) {
          url = history.location.pathname + history.location.search
        }
        handleHistory(url)

        return history?.listen(({ location }) => {
          handleHistory(location.pathname + location.search + location.hash)
        })
        // log error
      } else {
        console.error(`An history or staticLocation props is required, return.`)
        return
      }
    }
    return historyListener()
  }, [routes, history, props.isHashHistory])

  // remove listener
  useEffect(() => {
    return () => {
      log(props.id, "Stop to listen history.")
      historyListener()
    }
  }, [historyListener, routes, staticLocation])

  // -------------------------------------------------------------------------------- RENDER

  const { currentRoute, previousRoute, routeIndex, previousPageIsMount } = reducerState
  const unmountPreviousPage = () => dispatch({ type: "unmount-previous-page" })

  return (
    <RouterContext.Provider
      children={props.children}
      value={{
        routes,
        base,
        langService,
        history,
        isHashHistory,
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
  )
}

Router.displayName = componentName
const MemoizedRouter = memo(Router)
export { MemoizedRouter as Router }
