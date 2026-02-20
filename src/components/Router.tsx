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
  // Get parent router context if this is a sub-router
  const parentRouterContext = React.useContext(RouterContext)
  /**
   * Check if is the first router or a sub-router
   * If is the first router, reset Routers store
   */
  const IS_CLIENT_OR_SERVER_ROOT_ROUTER = useMemo(() => {
    // A root router is identified by id === 1 (or undefined/default)
    // Sub-routers have id > 1
    // Use only props.id to identify root router, not Routers.base (which can be set before this check)
    const isRootRouter = props.id === 1 || props.id === undefined

    log(props.id, "IS_CLIENT_OR_SERVER_ROOT_ROUTER", isRootRouter, {
      id: props.id,
      hasStaticLocation: !!props.staticLocation,
      hasHistory: !!props.history,
      hasRoutersBase: !!Routers.base,
    })

    // reset Routers store only for the actual root router on first mount
    if (IS_SERVER && isRootRouter && !Routers.base) {
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
   * For root router, store in Routers.staticLocation
   * For sub-routers, use props.staticLocation directly (don't overwrite Routers.staticLocation)
   */
  if (props.staticLocation && IS_CLIENT_OR_SERVER_ROOT_ROUTER) {
    Routers.staticLocation = props.staticLocation
  }
  // Use props.staticLocation for sub-routers, Routers.staticLocation for root router
  const staticLocation: string | undefined =
    !IS_CLIENT_OR_SERVER_ROOT_ROUTER && props.staticLocation
      ? props.staticLocation
      : Routers.staticLocation

  // Debug log for sub-router staticLocation
  if (!IS_CLIENT_OR_SERVER_ROOT_ROUTER && props.staticLocation) {
    log(props.id, "Sub-router staticLocation", {
      propsStaticLocation: props.staticLocation,
      routersStaticLocation: Routers.staticLocation,
      finalStaticLocation: staticLocation,
    })
  }

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

      // For sub-routers in SSR with staticLocation, use "/" as base for matching
      // because staticLocation is relative to the sub-router's base
      // In client mode, use the actual base since we have the full URL
      const matchingBase =
        IS_SERVER && !IS_CLIENT_OR_SERVER_ROOT_ROUTER && staticLocation ? "/" : props.base

      const matchingRoute = getRouteFromUrl({
        pUrl: url,
        pRoutes: routes,
        pBase: matchingBase,
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

          // For sub-routers, get parent props from parent router's currentRoute
          if (!IS_CLIENT_OR_SERVER_ROOT_ROUTER) {
            // Get parent route from parent router's context (most reliable for sub-routers)
            let parentRouteFromParentRouter = null

            // First try: get from parent router context (if available)
            if (parentRouterContext?.currentRoute) {
              parentRouteFromParentRouter = parentRouterContext.currentRoute
            }
            // Second try: get from Routers.currentRoute._context (if root router has set it)
            else if (
              Routers.currentRoute?._context &&
              Routers.currentRoute._context !== Routers.currentRoute
            ) {
              parentRouteFromParentRouter = Routers.currentRoute._context
            }
            // Third try: get from newRoute._context (if it points to a parent)
            else if (newRoute._context && newRoute._context !== newRoute) {
              parentRouteFromParentRouter = newRoute._context
            }

            if (parentRouteFromParentRouter) {
              // If parent already has props (from initialStaticProps), use them directly
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
                  log(
                    props.id,
                    "Sub-router: got parent props from parent router:",
                    Object.keys(realParentProps),
                  )
                }
              }

              // Also call parent's getStaticProps if exists (to ensure we have latest data)
              if (parentRouteFromParentRouter.getStaticProps) {
                try {
                  const parentProps = await parentRouteFromParentRouter.getStaticProps(
                    parentRouteFromParentRouter.props,
                    langService?.currentLang,
                  )
                  if (parentProps) {
                    mergedProps = { ...mergedProps, ...parentProps }
                  }
                } catch (e) {
                  console.error(
                    `[Router ${props.id}] requestStaticProps failed for parent`,
                    e,
                  )
                }
              }
            } else {
              log(props.id, "Sub-router: no parent route found for getting parent props")
            }
          }
          // For root router, use newRoute._context
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
              }
            } catch (e) {
              console.error("requestStaticProps failed for parent", e)
            }
          }

          // Call getStaticProps of current route
          if (newRoute.getStaticProps) {
            const childProps = await newRoute.getStaticProps(
              newRoute.props,
              langService?.currentLang,
            )
            if (childProps) {
              mergedProps = { ...mergedProps, ...childProps }
            }
          }

          Object.assign(newRoute.props || {}, mergedProps)
          cache.set(urlWithoutHash, mergedProps)
        } catch (e) {
          console.error("requestStaticProps failed", e)
        }
      }

      // SERVER (first route)
      // prettier-ignore
      if (IS_SERVER) {
        if (props.initialStaticProps) {
          log("firstRoute > isServer > assign initialStaticProps to newRoute props & set cache");
          // Assign merged props to current route
          Object.assign(newRoute?.props || {}, props?.initialStaticProps?.props ?? {});
          // Assign parent props to parent if they exist
          if (props.initialStaticProps?.parentProps && newRoute._context && newRoute._context !== newRoute) {
            Object.assign(newRoute._context.props || {}, props.initialStaticProps.parentProps);
            log("firstRoute > isServer > assigned parent props to _context:", newRoute._context.name, props.initialStaticProps.parentProps);
          }
        }
        // For sub-routers, call requestStaticPropsAndCacheIt even without initialStaticProps
        else if (!IS_CLIENT_OR_SERVER_ROOT_ROUTER && newRoute?.getStaticProps) {
          log(props.id, "SSR sub-router: calling requestStaticPropsAndCacheIt for route:", newRoute.name)
          await requestStaticPropsAndCacheIt()
          log(props.id, "SSR sub-router: requestStaticPropsAndCacheIt completed, props:", newRoute.props)
        }
      }
      // CLIENT
      else {
        // CLIENT > FIRST ROUTE
        if (Routers.isFirstRoute) {
          if (props?.initialStaticProps) {
            log(props.id, "firstRoute > isClient > assign initialStaticProps to newRoute props & set cache");
            // Assign merged props to current route
            Object.assign(newRoute?.props ?? {}, props?.initialStaticProps?.props ?? {});
            // Assign parent props to parent if they exist
            if (props.initialStaticProps?.parentProps && newRoute._context && newRoute._context !== newRoute) {
              Object.assign(newRoute._context.props || {}, props.initialStaticProps.parentProps);
              log(props.id, "firstRoute > isClient > assigned parent props to _context:", newRoute._context.name, props.initialStaticProps.parentProps);
            }
            cache.set(urlWithoutHash, newRoute?.props ?? {});
          }
          // For sub-routers, call requestStaticPropsAndCacheIt even without initialStaticProps
          else if (!IS_CLIENT_OR_SERVER_ROOT_ROUTER && newRoute?.getStaticProps) {
            await requestStaticPropsAndCacheIt()
          }
          else if (newRoute?.getStaticProps) {
            log(props.id, "firstRoute > isClient > request getStaticProps & set cache")
            await requestStaticPropsAndCacheIt()
          }
        }
        // For sub-routers that are not in isFirstRoute, also call requestStaticPropsAndCacheIt
        else if (!IS_CLIENT_OR_SERVER_ROOT_ROUTER && newRoute?.getStaticProps) {
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

      // Final process: update context currentRoute from dispatch method \o/ !
      log(
        props.id,
        "handleHistory: dispatching new route:",
        newRoute.name,
        "with props:",
        Object.keys(newRoute.props || {}),
      )
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
        // In SSR, we need to handle this synchronously for sub-routers
        // For root router with initialStaticProps, handleHistory is called but props are already loaded
        // For sub-routers, handleHistory is async and we can't wait in useMemo
        // So we call it but the render will happen before it completes
        // The route will be found and dispatched, but props might not be loaded yet
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
  }, [routes, history, props.isHashHistory, staticLocation])

  // For SSR sub-routers, initialize route synchronously before render
  // This ensures currentRoute is set even if handleHistory hasn't completed yet
  // But we need to preserve parent props from Routers.currentRoute._context
  React.useMemo(() => {
    // Only for sub-routers (id > 1), not root router
    if (
      IS_SERVER &&
      props.id !== 1 &&
      props.id !== undefined &&
      staticLocation &&
      !reducerState.currentRoute
    ) {
      // Find route synchronously without loading props
      const matchingBase = "/"
      const matchingRoute = getRouteFromUrl({
        pUrl: staticLocation,
        pRoutes: routes,
        pBase: matchingBase,
        id: props.id,
        isHashHistory: props.isHashHistory,
      })

      if (matchingRoute) {
        // Preserve parent props from parent router's currentRoute if available
        // Use parent router context first (most reliable)
        let parentRoute = null
        if (parentRouterContext?.currentRoute) {
          parentRoute = parentRouterContext.currentRoute
        } else if (
          Routers.currentRoute?._context &&
          Routers.currentRoute._context !== Routers.currentRoute
        ) {
          parentRoute = Routers.currentRoute._context
        } else if (matchingRoute._context && matchingRoute._context !== matchingRoute) {
          parentRoute = matchingRoute._context
        }

        if (parentRoute) {
          const parentProps = parentRoute.props || {}
          // Extract real parent props (excluding route metadata)
          const realParentProps = {}
          Object.keys(parentProps).forEach((key) => {
            if (!["params", "queryParams", "hash"].includes(key)) {
              realParentProps[key] = parentProps[key]
            }
          })
          // Merge parent props into matchingRoute props
          if (Object.keys(realParentProps).length > 0) {
            Object.assign(matchingRoute.props || {}, realParentProps)
            log(
              props.id,
              "SSR sub-router: preserved parent props:",
              Object.keys(realParentProps),
            )
          }
        }

        log(
          props.id,
          "SSR sub-router: initializing route synchronously:",
          matchingRoute.name,
          "with props:",
          Object.keys(matchingRoute.props || {}),
        )
        dispatch({ type: "update-current-route", value: matchingRoute })
        currentRouteRef.current = matchingRoute
        Routers.currentRoute = matchingRoute
      }
    }
  }, [
    IS_SERVER,
    props.id,
    staticLocation,
    routes,
    props.isHashHistory,
    reducerState.currentRoute,
  ])

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
