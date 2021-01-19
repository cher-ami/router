import React, { useLayoutEffect, useRef, useState } from "react";
import { useRouter, useRoute, IRouteStack, ERouterEvent } from "..";

export type TManageTransitions = {
  previousPage: IRouteStack;
  currentPage: IRouteStack;
  unmountPreviousPage: () => void;
};

interface IProps {
  className?: string;
  manageTransitions: (T: TManageTransitions) => Promise<void>;
}

const componentName = "Stack";
const debug = require("debug")(`front:${componentName}`);

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

    router.events.emit(ERouterEvent.STACK_IS_ANIMATING, true);
    // prepare unmount function
    const unmountPreviousPage = () => setPreviousRoute(null);

    // execute transitions function from outside the stack
    props
      .manageTransitions({
        previousPage: prevRef.current,
        currentPage: currentRef.current,
        unmountPreviousPage,
      } as TManageTransitions)

      // when transitions are ended
      .then(() => {
        debug(router.id, "manageTransitions promise resolve!");
        // if previous page wasn't unmount manually, we force unmount here
        unmountPreviousPage();
        router.events.emit(ERouterEvent.STACK_IS_ANIMATING, false);
      });
  }, [currentRoute]);

  return (
    <div className={componentName}>
      {previousRoute?.component && (
        <previousRoute.component
          ref={prevRef}
          key={index - 1}
          {...(previousRoute.props || {})}
        />
      )}
      {currentRoute?.component && (
        <currentRoute.component
          ref={currentRef}
          key={index}
          {...(currentRoute.props || {})}
        />
      )}
    </div>
  );
}

export { Stack };
