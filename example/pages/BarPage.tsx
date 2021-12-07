import React, { ForwardedRef, forwardRef, useRef } from "react";
import { Link, Router, Stack, useRouter } from "../../src";
import { useStack } from "../../src";
import {
  getRoutePathByRouteName,
  getSubRouterBase,
  getSubRouterRoutes,
  joinPaths,
} from "../../src/api/helpers";
import { transitionsHelper } from "../helper/transitionsHelper";
import { routesList } from "../routes";

const componentName: string = "BarPage";

interface IProps {}

export const BarPage = forwardRef((props: IProps, handleRef: ForwardedRef<any>) => {
  const rootRef = useRef(null);

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true),
    playOut: () => transitionsHelper(rootRef.current, false),
  });

  const router = useRouter();
  const path = getRoutePathByRouteName(routesList, "BarPage");
  
  return (
    <div className={componentName} ref={rootRef}>
      {componentName}
      <Router
        id={3}
        base={getSubRouterBase(path, router.base, false)}
        routes={getSubRouterRoutes(path, router.routes)}
      >
        <div className={componentName}>
          <nav>
            <ul>
              <li>
                <Link to={{ name: "YoloPage" }}>Yolo</Link>
              </li>
              <li>
                <Link to={{ name: "HelloPage" }}>Hello (has sub router)</Link>
              </li>
            </ul>
          </nav>
          <Stack />
        </div>
      </Router>
    </div>
  );
});

BarPage.displayName = componentName;
export default BarPage;
