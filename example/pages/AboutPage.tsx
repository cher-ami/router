import React, { forwardRef, MutableRefObject, useRef } from "react";
import { Router } from "../../src";
import { useStack } from "../../src";
import { transitionsHelper } from "../helper/transitionsHelper";
import { Link } from "../../src";
import { Stack, TManageTransitions } from "../../src";
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
      <Router base={"/about"}>
        <div className={componentName}>
          <nav>
            <ul>
              <li>
                <Link to={`/about/foo`}>Foo</Link>{" "}
              </li>
              <li>
                <Link to={"/about/bar"}>Bar</Link>{" "}
              </li>
              <li>
                <Link to={`/error`}>NotFound route</Link>{" "}
              </li>
            </ul>
          </nav>
          <Stack manageTransitions={manageTransitions} key={"stack-2"} />
        </div>
      </Router>
    </div>
  );
});

AboutPage.displayName = componentName;
export default AboutPage;
