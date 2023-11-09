import LangService from "../core/LangService"
import { BrowserHistory, HashHistory, MemoryHistory } from "history"
import { TRoute } from "../components/Router"

export type TRouters = {
  /**
   * Base URL
   */
  base: string
  /**
   * Global routes list
   */
  //rootRoutes: TRoute[]
  routes: TRoute[]
  /**
   * Global browser history
   */
  history: HashHistory | MemoryHistory | BrowserHistory
  /**
   * Global static location
   */
  staticLocation: string
  /**
   * Global route counter increment on each history push
   */
  routeCounter: number
  /**
   * Global is first route state
   * Is first route is true if routerCounter === 1
   */
  isFirstRoute: boolean
  /**
   * Store current route
   * Allows to always know what is last currentRoute path (for LangSerivce)
   */
  currentRoute: TRoute
  /**
   * LangService instance (stored in Router)
   */
  langService: LangService

  /**
   * Cache of getStaticProps Promise results
   */
  staticPropsCache: { [x: string]: any }
}

/**
 * ROUTERS object allows to keep safe globales values between ROUTERS instances
 * This object values do not depend of one single router
 */
export const ROUTERS: TRouters = {
  base: undefined,
  //rootRoutes: undefined,
  routes: undefined,
  history: undefined,
  staticLocation: undefined,
  routeCounter: 1,
  isFirstRoute: true,
  currentRoute: undefined,
  langService: undefined,
  staticPropsCache: {},
}
