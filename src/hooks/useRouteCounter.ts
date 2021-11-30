import { useHistory } from "..";
import { useState } from "react";
import { Routers } from "../api/Routers";

/**
 * use Route Counter
 */
export const useRouteCounter = (): {
  routeCounter: number;
  isFirstRoute: boolean;
  resetCounter: () => void;
} => {
  // get current route count
  const [routeCounter, setRouteCounter] = useState<number>(Routers.routeCounter);
  // check if is first route
  const [isFirstRoute, setIsFirstRoute] = useState<boolean>(Routers.isFirstRoute);
  // handle history
  useHistory(() => {
    Routers.routeCounter = routeCounter + 1;
    setRouteCounter(routeCounter + 1);

    Routers.isFirstRoute = false;
    setIsFirstRoute(false);
  }, [routeCounter, isFirstRoute]);

  // allow to reset counter if needed (after first redirection for example)
  const resetCounter = () => {
    setRouteCounter(1);
    setIsFirstRoute(true);
  };

  return { routeCounter, isFirstRoute, resetCounter };
};
