import React, { forwardRef, MutableRefObject, useEffect, useRef } from "react";
import { useHistory, useStack } from "../../src";
import { transitionsHelper } from "../helper/transitionsHelper";
const componentName: string = "HomePage";
const debug = require("debug")(`front:${componentName}`);

interface IProps {}

const HomePage = forwardRef((props: IProps, handleRef: MutableRefObject<any>) => {
  const rootRef = useRef(null);

  const history = useHistory();
  useEffect(() => {
    debug("history form home", history);
  }, [history]);

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
    </div>
  );
});

HomePage.displayName = componentName;
export default HomePage;
