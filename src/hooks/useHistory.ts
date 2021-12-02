import { useEffect, useState } from "react";
import { Routers } from "../api/Routers";
import { useRouter } from "./useRouter";

/**
 * Handle router history
 */
export const useHistory = (
  callback?: (e: { location: any; action: any }) => void,
  deps = [],
  pHistory?
) => {
  const { history: contextHistory } = useRouter();
  const [history, setHistory] = useState<any[]>(Routers.locationsHistory);

  useEffect(() => {
    // handle history change and keep reference
    // @ts-ignore
    if (!contextHistory && !pHistory) {
      console.warn("no contextHistory, return ", contextHistory, pHistory);
      return;
    }
    return (contextHistory || pHistory).listen(
      (event: { action: any; location: any }) => {
        // prepare new history & set it in external singleton
        // (because, we need to start history in new useHistory() with the current locationsHistory)
        Routers.locationsHistory = [...history, event.location];
        // set in local start returned
        setHistory(Routers.locationsHistory);
        // execute callback if exist
        callback?.(event);
      }
    );
  }, [history, ...(deps || [])]);

  // return history array
  return history;
};
