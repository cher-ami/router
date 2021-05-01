import { useEffect, useRef } from "react";
import { useRouter } from "./useRouter";

/**
 * Handle router history
 */
export const useHistory = (
  callback?: (e: { location: any; action: any }) => void,
  deps = []
) => {
  const { history } = useRouter();

  const UNLISTEN_HISTORY = useRef(null);

  useEffect(() => {
    // handle history change and keep reference
    UNLISTEN_HISTORY.current = history.listen((event: { action: any; location: any }) => {
      // execute callback if exist
      callback?.(event);
    });

    // destroy
    return () => UNLISTEN_HISTORY.current();
  }, [history, ...(deps || [])]);
};
