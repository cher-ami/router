import { useHistory } from "../hooks/useHistory"
import { useState } from "react"
import { ROUTERS } from "../core/ROUTERS"

/**
 * use Route Counter
 */
export const useRouteCounter = (): {
  routeCounter: number
  isFirstRoute: boolean
  resetCounter: () => void
} => {
  // get current route count
  const [routeCounter, setRouteCounter] = useState<number>(ROUTERS.routeCounter)
  // check if is first route
  const [isFirstRoute, setIsFirstRoute] = useState<boolean>(ROUTERS.isFirstRoute)
  // handle history
  useHistory(() => {
    ROUTERS.routeCounter = routeCounter + 1
    setRouteCounter(routeCounter + 1)

    ROUTERS.isFirstRoute = false
    setIsFirstRoute(false)
  }, [routeCounter, isFirstRoute])

  // allow to reset counter if needed (after first redirection for example-client)
  const resetCounter = () => {
    setRouteCounter(1)
    setIsFirstRoute(true)
  }

  return { routeCounter, isFirstRoute, resetCounter }
}
