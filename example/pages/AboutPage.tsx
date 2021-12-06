import React, { ForwardedRef, forwardRef, useRef } from "react";
import { LangService, useRouter, useStack } from "../../src";
import { transitionsHelper } from "../helper/transitionsHelper";
import { Router } from "../../src";
import { Link } from "../../src";
import { Stack } from "../../src";
import { joinPaths } from "../../src/api/helpers";
import { getLangPath } from "../../src/lang/langHelpers";
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
        base={joinPaths([
          router.base,
          LangService.showLangInUrl() ? "/:lang" : "",
          getLangPath({
            en: "/about",
            fr: "/a-propos",
            de: "/uber",
          }),
        ])}
        routes={
          router.routes.find((route) => {
            const currentRouteLangPath = getLangPath(route.path);
            const selectedRoutePath = getLangPath({
              en: "/about",
              fr: "/a-propos",
              de: "/uber",
            });
            return currentRouteLangPath === selectedRoutePath;
          })?.children
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
