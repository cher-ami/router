import React, { ForwardedRef, forwardRef, useRef } from "react";
import { Link, Router, Stack, useRouter } from "../../src";
import { useStack } from "../../src";
import { joinPaths } from "../../src/api/helpers";
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

  return (
    <div className={componentName} ref={rootRef}>
      {componentName}
      <Router
        id={3}
        base={joinPaths([router.base, "/bar"])}
        routes={router.routes.find((route) => route.path === "/bar").children}
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
