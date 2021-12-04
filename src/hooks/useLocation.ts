import { useState } from "react";
import { useHistory } from "../hooks/useHistory";
import { createUrl, TOpenRouteParams } from "../api/helpers";
import debug from "@wbe/debug";

const log = debug("router:useLocation");

/**
 * useLocation
 */
export const useLocation = (): [string, (param: string | TOpenRouteParams) => void] => {
  const history = useHistory();
  /**
   * Get dynamic current location
   */
  const [pathname, setPathname] = useState(window.location.pathname);

  useHistory((event) => {
    setPathname(event.location.pathname);
  }, []);

  /**
   * Prepare setLocation function, who push in history
   */
  function setLocation(args: string & TOpenRouteParams): void {
    history.push(createUrl(args));
  }

  return [pathname, setLocation];
};
