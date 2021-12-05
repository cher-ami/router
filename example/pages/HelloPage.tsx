import React, { ForwardedRef, forwardRef, useRef } from "react";
import { Link, Router, Stack } from "../../src";
import { useStack } from "../../src";
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

  return (
    <div className={componentName} ref={rootRef}>
      {componentName}

      <Router
        id={4}
        base={"/base/about/bar/hello"}
        routes={
          routesList
            .find((route) => route.path === "/about")
            .children.find((route) => route.path === "/bar")
            .children.find((route) => route.path === "/hello").children
        }
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
