import { useState } from "react";
import { useHistory, useRootRouter } from "..";
import { history } from "../api/history";
import { getUrlByRouteName, TOpenRouteParams } from "../api/helpers";

const componentName = "useLocation";
const debug = require("debug")(`front:${componentName}`);

/**
 * useLocation
 */
export const useLocation = (): [string, (param: string | TOpenRouteParams) => void] => {
  const rootRouter = useRootRouter();

  /**
   * Get dynamic current location
   */
  const [location, setLoc] = useState(window.location.pathname);

  useHistory((event) => {
    setLoc(event.location.pathname);
  }, []);

  /**
   * Prepare setLocation function, who push in history
   * @param args
   */
  function setLocation(args: string | TOpenRouteParams): void {
    if (typeof args === "string") {
      history.push(args);
    }
    // case this is TOpenRouteParams
    if (typeof args === "object" && args.name) {
      history.push(getUrlByRouteName(rootRouter.routes, args));
    }
  }

  return [location, setLocation];
};
