import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import { useRouter, useRoute, IRouteStack, ERouterEvent } from "..";

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
  // get current router instance
  const router = useRouter();

  // set number index to component instance
  const [index, setIndex] = useState<number>(0);

  // handle components with refs
  const prevRef = useRef(null);
  const currentRef = useRef(null);

  // Create the default sequential transition used
  // if manageTransitions props doesn't exist
  const sequencialTransition = ({
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
  };

  // choose transition
  const selectedTransition = useMemo(
    () => (props.manageTransitions ? props.manageTransitions : sequencialTransition),
    [props.manageTransitions]
  );

  // 1 get routes
  const { previousRoute, setPreviousRoute, currentRoute } = useRoute(() => {
    setIndex(index + 1);
  }, [index]);

  // 2. animate when route state changed
  // need to be "layoutEffect" to play transitions before render, to avoid screen "clip"
  useLayoutEffect(() => {
    debug(router.id, "routes", { previousRoute, currentRoute });

    if (!currentRoute) {
      debug(router.id, "current route doesn't exist, return.");
      return;
    }

    // prepare unmount function
    const unmountPreviousPage = (): void => {
      setPreviousRoute(null);
    };

    // emit to router event stack animating start state
    router.events.emit(ERouterEvent.STACK_IS_ANIMATING, true);

    // start selected transition
    selectedTransition({
      previousPage: prevRef.current,
      currentPage: currentRef.current,
      unmountPreviousPage,
    } as TManageTransitions)
      // when transitions are ended
      .then(() => {
        // if previous page wasn't unmount manually, we force unmount here
        unmountPreviousPage();

        // emit to router event stack animating end state
        router.events.emit(ERouterEvent.STACK_IS_ANIMATING, false);
      });
  }, [currentRoute]);

  return (
    <div className={[componentName, props.className].filter((e) => e).join(" ")}>
      {previousRoute?.component && (
        <previousRoute.component
          ref={prevRef}
          key={`${previousRoute?.fullUrl || ""}_${index - 1}`}
          {...(previousRoute.props || {})}
        />
      )}
      {currentRoute?.component && (
        <currentRoute.component
          ref={currentRef}
          key={`${currentRoute?.fullUrl || ""}_${index}`}
          {...(currentRoute.props || {})}
        />
      )}
    </div>
  );
}

export { Stack };
