import React from "react";
import { IRouteStack, useRouter } from "..";
import { IRouterContext } from "./Router";
import debug from "@wbe/debug";

export type TManageTransitions = {
  previousRoute: IRouteStack;
  currentRoute: IRouteStack;
  unmountPreviousPage: () => void;
};

interface IProps {
  className?: string;
  manageTransitions?: (T: TManageTransitions) => Promise<void>;
}

const componentName = "Stack";
const log = debug(`router:${componentName}`);

/**
 * @name Stack
 */
function Stack(props: IProps): JSX.Element {
  const {
    routeIndex,
    currentRoute,
    previousRoute,
    unmountPreviousPage,
    previousPageIsMount,
  } = useRouter() as IRouterContext;

  const prevRef = React.useRef<IRouteStack>(null);
  const currentRef = React.useRef<IRouteStack>(null);

  // Create the default sequential transition used
  // if manageTransitions props doesn't exist
  const sequencialTransition = React.useCallback(
    ({
      previousRoute,
      currentRoute,
      unmountPreviousPage,
    }: TManageTransitions): Promise<void> => {
      return new Promise(async (resolve) => {
        const $current = currentRoute?.$element;
        if ($current) $current.style.visibility = "hidden";
        if (previousRoute) {
          await previousRoute?.playOut();
          unmountPreviousPage();
        }
        await currentRoute?.isReadyPromise();
        if ($current) $current.style.visibility = "visible";
        await currentRoute?.playIn();
        resolve();
      });
    },
    []
  );

  // 2. animate when route state changed
  // need to be "layoutEffect" to play transitions before render, to avoid screen "clip"
  React.useLayoutEffect(() => {
    if (!currentRoute) {
      log("local current route doesn't exist, return.");
      return;
    }

    (props.manageTransitions || sequencialTransition)({
      previousRoute: prevRef.current,
      currentRoute: currentRef.current,
      unmountPreviousPage,
    } as TManageTransitions).then(() => {
      unmountPreviousPage();
    });
  }, [routeIndex, props.manageTransitions]);

  return (
    <div className={["Stack", props.className].filter((e) => e).join(" ")}>
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
