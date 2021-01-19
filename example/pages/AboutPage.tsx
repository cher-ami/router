import React, { forwardRef, MutableRefObject, useRef } from "react";
import { Router } from "../../src";
import { useStack } from "../../src";
import { transitionsHelper } from "../helper/transitionsHelper";
import { Link } from "../../src";
import { Stack, TManageTransitions } from "../../src";
import { useRouter } from "../../src";
import { routesList } from "../index";
const componentName: string = "AboutPage";
const debug = require("debug")(`front:${componentName}`);

interface IProps {}

const AboutPage = forwardRef((props: IProps, handleRef: MutableRefObject<any>) => {
  const rootRef = useRef(null);

  useStack({
    componentName,
    handleRef,
    rootRef,
    playIn: () => transitionsHelper(rootRef.current, true),
    playOut: () => transitionsHelper(rootRef.current, false),
  });

  /**
   * Manage Router Stack Transitions
   * @param previousPage
   * @param currentPage
   * @param unmountPreviousPage
   */
  const manageTransitions = ({
    previousPage,
    currentPage,
    unmountPreviousPage,
  }: TManageTransitions): Promise<void> => {
    return new Promise(async (resolve) => {
      debug("> previousPage", previousPage);
      debug("> currentPage", currentPage);

      const $prev = previousPage?.$element;
      const $current = currentPage?.$element;
      debug("> $elements", { $prev, $current });

      if ($current) $current.style.visibility = "hidden";

      if (previousPage) {
        await previousPage?.playOut?.();
        debug("> previousPage playOut ended");

        unmountPreviousPage();
        debug("previousPage unmount");
      }

      await currentPage?.isReadyPromise?.();

      if ($current) $current.style.visibility = "visible";

      await currentPage?.playIn?.();
      debug("> currentPage playIn ended");

      resolve();
    });
  };

  return (
    <div className={componentName} ref={rootRef}>
      {componentName}
      <AboutPageNestedRouter base={"/about"}>
        <div className={componentName}>
          <nav>
            <ul>
              <li>
                <Link to={`/about/foo`}>Foo</Link>{" "}
              </li>
              <li>
                <Link to={"/about/bar"}>Bar</Link>{" "}
              </li>
            </ul>
          </nav>
          <Stack manageTransitions={manageTransitions} key={"stack-2"} />
        </div>
      </AboutPageNestedRouter>
    </div>
  );
});

/**
 * AboutPage nested router
 * @param props
 * TODO On aura plus besoin de cette logique qui sera intégrée à <Router />
 */
const AboutPageNestedRouter = (props) => {
  const router = useRouter();
  const nestedBase = `${router.base}${props.base}`.replace("//", "/");
  const routes = routesList.find((el) => el.path === props.base).children;

  return (
    <Router base={nestedBase} key={nestedBase} routes={routes} id={2}>
      {props.children}
    </Router>
  );
};

AboutPage.displayName = componentName;
export default AboutPage;
