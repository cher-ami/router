import React, { ForwardedRef, forwardRef, useRef } from "react";
import { langMiddleware, LangService, Routers, useRouter, useStack } from "../../src";
import { transitionsHelper } from "../helper/transitionsHelper";
import { Router } from "../../src";
import { Link } from "../../src";
import { Stack } from "../../src";
import { routesList } from "../routes";
import { compileUrl, joinPaths } from "../../src/api/helpers";
import { getLangPathByPath } from "../../src/lang/langHelpers";
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

  const router = useRouter();

  return (
    <div className={componentName} ref={rootRef}>
      {componentName}

      <Router
        id={2}
        base={joinPaths([router.base, "/:lang", "/about"])}
        routes={
          router.routes.find(
            (route) =>
              getLangPathByPath({ path: route.path }) ===
              getLangPathByPath({ path: "/:lang/about" })
          )?.children
        }
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
