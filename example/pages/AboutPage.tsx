import React, { ForwardedRef, forwardRef, useRef } from "react";
import { useRouter, useStack } from "../../src";
import { transitionsHelper } from "../helper/transitionsHelper";
import { Router } from "../../src";
import { Link } from "../../src";
import { Stack } from "../../src";
import {
  getPathByRouteName,
  getSubRouterBase,
  getSubRouterRoutes,
} from "../../src/core/helpers";
import { routesList } from "../routes";
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
          <Stack />
        </div>
      </Router>
    </div>
  );
});

AboutPage.displayName = componentName;
export default AboutPage;
