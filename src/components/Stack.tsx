import React, { useCallback, useContext, useLayoutEffect, useMemo, useRef } from "react";
import { IRouteStack, useRouter } from "..";
import { StackContext } from "./Router";

export type TManageTransitions = {
  previousPage: IRouteStack;
  currentPage: IRouteStack;
  unmountPreviousPage: () => void;
};

interface IProps {
  className?: string;
  manageTransitions?: (T: TManageTransitions) => Promise<void>;
}

const componentName = "Stack";
const debug = require("debug")(`router:${componentName}`);

/**
 * @name Stack
 */
function Stack(props: IProps) {
  // 1 get routes
  const { currentRoute, previousRoute, routeIndex } = useRouter();
  const { unmountPreviousPage, previousPageIsMount } = useContext(StackContext);

  // handle components with refs
  const prevRef = useRef(null);
  const currentRef = useRef(null);

  // Create the default sequential transition used
  // if manageTransitions props doesn't exist
  const sequencialTransition = useCallback(
    ({
      previousPage,
      currentPage,
      unmountPreviousPage,
    }: TManageTransitions): Promise<void> => {
      return new Promise(async (resolve) => {
        const $current = currentPage?.$element;
        if ($current) $current.style.visibility = "hidden";
        if (previousPage) {
          await previousPage?.playOut?.();
          unmountPreviousPage();
        }
        await currentPage?.isReadyPromise?.();
        if ($current) $current.style.visibility = "visible";
        await currentPage?.playIn?.();
        resolve();
      });
    },
    []
  );

  // choose transition
  const selectedTransition = useMemo(
    () => (props.manageTransitions ? props.manageTransitions : sequencialTransition),
    [props.manageTransitions]
  );

  // 2. animate when route state changed
  // need to be "layoutEffect" to play transitions before render, to avoid screen "clip"
  useLayoutEffect(() => {
    if (!currentRoute) {
      debug("local current route doesn't exist, return.");
      return;
    }
    selectedTransition({
      previousPage: prevRef.current,
      currentPage: currentRef.current,
      unmountPreviousPage,
    } as TManageTransitions).then(() => {
      unmountPreviousPage();
    });
  }, [routeIndex]);

  return (
    <div className={[componentName, props.className].filter((e) => e).join(" ")}>
      {previousPageIsMount && previousRoute?.component && (
        <previousRoute.component
          ref={prevRef}
          key={`${previousRoute?.fullUrl || ""}_${routeIndex - 1}`}
          {...(previousRoute.props || {})}
        />
      )}
      {currentRoute?.component && (
        <currentRoute.component
          ref={currentRef}
          key={`${currentRoute?.fullUrl || ""}_${routeIndex}`}
          {...(currentRoute.props || {})}
        />
      )}
    </div>
  );
}

export { Stack };
