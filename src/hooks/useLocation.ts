import { useState } from "react";
import { useHistory, useRouter } from "..";
import { createUrl, TOpenRouteParams } from "../api/helpers";
import debug from "@wbe/debug";

const log = debug("router:useLocation");

/**
 * useLocation
 */
export const useLocation = (): [string, (param: string | TOpenRouteParams) => void] => {
  const { history } = useRouter();
  /**
   * Get dynamic current location
   */
  const [pathname, setPathname] = useState(
    history.location?.pathname || window.location.pathname
  );

  useHistory((event) => {
    setPathname(event.location.pathname);
  }, []);

  /**
   * Prepare setLocation function, who push in history
   */
  function setLocation(args: string & TOpenRouteParams): void {
    const url = createUrl(args)
    log('url',url)
    history.push(url);
  }

  return [pathname, setLocation];
};
