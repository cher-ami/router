import { ERouterEvent, TRoute } from "..";
import { useRouter } from "./useRouter";
import { useLayoutEffect, useState } from "react";

const componentName = "useRoutes";
const debug = require("debug")(`front:${componentName}`);

/**
 * useRoutes
 */
export const useRoute = (currentRouteChangeCallback?: () => void, dep: any[] = []) => {
  const router = useRouter();
  const [previousRoute, setPreviousRoute] = useState<TRoute>(router.previousRoute);
  const [currentRoute, setCurrentRoute] = useState<TRoute>(router.currentRoute);

  const handleCurrentRouteChange = (route: TRoute): void => {
    currentRouteChangeCallback?.();
    setCurrentRoute(route);
  };
  const handlePreviousRouteChange = (route: TRoute): void => {
    setPreviousRoute(route);
  };

  useLayoutEffect(() => {
    router.events.on(ERouterEvent.CURRENT_ROUTE_CHANGE, handleCurrentRouteChange);
    router.events.on(ERouterEvent.PREVIOUS_ROUTE_CHANGE, handlePreviousRouteChange);
    return () => {
      router.events.off(ERouterEvent.CURRENT_ROUTE_CHANGE, handleCurrentRouteChange);
      router.events.off(ERouterEvent.PREVIOUS_ROUTE_CHANGE, handlePreviousRouteChange);
    };
  }, dep);

  return {
    previousRoute,
    currentRoute,
    setPreviousRoute,
    setCurrentRoute,
  };
};
