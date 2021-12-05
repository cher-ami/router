import React, { ForwardedRef, forwardRef, useRef } from "react";
import { Link, Router, Stack, useRouter } from "../../src";
import { useStack } from "../../src";
import { joinPaths } from "../../src/api/helpers";
import { transitionsHelper } from "../helper/transitionsHelper";

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
  return (
    <div className={componentName} ref={rootRef}>
      {componentName}

      <Router
        id={4}
        base={joinPaths([router.base, "/hello"])}
        routes={router.routes.find((route) => route.path === "/hello").children}
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
