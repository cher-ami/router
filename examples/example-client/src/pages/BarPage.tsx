import React, { ForwardedRef, forwardRef, useRef } from "react";
import {
  getPathByRouteName,
  getSubRouterBase,
  getSubRouterRoutes,
  useStack,
  Link,
  Router,
  Stack,
  useRouter,
} from "@cher-ami/router";
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
    playIn: () => transitionsHelper(rootRef.current, true, { y: -20 }, { y: 0 }),
    playOut: () => transitionsHelper(rootRef.current, false, { y: -0 }, { y: 20 }),
  });

  const router = useRouter();
  const path = getPathByRouteName(routesList, "BarPage");
  console.log("getPathByRouteName", path);

  console.log(
    "getSubRouterRoutes(path, router.routes)",
    getSubRouterRoutes(path, router.routes)
  );

  return (
    <div className={componentName} ref={rootRef}>
      {componentName}
      <Router
        id={3}
        base={getSubRouterBase(path, router.base, true)}
        routes={getSubRouterRoutes(path, router.routes)}
      >
        <div className={componentName}>
          <nav>
            <ul>
              <li>
                <Link to={{ name: "YoloPage" }}>Yolo</Link>
              </li>
              <li>
                <Link to={{ name: "HelloPage" }}>Hello</Link>
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
