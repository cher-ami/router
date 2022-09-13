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

const componentName = "AboutPage";
function AboutPage(props, handleRef) {
  const rootRef = useRef(null);

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true, { x: -50 }, { x: 0 }),
    playOut: () => transitionsHelper(rootRef.current, false, { x: -0 }, { x: 50 }),
  });

  // Get parent router context
  const { base, routes } = useRouter();

  // Parsed routes list and get path by route name
  const path = "/about";
  const subRouterBase = getSubRouterBase(path, base, true);
  const surRouterRoutes = getSubRouterRoutes(path, routes);

  return (
    <div className={componentName} ref={rootRef}>
      {componentName}
      <br />
      <Link to={"/about/foo"}>Foo</Link>
      <br />
      <Link to={"/about/bar"}>Bar</Link>
      <br />
      <Router id={2} base={subRouterBase} routes={surRouterRoutes}>
        <Stack />
      </Router>
    </div>
  );
}

export default React.forwardRef(AboutPage);
