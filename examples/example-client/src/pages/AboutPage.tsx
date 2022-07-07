import React, { ForwardedRef, forwardRef, useRef } from "react";
import {
  getPathByRouteName,
  getSubRouterBase,
  getSubRouterRoutes,
  Stack,
  Link,
  Router,
  useRouter,
  useStack,
} from "@cher-ami/router";
import { transitionsHelper } from "../helper/transitionsHelper";
import {routesList} from "../routes"


const componentName: string = "AboutPage";

const AboutPage = forwardRef((props, handleRef: ForwardedRef<any>) => {
  const rootRef = useRef(null);

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true, { x: -50 }, { x: 0 }),
    playOut: () => transitionsHelper(rootRef.current, false, { x: -0 }, { x: 50 }),
  });

  // prepare routes & base for subRouter
  const router = useRouter();
  const path = getPathByRouteName(routesList, "AboutPage");

  console.log(
    "getSubRouterRoutes(path, router.routes)",
    "/base/about",
    getSubRouterRoutes(path, router.routes)
  );

  return (
    <div className={componentName} ref={rootRef}>
      {componentName}

      <Router
        id={4}
        base={getSubRouterBase(path, router.base, true)}
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

AboutPage.displayName = componentName;
export default AboutPage;
