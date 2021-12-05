import React, { ForwardedRef, forwardRef, useRef } from "react";
import { useStack } from "../../src";
import { transitionsHelper } from "../helper/transitionsHelper";
import { Router } from "../../src";
import { Link } from "../../src";
import { Stack } from "../../src";
import { routesList } from "../routes";
import { createMemoryHistory } from "history";
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

  return (
    <div className={componentName} ref={rootRef}>
      {componentName}

      <Router
        id={2}
        base={"/base/about"}
        //history={createMemoryHistory()}
        routes={routesList.find((route) => route.path === "/about").children}
      >
        <div className={componentName}>
          <nav>
            <ul>
              <li>
                <Link to={{ name: "FooPage" }}>Foo</Link>
              </li>
              <li>
                <Link to={{ name: "BarPage" }}>Bar</Link>{" "}
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
