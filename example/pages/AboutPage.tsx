import React, { ForwardedRef, forwardRef, useRef } from "react";
import { useRouter, useStack } from "../../src";
import { transitionsHelper } from "../helper/transitionsHelper";
import { Router } from "../../src";
import { Link } from "../../src";
import { Stack } from "../../src";
import {
  getRoutePathByRouteName,
  getSubRouterBase,
  getSubRouterRoutes,
} from "../../src/api/helpers";
import { routesList } from "../routes";
const componentName: string = "AboutPage";

const AboutPage = forwardRef((props, handleRef: ForwardedRef<any>) => {
  const rootRef = useRef(null);

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true),
    playOut: () => transitionsHelper(rootRef.current, false),
  });

  // prepare routes & base for subRouter
  const router = useRouter();
  const path = getRoutePathByRouteName(routesList, "AboutPage");

  return (
    <div className={componentName} ref={rootRef}>
      {componentName}

      <Router
        id={2}
        base={getSubRouterBase(path, router.base)}
        routes={getSubRouterRoutes(path, router.routes)}
      >
        <div className={componentName}>
          <nav>
            <ul>
              <li>
                <Link to={{ name: "FooPage" }}>Foo</Link>
              </li>
              <li>
                <Link to={{ name: "BarPage" }}>Bar (has sub router)</Link>
              </li>
            </ul>
          </nav>
          <Stack key={"about-stack"} />
        </div>
      </Router>
    </div>
  );
});

AboutPage.displayName = componentName;
export default AboutPage;
