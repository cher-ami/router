import React, { ForwardedRef, forwardRef, useEffect, useRef } from "react";
import { useHistory, useStack } from "../../src";
import { transitionsHelper } from "../helper/transitionsHelper";
const componentName: string = "HomePage";
const debug = require("debug")(`router:${componentName}`);

interface IProps {
  params: {
    lang: string;
  };
}

const HomePage = forwardRef((props: IProps, handleRef: ForwardedRef<any>) => {
  const rootRef = useRef(null);

  const history = useHistory();
  useEffect(() => {
    debug("history form home", history);
  }, [history]);

  useEffect(() => {
    debug("props.params.lang", props.params.lang);
  }, [props.params.lang]);

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
