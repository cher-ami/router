import React from "react";
import { IRouterContext } from "./Router";
import debug from "@wbe/debug";
import { IRouteStack } from "../hooks/useStack";
import { useRouter } from "../hooks/useRouter";

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
const log = debug(`router:${componentName}`);

/**
 * @name Stack
 */
function Stack(props: IProps): JSX.Element {
  const {
    staticLocation,
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
      previousPage,
      currentPage,
      unmountPreviousPage,
    }: TManageTransitions): Promise<void> => {
      return new Promise(async (resolve) => {
        const $current = currentPage?.$element;
        if ($current) $current.style.visibility = "hidden";
        if (previousPage) {
          await previousPage.playOut();
          unmountPreviousPage();
        }
        if (currentPage) {
          await currentPage.isReadyPromise();
          if ($current) $current.style.visibility = "visible";
          await currentPage.playIn();
        }
        resolve();
      });
    },
    []
  );

  // 2. animate when route state changed
  React[staticLocation ? "useEffect" : "useLayoutEffect"](() => {
    if (!currentRoute) return;
    (props.manageTransitions || sequencialTransition)({
      previousPage: prevRef.current,
      currentPage: currentRef.current,
      unmountPreviousPage,
    } as TManageTransitions).then(() => {
      unmountPreviousPage();
    });
  }, [routeIndex]);


  const [PrevRoute, CurrRoute] = [
    previousRoute?._context ?? previousRoute,
    currentRoute?._context ?? currentRoute,
  ];

  return (
    <div className={["Stack", props.className].filter((e) => e).join(" ")}>
      {previousPageIsMount && PrevRoute?.component && (
        <PrevRoute.component
          ref={prevRef}
          key={`${PrevRoute._fullUrl || ""}_${routeIndex - 1}`}
          {...(PrevRoute.props || {})}
        />
      )}
      {CurrRoute?.component && (
        <CurrRoute.component
          ref={currentRef}
          key={`${CurrRoute?._fullUrl || ""}_${routeIndex}`}
          {...(CurrRoute.props || {})}
        />
      )}
    </div>
  );
}

export { Stack };
