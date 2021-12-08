import React, { ForwardedRef, forwardRef, useRef } from "react";
import { Link, Router, Stack, useRouter } from "../../src";
import { useStack } from "../../src";
import {
  getPathByRouteName,
  getSubRouterBase,
  getSubRouterRoutes,
  joinPaths,
} from "../../src/core/helpers";
import { transitionsHelper } from "../helper/transitionsHelper";
import { routesList } from "../routes";

const componentName: string = "HelloPage";

interface IProps {}

export const HelloPage = forwardRef((props: IProps, handleRef: ForwardedRef<any>) => {
  const rootRef = useRef(null);

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true),
    playOut: () => transitionsHelper(rootRef.current, false),
  });

  const router = useRouter();
  const path = getPathByRouteName(routesList, "HelloPage");
  return (
    <div className={componentName} ref={rootRef}>
      {componentName}

      <Router
        id={4}
        base={getSubRouterBase(path, router.base, false)}
        routes={getSubRouterRoutes(path, router.routes)}
      >
        <div className={componentName}>
          <nav>
            <ul>
              <li>
                <Link to={{ name: "LaPage" }}>La</Link>
              </li>
              <li>
                <Link to={{ name: "OurPage" }}>Our</Link>
              </li>
            </ul>
          </nav>
          <Stack />
        </div>
      </Router>
    </div>
  );
});

HelloPage.displayName = componentName;
export default HelloPage;
