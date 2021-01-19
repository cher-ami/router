import { MutableRefObject, useEffect, useImperativeHandle, useMemo } from "react";

const componentName = "useStack";
const debug = require("debug")(`front:${componentName}`);

export interface IUseStack extends Omit<IRouteStack, "$element" | "isReadyPromise"> {
  handleRef: MutableRefObject<any>;
  rootRef: MutableRefObject<any>;
}

export interface IRouteStack {
  componentName: string;
  playIn?: () => Promise<any>;
  playOut?: () => Promise<any>;
  isReady?: boolean;
  $element: HTMLElement;
  isReadyPromise?: () => Promise<void>;
}

/**
 * @name useStack
 * @description Allow to Stack component to handle page information object
 */
export const useStack = ({
  componentName,
  playIn = () => Promise.resolve(),
  playOut = () => Promise.resolve(),
  handleRef,
  rootRef,
  isReady = true,
}: IUseStack) => {
  // create deferred promise who we can resolve in the scope
  const deferredPromise = useMemo(() => {
    const deferred: any = {};
    deferred.promise = new Promise((resolve) => {
      deferred.resolve = resolve;
    });
    return deferred;
  }, []);

  // resolve deferred if isReady param is true
  useEffect(() => {
    isReady && deferredPromise.resolve();
  }, [isReady]);

  useImperativeHandle(
    handleRef,
    () => {
      // Objects properties will be used by Stack
      const handleRouteCallback: IRouteStack = {
        componentName,
        playIn,
        playOut,
        isReady,
        isReadyPromise: () => deferredPromise.promise,
        $element: rootRef.current,
      };

      return handleRouteCallback;
    },
    [deferredPromise]
  );
};
