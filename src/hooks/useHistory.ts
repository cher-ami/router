import { useEffect, useRef } from "react";
import { useRouter } from "./useRouter";
const componentName = "useHistory";
const debug = require("debug")(`router:${componentName}`);

/**
 * Handle router history
 */
export const useHistory = (
  callback?: (e: { location: any; action: any }) => void,
  deps = [],
  history?
) => {
  const { history: contextHistory } = useRouter();

  const UNLISTEN_HISTORY = useRef(null);

  useEffect(() => {
    // handle history change and keep reference
    UNLISTEN_HISTORY.current = (contextHistory || history).listen(
      (event: { action: any; location: any }) => {
        // execute callback if exist
        callback?.(event);
      }
    );

    // destroy
    return () => UNLISTEN_HISTORY.current();
  }, [history, ...(deps || [])]);
};
