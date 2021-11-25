import { useState } from "react";
import { useHistory } from "..";
import { generateUrl, TOpenRouteParams } from "../api/helpers";
import { ROUTERS } from "../api/routers";
import debug from "@wbe/debug";

const log = debug("router:useLocation");

/**
 * useLocation
 * @dec Allow to
 */
export const useLocation = (): [string, (param: string | TOpenRouteParams) => void] => {
  /**
   * Get dynamic current location
   */
  const [location, setLoc] = useState(ROUTERS.history.location.pathname);
  useHistory((event) => {
    setLoc(event.location.pathname);
  }, []);

  /**
   * Prepare setLocation function, who push in history
   * @param args
   */
  function setLocation(args: string & TOpenRouteParams): void {
    const urlToPush = generateUrl(args);
    ROUTERS.history.push(urlToPush);
  }

  return [location, setLocation];
};
