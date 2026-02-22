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
import {
  getNotFoundRoute,
  getRouteFromUrl,
  getSubRouterStaticLocation,
} from "../core/core"
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
  /** True when this Router is nested inside another Router (id > 1) */
  isSubRouter?: boolean
  /** SSR static props from root; pass to sub-routers so they render with data on first paint */
  initialStaticProps?: {
    props: any
    name: string
    url: string
    parentProps?: any
    parentName?: string
    /** Props for child route when URL matches a nested path (e.g. /about/foo) */
    childRouteProps?: { props: any; name: string }
  }
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
  isSubRouter: false,
  initialStaticProps: undefined,
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
    /** Set to true when this Router is nested inside another Router. Ensures correct tag (div vs main) and avoids hydration mismatch. */
    isSubRouter?: boolean
    initialStaticProps?: {
      props: any
      name: string
      url: string
      parentProps?: any
      parentName?: string
      childRouteProps?: { props: any; name: string }
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

  /**
   * 5. reset is fist route visited
   */
  if (IS_SERVER) {
    Routers.isFirstRoute = true
  }

  // -------------------------------------------------------------------------------- ROUTE CHANGE

  // Sub-routers: when staticLocation is missing on client (e.g. root has no staticLocation),
  // derive it from parent so first client render matches server HTML and avoids hydration mismatch.
  const effectiveStaticLocationForInit =
    props.id !== 1 && props.id !== undefined
      ? (props.staticLocation ??
        (parentRouterContext?.history
          ? getSubRouterStaticLocation(
              parentRouterContext.staticLocation ??
                parentRouterContext.history.location.pathname +
                  parentRouterContext.history.location.search +
                  parentRouterContext.history.location.hash,
              props.base ?? "/",
            )
          : undefined))
      : props.staticLocation

  const defaultReducerState = {
    currentRoute: undefined as TRoute,
    previousRoute: undefined as TRoute,
    previousPageIsMount: false,
    routeIndex: 0,
  }

  /**
   * States list muted when history change.
   * On client with initialStaticProps (hydration), init state from SSR route so first paint
   * matches server HTML and avoids "Did not expect server HTML to contain a <div> in <main>" hydration mismatch.
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
      routes,
      history: props.history,
      initialStaticProps: props.initialStaticProps,
      base: props.base ?? "/",
      id: props.id,
      isHashHistory: props.isHashHistory,
      staticLocation: effectiveStaticLocationForInit,
    },
    (initArg: {
      routes: TRoute[]
      history: BrowserHistory | HashHistory | MemoryHistory | undefined
      initialStaticProps?: typeof props.initialStaticProps
      base: string
      id?: number | string
      isHashHistory?: boolean
      staticLocation?: string
    }) => {
      if (typeof window === "undefined") return defaultReducerState

      // Sub-routers (id > 1): init currentRoute from staticLocation so first client render
      // matches server HTML and avoids hydration mismatch.
      const isSub = initArg?.id !== 1 && initArg?.id !== undefined
      if (isSub && initArg?.staticLocation && initArg?.routes) {
        const matchingRoute = getRouteFromUrl({
          pUrl: initArg.staticLocation,
          pRoutes: initArg.routes,
          pBase: "/",
          id: initArg.id,
          isHashHistory: initArg.isHashHistory,
        })
        if (matchingRoute) {
          // Merge staticProps: prefer childRouteProps (for sub-routers), else props when name matches
          const isp = initArg?.initialStaticProps
          const target =
            isp?.childRouteProps ??
            (isp?.props &&
            (isp.name === matchingRoute.name ||
              isp.name === matchingRoute.component?.displayName)
              ? { props: isp.props, name: isp.name }
              : null)
          if (target?.props) {
            Object.assign(matchingRoute.props ?? {}, target.props)
          }
          return { ...defaultReducerState, currentRoute: matchingRoute }
        }
      }

      // Root router (id === 1): init from initialStaticProps + history
      if (!initArg?.initialStaticProps || !initArg?.history || initArg?.id !== 1)
        return defaultReducerState
      let url =
        initArg.history.location.pathname +
        initArg.history.location.search +
        initArg.history.location.hash
      if (initArg.isHashHistory) {
        url = initArg.history.location.pathname + initArg.history.location.search
      }
      const matchingRoute = getRouteFromUrl({
        pUrl: url,
        pRoutes: initArg.routes,
        pBase: initArg.base,
        id: initArg.id,
        returnParentForNestedRoutes: initArg.id === 1,
      })
      if (!matchingRoute) return defaultReducerState
      Object.assign(matchingRoute?.props ?? {}, initArg.initialStaticProps?.props ?? {})
      if (
        initArg.initialStaticProps?.parentProps &&
        matchingRoute._context &&
        matchingRoute._context !== matchingRoute
      ) {
        Object.assign(
          matchingRoute._context.props || {},
          initArg.initialStaticProps.parentProps,
        )
      }
      return {
        ...defaultReducerState,
        currentRoute: matchingRoute,
      }
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
        returnParentForNestedRoutes: IS_CLIENT_OR_SERVER_ROOT_ROUTER,
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
          log("firstRoute > isServer > assign initialStaticProps to newRoute props & set cache")
          Object.assign(newRoute?.props || {}, props?.initialStaticProps?.props ?? {});
          if (props.initialStaticProps?.parentProps && newRoute._context && newRoute._context !== newRoute) {
            Object.assign(newRoute._context.props || {}, props.initialStaticProps.parentProps);
            log("firstRoute > isServer > assigned parent props to _context:", newRoute._context.name, props.initialStaticProps.parentProps)
          }
        }
        else if (!IS_CLIENT_OR_SERVER_ROOT_ROUTER && newRoute?.getStaticProps) {
          await requestStaticPropsAndCacheIt()
        }
      }
      // CLIENT
      else {
        // CLIENT > FIRST ROUTE
        if (Routers.isFirstRoute) {
          if (props?.initialStaticProps) {
            log(props.id, "firstRoute > isClient > assign initialStaticProps to newRoute props & set cache")
            Object.assign(newRoute?.props ?? {}, props?.initialStaticProps?.props ?? {});
            if (props.initialStaticProps?.parentProps && newRoute._context && newRoute._context !== newRoute) {
              Object.assign(newRoute._context.props || {}, props.initialStaticProps.parentProps);
              log(props.id, "firstRoute > isClient > assigned parent props to _context:", newRoute._context.name, props.initialStaticProps.parentProps)
            }
            cache.set(urlWithoutHash, newRoute?.props ?? {});
          }
          else if (!IS_CLIENT_OR_SERVER_ROOT_ROUTER && newRoute?.getStaticProps) {
            await requestStaticPropsAndCacheIt()
          }
          else if (newRoute?.getStaticProps) {
            log(props.id, "firstRoute > isClient > request getStaticProps & set cache")
            await requestStaticPropsAndCacheIt()
          }
        }
        else if (!IS_CLIENT_OR_SERVER_ROOT_ROUTER && newRoute?.getStaticProps) {
          await requestStaticPropsAndCacheIt()
        }
        else {
          const cacheData = cache.get(urlWithoutHash)
          if (cacheData) {
            log(props.id, "not firstRoute > isClient > assign dataFromCache to newRoute.props")
            Object.assign(newRoute?.props, cacheData);
          }
          else if (newRoute?.getStaticProps) {
            log(props.id, "not firstRoute > isClient > request getStaticProps")
            await requestStaticPropsAndCacheIt()
          }
        }
      }

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
        // Sub-routers: route is set synchronously by useMemo below; skip handleHistory to avoid
        // double dispatch (previousRoute + currentRoute both set → double render of child).
        if (!IS_CLIENT_OR_SERVER_ROOT_ROUTER) return
        handleHistory(staticLocation)
        return
        // client
      } else if (history) {
        let url =
          history.location.pathname + history.location.search + history.location.hash
        if (props.isHashHistory) {
          url = history.location.pathname + history.location.search
        }
        // When state was initialized from initialStaticProps (hydration), skip initial handleHistory to avoid duplicate dispatch and keep DOM in sync with server.
        const hydratedWithInitialRoute =
          typeof window !== "undefined" &&
          props.initialStaticProps &&
          props.id === 1 &&
          reducerState.currentRoute
        if (hydratedWithInitialRoute) {
          currentRouteRef.current = reducerState.currentRoute
          Routers.currentRoute = reducerState.currentRoute
          Routers.isFirstRoute = false
        } else {
          handleHistory(url)
        }

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
        // Use child's props (childRouteProps) so SSR matches client; parent props would cause hydration mismatch
        const isp = props.initialStaticProps
        const target =
          isp?.childRouteProps ??
          (isp?.props &&
          (isp.name === matchingRoute.name ||
            isp.name === matchingRoute.component?.displayName)
            ? { props: isp.props, name: isp.name }
            : null)
        if (target?.props) {
          Object.assign(matchingRoute.props ?? {}, target.props)
        } else {
          // Fallback: preserve parent props (legacy, may cause hydration mismatch if client has childRouteProps)
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
            const realParentProps = {}
            Object.keys(parentProps).forEach((key) => {
              if (!["params", "queryParams", "hash"].includes(key)) {
                realParentProps[key] = parentProps[key]
              }
            })
            if (Object.keys(realParentProps).length > 0) {
              Object.assign(matchingRoute.props ?? {}, realParentProps)
            }
          }
        }

        log(props.id, "sub-router init route:", matchingRoute.name)
        dispatch({ type: "update-current-route", value: matchingRoute })
        currentRouteRef.current = matchingRoute
        Routers.currentRoute = matchingRoute
      }
    }
  }, [
    IS_SERVER,
    props.id,
    props.initialStaticProps,
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

  // Explicit prop wins; otherwise derive from id so value is always defined (avoids hydration mismatch)
  const isSubRouterValue = props.isSubRouter ?? (props.id !== 1 && props.id !== undefined)

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
        isSubRouter: isSubRouterValue,
        initialStaticProps: props.initialStaticProps,
      }}
    />
  )
}

Router.displayName = componentName
const MemoizedRouter = memo(Router)
export { MemoizedRouter as Router }
