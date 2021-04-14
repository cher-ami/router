import React, {
  ForwardedRef,
  forwardRef,
  useRef
} from "react";
import { Router } from "../../src";
import { useStack } from "../../src";
import { transitionsHelper } from "../helper/transitionsHelper";
import { Link } from "../../src";
import { Stack } from "../../src";
const componentName: string = "AboutPage";
const debug = require("debug")(`router:${componentName}`);

interface IProps {}

const AboutPage = forwardRef((props: IProps, handleRef: ForwardedRef<any>) => {
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
      <Router base={"/about"}>
        <div className={componentName}>
          <nav>
            <ul>
              <li>
                <Link to={{name: "HomePage", params: {lang: "fr"}}}>Foo EN</Link>{" "}
              </li>
              <li>
                <Link to={"/about/bar"}>Bar</Link>{" "}
              </li>
              <li>
                <Link to={`/error`}>NotFound route</Link>{" "}
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
