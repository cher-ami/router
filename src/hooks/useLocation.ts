import { useState } from "react";
import { useHistory } from "../hooks/useHistory";
import { createUrl, TOpenRouteParams } from "../core/helpers";
import debug from "@wbe/debug";
import { useRouter } from "./useRouter";
const log = debug("router:useLocation");

/**
 * useLocation
 */
export const useLocation = (): [string, (param: string | TOpenRouteParams) => void] => {
  const { staticLocation } = useRouter();
  
  const history = useHistory((event) => {
    setPathname(event.location.pathname);
  }, []);

  // Get dynamic current location
  const [pathname, setPathname] = useState(staticLocation || history?.location.pathname);

  // Prepare setLocation function, who push in history
  function setLocation(args: string & TOpenRouteParams): void {
    history?.push(createUrl(args));
  }

  return [pathname, setLocation];
};
