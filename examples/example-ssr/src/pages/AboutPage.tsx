import React, { useRef } from "react";
import {
  useStack,
  getSubRouterBase,
  getSubRouterRoutes,
  Link,
  Router,
  Stack,
  useRouter,
} from "@cher-ami/router";
import { transitionsHelper } from "../helpers/transitionsHelper";
import { getPathByRouteName } from "@cher-ami/router";
import debug from "@wbe/debug";
import { useLang } from "@cher-ami/router";
import { EPages } from "../routes";

const componentName = "AboutPage";
const log = debug(`front:${componentName}`);

function AboutPage(props, handleRef) {
  const rootRef = useRef(null);
  const [lang] = useLang();

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true, { x: -50 }, { x: 0 }),
    playOut: () => transitionsHelper(rootRef.current, false, { x: -0 }, { x: 50 }),
  });

  // prepare routes & base for subRouter
  const router = useRouter();
  const path = getPathByRouteName(router.routes, EPages.ABOUT);
  const subRouterBase = getSubRouterBase(path, router.base, true);
  const surRouterRoutes = getSubRouterRoutes(path, router.routes);

  return (
    <div className={componentName} ref={rootRef}>
      {componentName} {lang.key}
      <br />
      <Link to={{ name: EPages.FOO }}>Foo</Link>
      <br />
      <Link to={{ name: EPages.BAR }}>Bar</Link>
      <br />
      <Router id={2} base={subRouterBase} routes={surRouterRoutes}>
        <Stack />
      </Router>
    </div>
  );
}

export default React.forwardRef(AboutPage);
