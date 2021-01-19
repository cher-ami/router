import { useHistory } from "..";
import { useState } from "react";

const componentName = "useLocation";
const debug = require("debug")(`front:${componentName}`);

// constants
const initialCount = 1;
const initialIsFirstRoute = true;
let GLOBAL_ROUTE_COUNTER = initialCount;
let GLOBAL_IS_FIRST_ROUTE = initialIsFirstRoute;

/**
 * use Route Counter
 */
export const useRouteCounter = (): {
  routeCounter: number;
  isFirstRoute: boolean;
  resetCounter: () => void;
} => {
  // get current route count
  const [routeCounter, setRouteCounter] = useState<number>(GLOBAL_ROUTE_COUNTER);
  // check if is first route
  const [isFirstRoute, setIsFirstRoute] = useState<boolean>(GLOBAL_IS_FIRST_ROUTE);

  // handle history
  useHistory(() => {
    GLOBAL_ROUTE_COUNTER = routeCounter + 1;
    setRouteCounter(routeCounter + 1);

    GLOBAL_IS_FIRST_ROUTE = false;
    setIsFirstRoute(false);
  }, [routeCounter, isFirstRoute]);

  // allow to reset counter if needed (after first redirection for example)
  const resetCounter = () => {
    setRouteCounter(initialCount);
    setIsFirstRoute(initialIsFirstRoute);
  };

  return { routeCounter, isFirstRoute, resetCounter };
};
