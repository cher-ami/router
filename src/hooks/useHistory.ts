import { useEffect, useRef, useState } from "react";
import { ROUTERS } from "../api/routers";

const componentName = "useHistory";
const debug = require("debug")(`front:${componentName}`);

// keep global location history outside the scope
//let locationsHistory = [ROUTERS.history.location];
/**
 * Handle router history
 */
export const useHistory = (
  callback?: (e: { location: any; action: any }) => void,
  deps = []
) => {
  const UNLISTEN_HISTORY = useRef(null);
  const [history, setHistory] = useState<any[]>(ROUTERS.locationsHistory);

  useEffect(() => {
    // handle history change and keep reference
    UNLISTEN_HISTORY.current = ROUTERS.history.listen(
      (event: { action: any; location: any }) => {
        // prepare new history
        const newHistory = [...history, event.location];
        // set it in external singleton
        // (because, we need to start history in new useHistory() with the current locationsHistory)
        ROUTERS.locationsHistory = newHistory;
        // set in local start returned
        setHistory(newHistory);
        // execute callback if exist
        callback?.(event);
      }
    );

    // destroy
    return () => UNLISTEN_HISTORY.current();
  }, [history, ...(deps || [])]);

  // return history array
  return history;
};
